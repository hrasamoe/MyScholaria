import { ParentInfo } from "./other.schema";
import { pool } from "../../db/pool";

export async function createParent(
  parentData: ParentInfo,
  establishmentID: any,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const queryText = `
      INSERT INTO profiles (
        first_name, 
        last_name, 
        email,
        profession, 
        gender, 
        address, 
        phone, 
        profile_statut, 
        created_at,
        establishment_id,
        full_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      parentData.firstName,
      parentData.lastName,
      parentData.email,
      parentData.profession,
      parentData.gender,
      parentData.address,
      parentData.phone,
      "parent",
      new Date(),
      establishmentID,
      parentData.fullname,
    ];

    const { rows } = await client.query(queryText, values);

    await client.query("COMMIT");
    return rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getParentList(establishmentID: any) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const queryText = `
    SELECT id, first_name, last_name, gender FROM profiles
    WHERE profile_statut = 'parent'
    AND establishment_id = $1`;
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
