import { pool } from "../../db/pool";
import { EventInfo } from "./calendar.schema";

export async function createCalendar(userID: string, Event: EventInfo) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const establishment = await client.query(
      "SELECT establishment_id FROM establishment_members WHERE user_id = $1",
      [userID],
    );

    const establishmentID = establishment.rows[0]?.establishment_id;
    if (!establishmentID) {
      throw new Error("User establishment not found");
    }

    let result;

    if (Event.isMultiDay) {
      const queryText = `
        INSERT INTO school_calendar (
          title,
          event_type,
          is_multiple_day,
          description,
          author_id,
          establishment_id,
          start_date,
          end_date,
          start_time,
          end_time,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        RETURNING *
      `;
      const values = [
        Event.title,
        Event.type,
        Event.isMultiDay,
        Event.description || null,
        userID,
        establishmentID,
        Event.startDate,
        Event.endDate,
        Event.startTime,
        Event.endTime,
      ];
      result = await client.query(queryText, values);
    } else {
      const queryText = `
        INSERT INTO school_calendar (
          title,
          event_type,
          is_multiple_day,
          description,
          author_id,
          establishment_id,
          date,
          start_time,
          end_time,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        RETURNING *
      `;
      const values = [
        Event.title,
        Event.type,
        Event.isMultiDay,
        Event.description || null,
        userID,
        establishmentID,
        Event.date,
        Event.startTime,
        Event.endTime,
      ];
      result = await client.query(queryText, values);
    }

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error: any) {
    console.error(error);
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteCalendar(userID: string, eventID: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGGIN");
    await client.query("COMMIT");
  } catch (error: any) {
    console.log(error);
    client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
export async function GetListOfCalendar(establishmentID: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGGIN");
    await client.query("COMMIT");
  } catch (error: any) {
    console.log(error);
    client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
