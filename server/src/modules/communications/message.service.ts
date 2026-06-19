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
      WHERE deleted = FALSE
        AND (
          (sender_id = $1 AND deleted_by_sender = FALSE)
          OR 
          (recipient_id = $1 AND deleted_by_receiver = FALSE)
        )
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
                        WHERE deleted = FALSE
                          AND (
                            (sender_id = $1 AND recipient_id = $2 AND deleted_by_sender = FALSE)
                            OR 
                            (sender_id = $2 AND recipient_id = $1 AND deleted_by_receiver = FALSE)
                          )
                        ORDER BY send_at ASC
                      `;

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

export async function DeleteMessageForMe(messageID: string, userID: string) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const queryText = `UPDATE messages
    SET 
      deleted_by_sender = CASE WHEN sender_id = $2 THEN TRUE ELSE deleted_by_sender END,
      deleted_by_receiver = CASE WHEN recipient_id = $2 THEN TRUE ELSE deleted_by_receiver END
    WHERE id = $1
    RETURNING *;`;
    const result = await client.query(queryText, [messageID, userID]);
    await client.query("COMMIT");
    return result.rows[0];
  } catch (error: any) {
    console.log(error.message);
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function DeleteMessageForEveryone(
  messageID: string,
  userID: string,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const queryText = `UPDATE messages
    SET deleted = TRUE
    WHERE id = $1 AND sender_id = $2
    RETURNING *`;
    await client.query(queryText, [messageID, userID]);
    await client.query("COMMIT");
  } catch (error: any) {
    console.log(error.message);
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
