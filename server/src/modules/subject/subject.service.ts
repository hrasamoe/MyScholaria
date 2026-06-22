import { pool } from "../../db/pool";
import { SubjectInfo } from "./subject.schema";

export async function createSubject(userID: string, subjectData: SubjectInfo) {
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
