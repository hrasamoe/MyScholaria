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

export async function getSlotsByClass(classID: string) {
  const client = await pool.connect();

  try {
    const selectQuery = `SELECT * FROM schedule_slot WHERE class_id = $1`;
    const selectValues = [classID];
    const selectResult = await client.query(selectQuery, selectValues);
    return selectResult.rows;
  } catch (error: any) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteSlot(slotID: any, userID: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const deleteQuery = `DELETE FROM schedule_slot WHERE id = $1 AND created_by = $2`;
    const deleteValues = [slotID, userID];
    await client.query(deleteQuery, deleteValues);
    await client.query("COMMIT");
  } catch (error: any) {
    console.log(error);
    await client.query("ROLLBACK");
    throw new Error(error);
  } finally {
    client.release();
  }
}

export async function updateSlot(slotID: string, userID: string, slotData: SlotInfo) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const slotToUpdate = await client.query(
      "SELECT * FROM schedule_slot WHERE id = $1 AND created_by = $2",
      [slotID, userID],
    );
    if (slotToUpdate.rows.length === 0) {
      throw new Error("You are not allowed to modify this slot");
    }
    const updateQuery = `UPDATE schedule_slot 
    SET day = $1,
    subject_id = $2,
    start_time = $3, 
    end_time = $4 
    WHERE id = $5 AND created_by = $6 RETURNING *`;
    const updateValues = [
      slotData.day,
      slotData.subjectID,
      slotData.startTime,
      slotData.endTime,
      slotID,
      userID
    ];
    const result = await client.query(updateQuery, updateValues);
    await client.query("COMMIT");
    return result.rows[0];
  } catch (error: any) {
    console.log(error);
    await client.query("ROLLBACK");
    throw new Error(error);
  } finally {
    client.release();
  }
}
