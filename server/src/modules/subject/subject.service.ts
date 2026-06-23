import { pool } from "../../db/pool";
import { SubjectInfo } from "./subject.schema";

export async function createSubject(
  userID: string,
  establishmentID: string,
  subjectData: SubjectInfo,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const queryText = `INSERT INTO subjects 
    (
      code,
      name,
      level,
      coefficient,
      hours_per_week,
      created_at,
      created_by,
      establishment_id
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`;
    const value = [
      subjectData.code,
      subjectData.name,
      subjectData.level,
      subjectData.coefficient,
      subjectData.hours,
      new Date(),
      userID,
      establishmentID,
    ];
    const result = await client.query(queryText, value);
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

export async function editSubject(
  userID: string,
  subjectData: SubjectInfo,
  subjectID: string,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const queryText = `UPDATE subjects 
    SET 
      code = $1, 
      name = $2, 
      level = $3, 
      coefficient = $4, 
      hours_per_week = $5
    WHERE id = $6 AND created_by = $7 RETURNING *`;
    const value = [
      subjectData.code,
      subjectData.name,
      subjectData.level,
      subjectData.coefficient,
      subjectData.hours,
      subjectID,
      userID,
    ];
    const result = await client.query(queryText, value);
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

export async function deleteSubject(
  userID: string,
  subjectID: string,
  classID: string,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const subjetToDelete = await client.query(
      `SELECT * FROM subjects WHERE level = $1 AND id = $2`,
      [classID, subjectID],
    );

    if (!subjetToDelete.rows || subjetToDelete.rows.length === 0) {
      throw new Error("Subject not found");
    }

    if (userID !== subjetToDelete.rows[0].created_by) {
      throw new Error(
        `You are not allowed to delete ${subjetToDelete.rows[0].name} subject`,
      );
    }

    await client.query(
      `DELETE FROM subjects
      WHERE id = $1 AND level = $2`,
      [subjectID, classID],
    );
    await client.query("COMMIT");
  } catch (error: any) {
    console.error(error);
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getSubjectList(establishmentID: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const queryText = `
      SELECT 
        MIN(s.id::text) as id,
        s.name,
        jsonb_agg(
          jsonb_build_object(
            'id', s.id::text,
            'class_id', s.level,
            'class_name', c.name,
            'code', s.code,
            'coefficient', s.coefficient,
            'hours', s.hours_per_week
          )
        ) as classes
      FROM subjects s
      LEFT JOIN classes c ON s.level = c.id
      WHERE s.establishment_id = $1
      GROUP BY s.name
    `;
    const result = await client.query(queryText, [establishmentID]);
    await client.query("COMMIT");
    return result.rows;
  } catch (error: any) {
    console.error(error);
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
