import { pool } from "../../db/pool";
import { AnnouncementInfo } from "./announcement.schema";

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
      announcementInfo.message,
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

export async function getAnnouncements(establishmentID: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows: announcements } = await client.query(
      "SELECT * FROM announcements WHERE establishment_id = $1",
      [establishmentID],
    );
    const result = announcements.length > 0 ? announcements : null;
    await client.query("COMMIT");
    return result;
  } catch (error: any) {
    console.log(error);
    client.query("ROLLBACK");
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function deleteAnnouncement(announcementID: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `DELETE FROM announcements WHERE id = $1 
       RETURNING *`,
      [announcementID],
    );
    if (rows.length > 0 && rows[0].audience === "all") {
      await client.query(
        "DELETE FROM announcement_targets WHERE announcement_id = $1",
        [rows[0].id],
      );
    }

    await client.query("COMMIT");
  } catch (error: any) {
    console.log(error);
    client.query("ROLLBACK");
    throw new Error(error.message);
  } finally {
    client.release();
  }
}
