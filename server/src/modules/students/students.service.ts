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
