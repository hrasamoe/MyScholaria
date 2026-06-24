import { PoolClient } from "pg";
import { pool } from "../../db/pool";
import { ScheduleSlotInput, UpdateScheduleSlotInput } from "./timetable.schema";


async function assertNoConflict(
  client: PoolClient,
  data: ScheduleSlotInput | UpdateScheduleSlotInput,
  establishmentID: string,
  excludeSlotID?: string,
) {
  const roomConflict = await client.query(
    `SELECT cs.id, c.name AS class_name
       FROM course_schedules cs
       JOIN classes c ON cs.class_id = c.id
      WHERE cs.room_id = $1
        AND cs.day_of_week = $2
        AND cs.start_time < $3
        AND cs.end_time > $4
        AND c.establishment_id = $5
        ${excludeSlotID ? "AND cs.id <> $6" : ""}`,
    excludeSlotID
      ? [
          data.roomID,
          data.day,
          data.endTime,
          data.startTime,
          establishmentID,
          excludeSlotID,
        ]
      : [data.roomID, data.day, data.endTime, data.startTime, establishmentID],
  );
  if (roomConflict.rows.length > 0) {
    throw new Error(
      `This room is already booked by ${roomConflict.rows[0].class_name} at that time`,
    );
  }

  if (data.teacherID) {
    const teacherConflict = await client.query(
      `SELECT cs.id, c.name AS class_name
         FROM course_schedules cs
         JOIN classes c ON cs.class_id = c.id
        WHERE cs.teacher_id = $1
          AND cs.day_of_week = $2
          AND cs.start_time < $3
          AND cs.end_time > $4
          AND c.establishment_id = $5
          ${excludeSlotID ? "AND cs.id <> $6" : ""}`,
      excludeSlotID
        ? [
            data.teacherID,
            data.day,
            data.endTime,
            data.startTime,
            establishmentID,
            excludeSlotID,
          ]
        : [
            data.teacherID,
            data.day,
            data.endTime,
            data.startTime,
            establishmentID,
          ],
    );
    if (teacherConflict.rows.length > 0) {
      throw new Error(
        `This teacher is already assigned to ${teacherConflict.rows[0].class_name} at that time`,
      );
    }
  }
}

export async function createScheduleSlot(
  establishmentID: string,
  data: ScheduleSlotInput,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await assertNoConflict(client, data, establishmentID);

    const { rows } = await client.query(
      `INSERT INTO course_schedules (
         class_id, subject, teacher_id, room_id, day_of_week,
         start_time, end_time, created_at, updated_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW())
       RETURNING id, class_id AS "classID", subject, teacher_id AS "teacherID",
                 room_id AS "roomID", day_of_week AS day,
                 start_time AS "startTime", end_time AS "endTime"`,
      [
        data.classID,
        data.subject,
        data.teacherID || null,
        data.roomID,
        data.day,
        data.startTime,
        data.endTime,
      ],
    );

    await client.query("COMMIT");
    return rows[0];
  } catch (error: any) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getClassSchedule(classID: string) {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `SELECT
         cs.id,
         cs.subject,
         cs.day_of_week                          AS day,
         cs.start_time                           AS "startTime",
         cs.end_time                              AS "endTime",
         cs.teacher_id                           AS "teacherID",
         cs.room_id                              AS "roomID",
         CONCAT(p.first_name, ' ', p.last_name)  AS teacher,
         r.name                                   AS room
       FROM course_schedules cs
       LEFT JOIN teachers t ON cs.teacher_id = t.id
       LEFT JOIN profiles p ON t.profile_id = p.id
       LEFT JOIN rooms r    ON cs.room_id = r.id
       WHERE cs.class_id = $1
       ORDER BY cs.day_of_week, cs.start_time`,
      [classID],
    );
    return rows;
  } catch (error: any) {
    console.error("Error fetching class schedule:", error);
    throw error;
  } finally {
    client.release();
  }
}

export async function updateScheduleSlot(
  slotID: string,
  establishmentID: string,
  data: UpdateScheduleSlotInput,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await assertNoConflict(client, data, establishmentID, slotID);

    const { rows } = await client.query(
      `UPDATE course_schedules SET
         subject = $1, teacher_id = $2, room_id = $3, day_of_week = $4,
         start_time = $5, end_time = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING id, class_id AS "classID", subject, teacher_id AS "teacherID",
                 room_id AS "roomID", day_of_week AS day,
                 start_time AS "startTime", end_time AS "endTime"`,
      [
        data.subject,
        data.teacherID || null,
        data.roomID,
        data.day,
        data.startTime,
        data.endTime,
        slotID,
      ],
    );

    if (rows.length === 0) throw new Error("Schedule slot not found");

    await client.query("COMMIT");
    return rows[0];
  } catch (error: any) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteScheduleSlot(slotID: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`DELETE FROM course_schedules WHERE id = $1`, [slotID]);
    await client.query("COMMIT");
  } catch (error: any) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
