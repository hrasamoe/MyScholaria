import { pool } from "../../db/pool";
import { MessageInfo } from "./message.schema";

export async function sendMessage(Message: MessageInfo, reply_to_id?: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const insertQuery = `
      INSERT INTO messages (sender_id, recipient_id, body, read_at, reply_id)
      VALUES ($1, $2, $3, NULL, $4)
      RETURNING id, sender_id, recipient_id, body, send_at, read_at, reply_id
    `;
    const inserted = await client.query(insertQuery, [
      Message.sender_id,
      Message.recipient_id,
      Message.content,
      reply_to_id ?? null,
    ]);

    const fetchQuery = `
      SELECT 
        m.id, m.sender_id, m.recipient_id, m.body, m.send_at, m.read_at,
        r.id       AS reply_to_id,
        r.body     AS reply_to_body,
        r.sender_id AS reply_to_sender_id
      FROM messages m
      LEFT JOIN messages r ON m.reply_id = r.id
      WHERE m.id = $1
    `;
    const result = await client.query(fetchQuery, [inserted.rows[0].id]);

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
    const queryText = `SELECT 
    m.*,
    r.id AS reply_to_id,
    r.body AS reply_to_body,
    r.sender_id AS reply_to_sender_id
  FROM messages m
  LEFT JOIN messages r ON m.reply_id = r.id
  WHERE m.deleted = FALSE
    AND (
      (m.sender_id = $1 AND m.recipient_id = $2 AND m.deleted_by_sender = FALSE)
      OR 
      (m.sender_id = $2 AND m.recipient_id = $1 AND m.deleted_by_receiver = FALSE)
    )
  ORDER BY m.send_at ASC
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

export async function EditMessage(
  content: string,
  messageID: string,
  userID: string,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const queryText = `UPDATE messages
    SET body = $1, send_at = NOW(), is_edited = TRUE WHERE sender_id = $2 AND id = $3
    RETURNING *`;
    const reponse = await client.query(queryText, [content, userID, messageID]);
    await client.query("COMMIT");
    return reponse.rows[0];
  } catch (error: any) {
    console.log(error.message);
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
