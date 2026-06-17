import { pool } from "../../db/pool";
import { MessageInfo } from "./message.schema";

export async function sendMessage(Message: MessageInfo) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const queryText = `INSERT INTO messages (sender_id, recipient_id, body, read_at)
      VALUES ($1, $2, $3, NULL)
      RETURNING id, sender_id, recipient_id, body, send_at, read_at`;
    const result = await client.query(queryText, [
      Message.sender_id,
      Message.recipient_id,
      Message.content,
    ]);
    await client.query("COMMIT");
    return result.rows[0];
  } catch (error: any) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getHistory(userID: string) {
  const client = await pool.connect();
  try {
    const queryText = `
      SELECT 
        CASE 
          WHEN sender_id = $1 THEN recipient_id 
          ELSE sender_id 
        END as member_id,
        MAX(send_at) as last_message_at
      FROM messages
      WHERE sender_id = $1 OR recipient_id = $1
      GROUP BY member_id
      ORDER BY last_message_at DESC
    `;
    const result = await client.query(queryText, [userID]);
    return result.rows;
  } catch (error: any) {
    throw error;
  } finally {
    client.release();
  }
}

export async function getMessages(
  currentUserId: string,
  activeMemberId: string,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const queryText = `SELECT * FROM messages 
      WHERE (sender_id = $1 AND recipient_id = $2) 
         OR (sender_id = $2 AND recipient_id = $1)
      ORDER BY send_at ASC`;
    const result = await client.query(queryText, [
      currentUserId,
      activeMemberId,
    ]);
    await client.query("COMMIT");
    return result.rows;
  } catch (error: any) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
