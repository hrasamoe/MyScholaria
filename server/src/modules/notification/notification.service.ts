import { pool } from "../../db/pool";
import { AnnouncementInfo } from "./notification.schema";

export async function createAnnouncement(
  userID: string,
  announcementInfo: AnnouncementInfo,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const findEstablishment = await client.query(
      "SELECT establishment_id FROM establishment_members WHERE user_id = $1",
      [userID],
    );
    const establishmentID = findEstablishment.rows[0]?.establishment_id;

    if (!establishmentID) {
      throw new Error("User establishment not found");
    }

    const queryText = `
      INSERT INTO announcements (establishment_id, title, message, audience, expires_at, author_id, created_at) 
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING id
    `;

    const announcementValue = [
      establishmentID,
      announcementInfo.title,
      announcementInfo.content,
      announcementInfo.audience,
      announcementInfo.expires_at || null,
      userID,
    ];

    const announcementIDResult = await client.query(
      queryText,
      announcementValue,
    );
    const announcementIDValue = announcementIDResult.rows[0].id;

    if (
      announcementInfo.audience !== "all" &&
      announcementInfo.target_user_ids
    ) {
      for (const targetUserID of announcementInfo.target_user_ids) {
        await client.query(
          "INSERT INTO announcement_targets (announcement_id, user_id) VALUES ($1, $2)",
          [announcementIDValue, targetUserID],
        );
      }
    }

    await client.query("COMMIT");

    return {
      id: announcementIDValue,
      ...announcementInfo,
      establishment_id: establishmentID,
      created_at: new Date().toISOString(),
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
}
