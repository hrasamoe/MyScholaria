import { pool } from "../../db/pool";
import { TuitionInfo } from "./tuition.schema";

export async function createTuition(TuitionData: TuitionInfo, userID: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const insertQuery = `INSERT INTO fee_configurations (
      class_id,
      tuition_fee,
      registration_fee,
      academic_year,
      establishment_id,
      created_by,
      created_at,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
    const now = new Date().toISOString();
    const values = [
      TuitionData.classID,
      TuitionData.tuitionFee,
      TuitionData.registrationFee,
      TuitionData.academicYear,
      TuitionData.establishmentID,
      userID,
      now,
      now,
    ];

    const result = await client.query(insertQuery, values);

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error: any) {
    console.log(error);
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getTuitionList(establishentID: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `SELECT
    fc.id,
    fc.class_id,
    r.name AS room_name,
    c.name AS class_name,
    fc.tuition_fee,
    fc.registration_fee,
    CONCAT_WS(' ', p.first_name, p.last_name) AS teacher_full_name,
    fc.academic_year
  FROM fee_configurations fc
  JOIN classes c ON fc.class_id = c.id
  JOIN teachers t ON c.main_teacher_id = t.id
  JOIN profiles p ON t.profile_id = p.id
  JOIN rooms r ON c.room_id = r.id
  WHERE fc.establishment_id = $1`,
      [establishentID],
    );
    await client.query("COMMIT");
    return result.rows;
  } catch (error: any) {
    console.log(error);
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function editTuition(
  TuitionID: string,
  TuitionData: TuitionInfo,
  userID: string,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const rowsToUpdate = await client.query(
      "SELECT * FROM fee_configurations WHERE id = $1",
      [TuitionID],
    );
    if (rowsToUpdate.rowCount === 0) {
      throw new Error("Tuition not found");
    }
    if (rowsToUpdate.rows[0].created_by !== userID) {
      throw new Error("You are not allowed to modify this Tuition");
    }
    const updateQuery = `UPDATE fee_configurations SET
        tuition_fee = $1, 
        registration_fee = $2,
        academic_year = $3,
        updated_at = $4
      WHERE id = $5 RETURNING *`;
    const now = new Date().toISOString();
    const values = [
      TuitionData.tuitionFee,
      TuitionData.registrationFee,
      TuitionData.academicYear,
      now,
      TuitionID,
    ];
    const result = await client.query(updateQuery, values);
    await client.query("COMMIT");
    return result.rows[0];
  } catch (error: any) {
    console.log(error);
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteTuition(TuitionID: string, userID: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const rowsToDelete = await client.query(
      "SELECT * FROM fee_configurations WHERE id = $1",
      [TuitionID],
    );
    if (rowsToDelete.rows[0].created_by !== userID) {
      throw new Error("You are not allowed to delete this tuition data");
    }
    await client.query("DELETE from fee_configurations WHERE id = $1", [
      TuitionID,
    ]);
    await client.query("COMMIT");
  } catch (error: any) {
    console.log(error);
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
