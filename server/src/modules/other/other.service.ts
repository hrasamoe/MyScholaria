import { pool } from "../../db/pool";
import { ParentInfo } from "./other.schema";

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

export async function deleteParent(parentId: any) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const queryText = "DELETE FROM profiles WHERE id = $1";
    await client.query(queryText, [parentId]);
    await client.query("COMMIT");
  } catch (error: any) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getParentDetails(parentId: any) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const queryText =
      "SELECT first_name, last_name, email, profession, gender, address, phone FROM profiles WHERE id = $1";
    const { rows } = await client.query(queryText, [parentId]);
    await client.query("COMMIT");
    return rows[0];
  } catch (error: any) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateParent(parentData: ParentInfo, parentId: any) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const queryText =
      "UPDATE profiles SET first_name = $1, last_name = $2, email = $3, profession = $4, gender = $5, address = $6, phone = $7, full_name = $9 WHERE id = $8";
    const values = [
      parentData.firstName,
      parentData.lastName,
      parentData.email,
      parentData.profession,
      parentData.gender,
      parentData.address,
      parentData.phone,
      parentId,
      parentData.fullname,
    ];
    await client.query(queryText, values);
    await client.query("COMMIT");
  } catch (error: any) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
