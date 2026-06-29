import { pool } from "../../db/pool";
import { TuitionInfo } from "./tuition.schema";

export async function creteTuition(TuitionData: TuitionInfo, userID: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const insertQuery = `INSERT INTO fee_configurations (
    class_id,
    tuition_fee,
    late_fee,
    registration_fee,
    academic_year,
    establishment_id,
    created_by,
    created_at,
    updated_at
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *`;
    const values = [
      TuitionData.classID,
      TuitionData.tuitionFee,
      TuitionData.registrationFee,
      TuitionData.academicYear,
      TuitionData.establishmentID,
      userID,
    ];
    const result = await client.query(insertQuery, values);

    await client.query("COMMIT");
    return result;
  } catch (error: any) {
    console.log(error);
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
