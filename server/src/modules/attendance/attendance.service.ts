import { pool } from "../../db/pool";

// Resolves the connected user's profile id and establishment role in
// one query. Everything downstream (which classes they can mark) is
// derived from this.
const getRequesterContext = async (userId: string, establishmentID: string) => {
  const res = await pool.query(
    `SELECT
       p.id AS profile_id,
       em.role_name,
       t.id AS teacher_id
     FROM profiles p
     LEFT JOIN establishment_members em
       ON em.user_id = $1 AND em.establishment_id = $2
     LEFT JOIN teachers t
       ON t.profile_id = p.id AND t.establishment_id = $2
     WHERE p.user_id = $1
     LIMIT 1`,
    [userId, establishmentID],
  );

  if (res.rows.length === 0) {
    throw new Error("Profile not found for this user");
  }

  const row = res.rows[0];
  const isAdminOrStaff =
    row.role_name === "admin" ||
    row.role_name === "staff" ||
    row.role_name === "all";

  return {
    profileId: row.profile_id as string,
    teacherId: row.teacher_id as string | null,
    isAdminOrStaff,
  };
};

// Throws if the requester is not allowed to mark/view attendance for
// this class_subject: must be admin/staff, or the teacher assigned to
// that specific class + subject pairing.
const assertCanAccessClassSubject = async (
  userId: string,
  establishmentID: string,
  classSubjectID: string,
) => {
  const ctx = await getRequesterContext(userId, establishmentID);

  if (ctx.isAdminOrStaff) return ctx;

  if (!ctx.teacherId) {
    throw new Error(
      "You are not authorized to manage attendance for this class",
    );
  }

  const csRes = await pool.query(
    `SELECT cs.id
     FROM class_subjects cs
     JOIN classes c ON c.id = cs.class_id
     WHERE cs.id = $1 AND cs.teacher_id = $2 AND c.establishment_id = $3`,
    [classSubjectID, ctx.teacherId, establishmentID],
  );

  if (csRes.rows.length === 0) {
    throw new Error(
      "You are not authorized to manage attendance for this class",
    );
  }

  return ctx;
};

// List of class+subject pairings the connected user can mark
// attendance for: all of them if admin/staff, only their own if
// teacher.
export const getAccessibleClassSubjects = async (
  userId: string,
  establishmentID: string,
) => {
  const ctx = await getRequesterContext(userId, establishmentID);

  if (ctx.isAdminOrStaff) {
    const res = await pool.query(
      `SELECT cs.id, cs.class_id, c.name AS class_name, cs.subject_id, s.name AS subject_name
       FROM class_subjects cs
       JOIN classes c ON c.id = cs.class_id
       JOIN subjects s ON s.id = cs.subject_id
       WHERE c.establishment_id = $1
       ORDER BY c.name, s.name`,
      [establishmentID],
    );
    return res.rows;
  }

  if (!ctx.teacherId) return [];

  const res = await pool.query(
    `SELECT cs.id, cs.class_id, c.name AS class_name, cs.subject_id, s.name AS subject_name
     FROM class_subjects cs
     JOIN classes c ON c.id = cs.class_id
     JOIN subjects s ON s.id = cs.subject_id
     WHERE cs.teacher_id = $1 AND c.establishment_id = $2
     ORDER BY c.name, s.name`,
    [ctx.teacherId, establishmentID],
  );
  return res.rows;
};

// The roster for a given class+subject+date: every student in that
// class, left-joined to their existing attendance entry for that date
// (if the teacher already started marking, or wants to edit it).
export const getRoster = async (
  userId: string,
  establishmentID: string,
  classSubjectID: string,
  date: string,
) => {
  await assertCanAccessClassSubject(userId, establishmentID, classSubjectID);

  const res = await pool.query(
    `SELECT
       s.id AS student_id,
       p.first_name,
       p.last_name,
       s.student_number,
       a.status,
       a.comment
     FROM class_subjects cs
     JOIN students s ON s.class_id = cs.class_id
     JOIN profiles p ON p.id = s.profile_id
     LEFT JOIN attendance a
       ON a.student_id = s.id AND a.class_subject_id = cs.id AND a.date = $2
     WHERE cs.id = $1
     ORDER BY p.first_name ASC`,
    [classSubjectID, date],
  );
  return res.rows;
};

// Bulk upsert: one row per student for this class_subject + date.
// Uses ON CONFLICT on the unique constraint added in the migration so
// re-marking the same day overwrites rather than duplicates.
export const markAttendance = async (
  userId: string,
  establishmentID: string,
  classSubjectID: string,
  date: string,
  entries: { studentID: string; status: string; comment?: string }[],
) => {
  const ctx = await assertCanAccessClassSubject(
    userId,
    establishmentID,
    classSubjectID,
  );

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const entry of entries) {
      await client.query(
        `INSERT INTO attendance (student_id, class_subject_id, date, status, recorded_by, comment)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (student_id, class_subject_id, date)
         DO UPDATE SET status = EXCLUDED.status, comment = EXCLUDED.comment, recorded_by = EXCLUDED.recorded_by`,
        [
          entry.studentID,
          classSubjectID,
          date,
          entry.status,
          ctx.profileId,
          entry.comment ?? null,
        ],
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// Attendance history for one student across all subjects, most recent
// first. Used for a student's individual attendance record.
export const getStudentAttendanceHistory = async (studentID: string) => {
  const res = await pool.query(
    `SELECT
       a.date,
       a.status,
       a.comment,
       s.name AS subject_name
     FROM attendance a
     JOIN class_subjects cs ON cs.id = a.class_subject_id
     JOIN subjects s ON s.id = cs.subject_id
     WHERE a.student_id = $1
     ORDER BY a.date DESC`,
    [studentID],
  );
  return res.rows;
};

// Quick stats for a class_subject over a date range, e.g. to show an
// attendance rate summary.
export const getAttendanceStats = async (
  userId: string,
  establishmentID: string,
  classSubjectID: string,
  startDate: string,
  endDate: string,
) => {
  await assertCanAccessClassSubject(userId, establishmentID, classSubjectID);

  const res = await pool.query(
    `SELECT
       status,
       COUNT(*) AS count
     FROM attendance
     WHERE class_subject_id = $1 AND date BETWEEN $2 AND $3
     GROUP BY status`,
    [classSubjectID, startDate, endDate],
  );
  return res.rows;
};
