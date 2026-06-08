import { pool } from "../../db/pool";
import { AnnouncementInfo, NotificationInfo } from "./notification.schema";

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

export async function createNotification(
  userID: string,
  NotificationData: NotificationInfo,
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
    const queryText = `INSERT INTO notifications (establishment_id, author_id, title, message, type, audience, created_at, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7) RETURNING id`;
    const values = [
      establishmentID,
      userID,
      NotificationData.title,
      NotificationData.message,
      NotificationData.type,
      NotificationData.audience,
      NotificationData.expires_at,
    ];
    const notificationResult = await client.query(queryText, values);
    if (
      NotificationData.audience !== "all" &&
      NotificationData.target_user_ids
    ) {
      for (const targetID of NotificationData.target_user_ids) {
        await client.query(
          "INSERT INTO notification_receipts (notification_id, user_id) VALUES ($1, $2)",
          [notificationResult.rows[0].id, targetID],
        );
      }
    } else {
      const { rows: targetUsers } = await client.query(
        "SELECT user_id FROM establishment_members WHERE establishment_id = $1",
        [establishmentID],
      );
      const userIDs = targetUsers.map((u) => u.user_id);
      for (const user_id of userIDs) {
        await client.query(
          "INSERT INTO notification_receipts (notification_id, user_id) VALUES ($1, $2)",
          [notificationResult.rows[0].id, user_id],
        );
      }
    }
    await client.query("COMMIT");
    return {
      id: notificationResult.rows[0].id,
      ...NotificationData,
      created_at: new Date().toISOString(),
    };
  } catch (error: any) {
    console.log(error);
    client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getNotification(establishmentID: string, userID: string) {
  const client = await pool.connect();
  try {
    const queryText = `
      SELECT 
        n.*, 
       nr.is_read
       FROM notifications n
      LEFT JOIN notification_receipts nr 
        ON n.id = nr.notification_id AND nr.user_id = $2
      WHERE n.establishment_id = $1 AND nr.user_id = $2
    `;

    const { rows: notifications } = await client.query(queryText, [
      establishmentID,
      userID,
    ]);

    return notifications.length > 0 ? notifications : null;
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function deleteNotification(NotificationId: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `DELETE FROM notifications WHERE id = $1
      RETURNING *`,
      [NotificationId],
    );
    if (rows.length > 0) {
      await client.query(
        "DELETE FROM notification_receipts WHERE notification_id = $1",
        [NotificationId],
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

export async function markNotificationAsRead(
  NotificationID: string,
  userID: string,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `UPDATE notification_receipts SET is_read = True, read_at = NOW()
      WHERE notification_id = $1 AND user_id = $2`,
      [NotificationID, userID],
    );
    await client.query("COMMIT");
  } catch (error: any) {
    console.log(error);
    await client.query("ROLLBACK");
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function markAllNotificationAsRead(userID: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `UPDATE notification_receipts SET is_read = True, read_at = NOW()
      WHERE user_id = $1`,
      [userID],
    );
    await client.query("COMMIT");
  } catch (error: any) {
    console.log(error);
    await client.query("ROLLBACK");
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

export async function getAllAlerts(establishmentID: string, userID: string) {
  try {
    const [announcements, notifications] = await Promise.all([
      getAnnouncements(establishmentID),
      getNotification(establishmentID, userID),
    ]);
    return {
      announcements,
      notifications,
    };
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message);
  }
}
