import { pool } from "../../db/pool";
import { ClassInfo, ParentInfo, RoomInfo } from "./other.schema";

export async function createParent(
  parentData: ParentInfo,
  establishmentID: any,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const queryText = `
      INSERT INTO profiles (
        first_name, 
        last_name, 
        email,
        profession, 
        gender, 
        address, 
        phone, 
        profile_statut, 
        created_at,
        establishment_id,
        full_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      parentData.firstName,
      parentData.lastName,
      parentData.email,
      parentData.profession,
      parentData.gender,
      parentData.address,
      parentData.phone,
      "parent",
      new Date(),
      establishmentID,
      parentData.fullname,
    ];

    const { rows } = await client.query(queryText, values);

    await client.query("COMMIT");
    return rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getParentList(establishmentID: any) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const queryText = `
    SELECT id, first_name, last_name, gender FROM profiles
    WHERE profile_statut = 'parent'
    AND establishment_id = $1`;
    const { rows } = await client.query(queryText, [establishmentID]);
    await client.query("COMMIT");
    return rows;
  } catch (error: any) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteParent(parentId: any) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const queryText = "DELETE FROM profiles WHERE id = $1";
    await client.query(queryText, [parentId]);
    await client.query("COMMIT");
  } catch (error: any) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getParentDetails(parentId: any) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const queryText =
      "SELECT first_name, last_name, email, profession, gender, address, phone FROM profiles WHERE id = $1";
    const { rows } = await client.query(queryText, [parentId]);
    await client.query("COMMIT");
    return rows[0];
  } catch (error: any) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateParent(parentData: ParentInfo, parentId: any) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const queryText =
      "UPDATE profiles SET first_name = $1, last_name = $2, email = $3, profession = $4, gender = $5, address = $6, phone = $7, full_name = $9 WHERE id = $8";
    const values = [
      parentData.firstName,
      parentData.lastName,
      parentData.email,
      parentData.profession,
      parentData.gender,
      parentData.address,
      parentData.phone,
      parentId,
      parentData.fullname,
    ];
    await client.query(queryText, values);
    await client.query("COMMIT");
  } catch (error: any) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function createRoom(establishmentID: any, roomData: RoomInfo) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const queryText = `
    INSERT INTO rooms (name, type, capacity, equipment, building, establishment_id, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
    const values = [
      roomData.name,
      roomData.type,
      roomData.capacity,
      roomData.equipment,
      roomData.building,
      establishmentID,
      new Date(),
      new Date(),
    ];
    await client.query(queryText, values);
    await client.query("COMMIT");
  } catch (error: any) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getRooms(establishmentID: any) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const queryText = `
    SELECT id, name, type, capacity, equipment, building FROM rooms
    WHERE establishment_id = $1`;
    const { rows } = await client.query(queryText, [establishmentID]);
    await client.query("COMMIT");
    return rows;
  } catch (error: any) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateRoomsDetails(roomId: any, roomInfo: RoomInfo) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const queryText = `UPDATE rooms SET name = $1, type = $2, capacity = $3, equipment = $4, building = $5, updated_at = $7 WHERE id = $6`;
    const values = [
      roomInfo.name,
      roomInfo.type,
      roomInfo.capacity,
      roomInfo.equipment,
      roomInfo.building,
      roomId,
      new Date(),
    ];
    const { rows } = await client.query(queryText, values);
    await client.query("COMMIT");
    return rows;
  } catch (error: any) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteRoom(roomID: any) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const queryText = "DELETE FROM rooms WHERE id = $1";
    await client.query(queryText, [roomID]);
    await client.query("COMMIT");
  } catch (error: any) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function createClasses(establishmentID: string, classData: ClassInfo) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const queryText = `
      INSERT INTO classes (name, level, academic_year, establishment_id, main_teacher_id,  created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    const values = [
      classData.name,
      classData.level,
      classData.academicYear,
      establishmentID,
      new Date(),
      new Date(),
    ];
    await client.query(queryText, values);
    await client.query("COMMIT");
  } catch (error: any) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}