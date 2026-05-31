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
    contract_type, hourly_rate, created_at, updated_at, establishment_id, qualification
  )
  VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), $7, $8)
`;

    const value = [
      profileID,
      teacherData.IDNumber,
      teacherData.subject,
      teacherData.hire_date,
      teacherData.contractType,
      teacherData.hpw,
      establishmentID,
      teacherData.qualification,
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

export async function getTeacherList(establishmentID: string) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const queryText = `
    SELECT p.id, p.first_name, p.last_name, p.gender, t.contract_type AS "contractType", t.specialization AS subject, t.id AS "pid"
    FROM profiles p
    INNER JOIN teachers t ON  p.id = t.profile_id
    WHERE p.profile_statut = 'teacher'
    AND p.establishment_id = $1 
    `;
    const { rows } = await client.query(queryText, [establishmentID]);
    await client.query("COMMIT");
    return rows;
  } catch (error: any) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getTeacherDetails(teacherID: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const queryText = `
    SELECT p.id, p.first_name, p.last_name, p.gender, p.email, p.phone, p.address, t.employee_number AS "IDNumber", t.specialization AS subject, t.hire_date, t.contract_type AS "contractType", t.hourly_rate AS "hpw", t.qualification
    FROM profiles p
    INNER JOIN teachers t ON  p.id = t.profile_id
    WHERE p.id = $1
    `;
    const { rows } = await client.query(queryText, [teacherID]);
    await client.query("COMMIT");
    return rows[0];
  } catch (error: any) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateTeacher(
  teacherID: string,
  teacherData: TeacherInfo,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const queryText = `
    UPDATE profiles SET
    first_name = $1, last_name = $2, email = $3, gender = $4,
    address = $5, phone = $6, full_name = $7 WHERE id = $8
    `;
    const values = [
      teacherData.firstName,
      teacherData.lastName,
      teacherData.email,
      teacherData.gender,
      teacherData.address,
      teacherData.phone,
      `${teacherData.firstName} ${teacherData.lastName}`,
      teacherID,
    ];
    await client.query(queryText, values);
    const queryText2 = `
    UPDATE teachers SET
    specialization = $1, hire_date = $2, contract_type = $3,
    hourly_rate = $4, qualification = $5, updated_at = NOW()
    WHERE profile_id = $6`;
    const value = [
      teacherData.subject,
      teacherData.hire_date,
      teacherData.contractType,
      teacherData.hpw,
      teacherData.qualification,
      teacherID,
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

export async function deleteTeacher(teacherID: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const queryText = `DELETE FROM profiles WHERE id = $1`;
    await client.query(queryText, [teacherID]);
    const queryText1 = `DELETE FROM teachers WHERE profile_id = $1`;
    await client.query(queryText1, [teacherID]);
    await client.query("COMMIT");
  } catch (error: any) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
