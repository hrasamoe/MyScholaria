import { pool } from "../../db/pool";

// Books

export const getBooks = async (establishmentID: string) => {
  const res = await pool.query(
    `SELECT id, isbn, title, author, publisher, year, category,
            total_copies, available_copies, cover_url, location
     FROM books
     WHERE establishment_id = $1 AND is_archived = false
     ORDER BY title ASC`,
    [establishmentID],
  );
  return res.rows;
};

export const createBook = async (data: any, establishmentID: string) => {
  const res = await pool.query(
    `INSERT INTO books
       (isbn, title, author, publisher, year, category, total_copies,
        available_copies, location, cover_url, establishment_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $7, $8, $9, $10)
     RETURNING *`,
    [
      data.isbn ?? null,
      data.title,
      data.author,
      data.publisher ?? null,
      data.year ?? null,
      data.category ?? null,
      data.totalCopies,
      data.location ?? null,
      data.coverUrl ?? null,
      establishmentID,
    ],
  );
  return res.rows[0];
};

// When total_copies changes, available_copies is shifted by the same
// delta so already-loaned copies are not silently "created" or lost.
export const updateBook = async (id: string, data: any) => {
  const current = await pool.query(
    `SELECT total_copies, available_copies FROM books WHERE id = $1`,
    [id],
  );
  if (current.rows.length === 0) throw new Error("Book not found");

  const delta = data.totalCopies - current.rows[0].total_copies;
  const newAvailable = Math.max(0, current.rows[0].available_copies + delta);

  const res = await pool.query(
    `UPDATE books
     SET isbn = $1, title = $2, author = $3, publisher = $4, year = $5,
         category = $6, total_copies = $7, available_copies = $8,
         location = $9, cover_url = $10
     WHERE id = $11
     RETURNING *`,
    [
      data.isbn ?? null,
      data.title,
      data.author,
      data.publisher ?? null,
      data.year ?? null,
      data.category ?? null,
      data.totalCopies,
      newAvailable,
      data.location ?? null,
      data.coverUrl ?? null,
      id,
    ],
  );
  return res.rows[0];
};

export const deleteBook = async (id: string) => {
  await pool.query(`DELETE FROM books WHERE id = $1`, [id]);
};

// Loans

// Joins book_loans to whichever of students/teachers matches
// borrower_type, then to profiles for the display name. Status is
// recomputed on read (not stored) so an overdue loan is always
// accurate without needing a background job to flip the enum value.
export const getLoans = async (establishmentID: string) => {
  const res = await pool.query(
    `SELECT
       bl.id,
       bl.loan_date,
       bl.due_date,
       bl.return_date,
       bl.fine_amount,
       b.id AS book_id,
       b.title AS book_title,
       b.isbn AS book_isbn,
       bl.borrower_type,
       p.first_name AS borrower_first_name,
       p.last_name AS borrower_last_name,
       CASE
         WHEN bl.status = 'active' AND bl.due_date < CURRENT_DATE THEN 'overdue'
         ELSE bl.status
       END AS status
     FROM book_loans bl
     JOIN books b ON b.id = bl.book_id
     JOIN profiles p ON p.id = bl.borrower_id
     WHERE bl.establishment_id = $1
     ORDER BY bl.loan_date DESC`,
    [establishmentID],
  );
  return res.rows;
};
// borrower_id in book_loans references profiles.id (not students.id or
// teachers.id directly) — the FK constraint enforces this. The
// frontend sends the student/teacher row id, so it must be translated
// to the matching profile_id before insertion.
export const createLoan = async (data: any, establishmentID: string) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const bookRes = await client.query(
      `SELECT available_copies FROM books WHERE id = $1 FOR UPDATE`,
      [data.bookID],
    );
    if (bookRes.rows.length === 0) throw new Error("Book not found");
    if (bookRes.rows[0].available_copies <= 0) {
      throw new Error("No copies available for this book");
    }

    const borrowerTable =
      data.borrowerType === "student" ? "students" : "teachers";
    const borrowerRes = await client.query(
      `SELECT profile_id FROM ${borrowerTable} WHERE id = $1 AND establishment_id = $2`,
      [data.borrowerID, establishmentID],
    );
    if (borrowerRes.rows.length === 0) {
      throw new Error(`${data.borrowerType} not found in this establishment`);
    }
    const profileID = borrowerRes.rows[0].profile_id;

    const loanRes = await client.query(
      `INSERT INTO book_loans
         (book_id, borrower_id, borrower_type, loan_date, due_date, status, establishment_id)
       VALUES ($1, $2, $3, CURRENT_DATE, $4, 'active', $5)
       RETURNING *`,
      [
        data.bookID,
        profileID,
        data.borrowerType,
        data.dueDate,
        establishmentID,
      ],
    );

    await client.query(
      `UPDATE books SET available_copies = available_copies - 1 WHERE id = $1`,
      [data.bookID],
    );

    await client.query("COMMIT");
    return loanRes.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// Marks a loan returned and restores one available copy. fineAmount is
// optional and left to manual entry (e.g. librarian judgment call) —
// there is no automatic late-fee rate configured anywhere in the schema.
export const returnLoan = async (loanID: string, fineAmount?: number) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const loanRes = await client.query(
      `UPDATE book_loans
       SET return_date = CURRENT_DATE, status = 'returned', fine_amount = $2
       WHERE id = $1
       RETURNING book_id`,
      [loanID, fineAmount ?? null],
    );
    if (loanRes.rows.length === 0) throw new Error("Loan not found");

    await client.query(
      `UPDATE books SET available_copies = available_copies + 1 WHERE id = $1`,
      [loanRes.rows[0].book_id],
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const getLibraryStats = async (establishmentID: string) => {
  const res = await pool.query(
    `SELECT
       COALESCE(SUM(b.total_copies), 0) AS total_copies,
       COALESCE(SUM(b.available_copies), 0) AS available_copies,
       (SELECT COUNT(*) FROM book_loans
          WHERE establishment_id = $1 AND status = 'active') AS active_loans,
       (SELECT COUNT(*) FROM book_loans
          WHERE establishment_id = $1 AND status = 'active' AND due_date < CURRENT_DATE) AS overdue_loans
     FROM books b
     WHERE b.establishment_id = $1 AND b.is_archived = false`,
    [establishmentID],
  );
  return res.rows[0];
};

export const archiveBook = async (id: string) => {
  const res = await pool.query(
    `UPDATE books SET is_archived = true WHERE id = $1 RETURNING id`,
    [id],
  );
  if (res.rows.length === 0) throw new Error("Book not found");
};