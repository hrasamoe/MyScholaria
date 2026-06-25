import { pool } from "../../db/pool";
import { SlotInfo } from "./timetable.schema";

export async function createSlot(userID: string, SlotData: SlotInfo) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const insertQuery = `INSERT INTO schedule_slot 
    (subject_id, class_id, day, start_time, end_time, created_by)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const insertValues = [
      SlotData.subjectID,
      SlotData.classID,
      SlotData.day,
      SlotData.startTime,
      SlotData.endTime,
      userID,
    ];
    const insertResult = await client.query(insertQuery, insertValues);
    await client.query("COMMIT");
    return insertResult.rows[0];
  } catch (error: any) {
    console.error(error);
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
