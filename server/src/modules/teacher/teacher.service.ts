import { pool } from "../../db/pool";
import { TeacherInfo } from "./teacher.schema";

export async function createTeacher(
  teacherData: TeacherInfo,
  establishmentID: string,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const queryText = `
      INSERT INTO profiles (first_name, last_name, gender, email, phone, address, created_at, updated_at, establishment_id, full_name, profile_statut)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), $7, $8, 'teacher')
      RETURNING id`;
    const values = [
      teacherData.firstName,
      teacherData.lastName,
      teacherData.gender,
      teacherData.email,
      teacherData.phone,
      teacherData.address,
      establishmentID,
      `${teacherData.firstName} ${teacherData.lastName}`,
    ];

    const { rows } = await client.query(queryText, values);
    const profileID = rows[0].id;
    const queryText2 = `
  INSERT INTO teachers (
    profile_id, employee_number, specialization, hire_date,
    contract_type, hourly_rate, created_at, updated_at, establishment_id
  )
  VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), $7)
`;

    const value = [
      profileID,
      teacherData.IDNumber,
      teacherData.subject,
      teacherData.hire_date,
      teacherData.contractType,
      teacherData.hpw,
      establishmentID,
    ];
    await client.query(queryText2, value);
    await client.query("COMMIT");
  } catch (error: any) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
