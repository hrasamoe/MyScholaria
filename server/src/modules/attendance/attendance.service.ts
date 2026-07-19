import { pool } from "../../db/pool";

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

// subjects.level actually stores the class_id (misleading column name,
// confirmed against subjects.service.ts / Subjects.tsx). subjects.id
// is what attendance.class_subject_id now references.
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

  const subjectRes = await pool.query(
    `SELECT id FROM subjects
     WHERE id = $1 AND teacher_id = $2 AND establishment_id = $3`,
    [classSubjectID, ctx.teacherId, establishmentID],
  );

  if (subjectRes.rows.length === 0) {
    throw new Error(
      "You are not authorized to manage attendance for this class",
    );
  }

  return ctx;
};

export const getAccessibleClassSubjects = async (
  userId: string,
  establishmentID: string,
) => {
  const ctx = await getRequesterContext(userId, establishmentID);

  if (ctx.isAdminOrStaff) {
    const res = await pool.query(
      `SELECT sub.id, sub.level AS class_id, c.name AS class_name, sub.name AS subject_name
       FROM subjects sub
       JOIN classes c ON c.id = sub.level
       WHERE sub.establishment_id = $1
       ORDER BY c.name, sub.name`,
      [establishmentID],
    );
    return res.rows;
  }

  if (!ctx.teacherId) return [];

  const res = await pool.query(
    `SELECT sub.id, sub.level AS class_id, c.name AS class_name, sub.name AS subject_name
     FROM subjects sub
     JOIN classes c ON c.id = sub.level
     WHERE sub.teacher_id = $1 AND sub.establishment_id = $2
     ORDER BY c.name, sub.name`,
    [ctx.teacherId, establishmentID],
  );
  return res.rows;
};

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
     FROM subjects sub
     JOIN students s ON s.class_id = sub.level
     JOIN profiles p ON p.id = s.profile_id
     LEFT JOIN attendance a
       ON a.student_id = s.id AND a.class_subject_id = sub.id AND a.date = $2
     WHERE sub.id = $1
     ORDER BY p.first_name ASC`,
    [classSubjectID, date],
  );
  return res.rows;
};

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

  for (const entry of entries) {
    await pool.query(
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
};

export const getStudentAttendanceHistory = async (studentID: string) => {
  const res = await pool.query(
    `SELECT
       a.date,
       a.status,
       a.comment,
       sub.name AS subject_name
     FROM attendance a
     JOIN subjects sub ON sub.id = a.class_subject_id
     WHERE a.student_id = $1
     ORDER BY a.date DESC`,
    [studentID],
  );
  return res.rows;
};

export const getAttendanceStats = async (
  userId: string,
  establishmentID: string,
  classSubjectID: string,
  startDate: string,
  endDate: string,
) => {
  await assertCanAccessClassSubject(userId, establishmentID, classSubjectID);

  const res = await pool.query(
    `SELECT status, COUNT(*) AS count
     FROM attendance
     WHERE class_subject_id = $1 AND date BETWEEN $2 AND $3
     GROUP BY status`,
    [classSubjectID, startDate, endDate],
  );
  return res.rows;
};
