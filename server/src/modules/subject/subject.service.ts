import { pool } from "../../db/pool";
import { SubjectInfo } from "./subject.schema";

export async function createSubject(userID: string, subjectData: SubjectInfo) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const queryText = `INSERT INTO subject 
    (
      code,
      name,
      level,
      coefficient,
      hours_per_week,
      created_at,
      created_by
    ) VALUES ($1,$2,$3,$4,$5,$6,$7)
      `;
    const value = [
      subjectData.code,
      subjectData.name,
      subjectData.level,
      subjectData.coefficient,
      subjectData.hours,
      new Date(),
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

export async function editSubject(
  userID: string,
  SubjectData: SubjectInfo,
  subjectID: string,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("COMMIT");
  } catch (error: any) {
    console.error(error);
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteSubject(userID: string, subjectID: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
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
    await client.query("COMMIT");
  } catch (error: any) {
    console.error(error);
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
