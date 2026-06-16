import { pool } from "../../db/pool";
import { MessageInfo } from "./message.schema";

export async function sendMessage(Message: MessageInfo) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const queryText = `INSERT INTO messages (sender_id, recipient_id, body, read_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, sender_id, recipient_id, body, send_at, read_at`;
    const result = await client.query(queryText, [
      Message.sender_id,
      Message.recipient_id,
      Message.content,
    ]);
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
