import { pool } from "../../db/pool";
import { StudentInfo } from "./students.schema";

export async function createStudent(
  studentData: StudentInfo,
  establishmentID: string,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const profileQuery = `
      INSERT INTO profiles (
        first_name, last_name, email, phone, address,
        date_of_birth, gender, establishment_id, profile_statut
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'student')
      RETURNING id
    `;
    const { rows: newProfile } = await client.query(profileQuery, [
      studentData.firstName,
      studentData.lastName,
      studentData.email || null,
      studentData.phone || null,
      studentData.address || null,
      studentData.dateOfBirth || null,
      studentData.gender || null,
      establishmentID,
    ]);
    const profileId = newProfile[0].id;

    const studentQuery = `
      INSERT INTO students (
        profile_id, class_id, establishment_id,
        student_number, status, medical_notes,
        enrollment_date, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id
    `;
    const { rows: newStudent } = await client.query(studentQuery, [
      profileId,
      studentData.class_id || null,
      establishmentID,
      studentData.student_number,
      studentData.status || "active",
      studentData.medical_notes || null,
      studentData.enrollment_date,
    ]);
    const studentId = newStudent[0].id;

    if (studentData.parent_ids?.length > 0) {
      const parentQuery = `
        INSERT INTO student_parents (student_id, parent_profile_id, created_at)
        VALUES ($1, $2, NOW())
      `;
      for (const parentId of studentData.parent_ids) {
        await client.query(parentQuery, [studentId, parentId]);
      }
    }

    await client.query("COMMIT");
    return { id: studentId, profile_id: profileId };
  } catch (error: any) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getStudentList(establishmentID: string) {
  const client = await pool.connect();
  try {
    const query = `
      SELECT s.id, s.student_number, p.first_name, p.last_name, p.gender, c.name AS class_name
      FROM students s
      JOIN profiles p ON s.profile_id = p.id
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.establishment_id = $1
    `;
    const { rows } = await client.query(query, [establishmentID]);
    return rows;
  } catch (error: any) {
    console.log(error);
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteStudent(studentID: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const getProfileQuery = `
      SELECT profile_id 
      FROM students 
      WHERE id = $1
    `;
    const { rows } = await client.query(getProfileQuery, [studentID]);

    if (rows.length > 0) {
      const profileID = rows[0].profile_id;

      const deleteParentsQuery = `
        DELETE FROM student_parents 
        WHERE student_id = $1
      `;
      await client.query(deleteParentsQuery, [studentID]);

      const deleteStudentQuery = `
        DELETE FROM students 
        WHERE id = $1
      `;
      await client.query(deleteStudentQuery, [studentID]);

      const deleteProfileQuery = `
        DELETE FROM profiles 
        WHERE id = $1
      `;
      await client.query(deleteProfileQuery, [profileID]);
    }

    await client.query("COMMIT");
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.log(error);
    throw error;
  } finally {
    client.release();
  }
}

export async function getStudentDetails(studentID: string) {
  const client = await pool.connect();
  try {
    const query = `
      SELECT 
        s.id,
        s.enrollment_date,
        s.student_number, 
        s.status, 
        s.medical_notes, 
        s.class_id,
        p.first_name, 
        p.last_name, 
        p.email, 
        p.phone, 
        p.address,
        p.date_of_birth, 
        p.gender, 
        c.name AS class_name,
        p_parent.first_name AS parent_first_name,
        p_parent.last_name AS parent_last_name,
        ARRAY_AGG(sp.parent_profile_id) FILTER (WHERE sp.parent_profile_id IS NOT NULL) AS parent_ids
      FROM students s
      JOIN profiles p ON s.profile_id = p.id
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN student_parents sp ON s.id = sp.student_id
      LEFT JOIN profiles p_parent ON sp.parent_profile_id = p_parent.id
      WHERE s.id = $1
      GROUP BY s.id, p.id, c.id, p_parent.id
    `;
    const { rows } = await client.query(query, [studentID]);
    return rows[0];
  } catch (error: any) {
    console.log(error);
    throw error;
  } finally {
    client.release();
  }
}

export async function getStudentMainTeacher(studentID: string) {
  const client = await pool.connect();
  try {
    const queryText = `
      SELECT 
        s.class_id, 
        t.id AS id, 
        t.specialization AS subject, 
        p.first_name, 
        p.last_name,
        p.gender,
        p.id as link_id
      FROM students s
      JOIN classes c ON s.class_id = c.id
      JOIN teachers t ON c.main_teacher_id = t.id
      JOIN profiles p ON t.profile_id = p.id
      WHERE s.id = $1
    `;
    const { rows } = await client.query(queryText, [studentID]);
    return rows[0] || null;
  } catch (error) {
    console.log(error);
    return null;
  } finally {
    client.release();
  }
}