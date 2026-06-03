import { pool } from "../../db/pool";
import { StaffInfo } from "./staff.schema";

export async function createStaff(
  establishementID: string,
  staffData: StaffInfo,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const profiles_request = `
    INSERT INTO profiles (first_name, last_name, gender, phone, address, date_of_birth, email, profile_statut, created_at, updated_at, establishment_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, 'staff', NOW(), NOW(), $8)
    RETURNING id`;
    const profiles_values = [
      staffData.firstName,
      staffData.lastName,
      staffData.gender,
      staffData.phone || null,
      staffData.address || null,
      staffData.birth_date,
      staffData.email || null,
      establishementID,
    ];
    const { rows: staffProfiles } = await client.query(
      profiles_request,
      profiles_values,
    );
    const staff_request = `
    INSERT INTO staff (position, department, hire_date, contract_type, salary, created_at, updated_at, statut, profile_id, establishment_id)
    VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), $6, $7, $8)`;
    const staff_values = [
      staffData.position,
      staffData.departement,
      staffData.hire_date,
      staffData.contract_type,
      staffData.salary,
      staffData.status,
      staffProfiles[0].id,
      establishementID,
    ];
    await client.query(staff_request, staff_values);
    await client.query("COMMIT");
  } catch (error) {
    console.log(error);
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getStaffList(establishementID: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const profiles_request = `
    SELECT s.id, s.position, s.department, p.first_name, p.last_name, p.gender
    FROM staff s
    JOIN profiles p ON s.profile_id = p.id
    WHERE s.establishment_id = $1`;
    const { rows } = await client.query(profiles_request, [establishementID]);
    return rows;
  } catch (error: any) {
    console.log(error);
    throw error;
  } finally {
    client.release();
  }
}
