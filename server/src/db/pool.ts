import { Pool } from "pg";

export let pool: Pool;

export async function initPool() {
  pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
    max: 10,
    connectionTimeoutMillis: 10000,
  });

  const client = await pool.connect();
  console.log("✅ PostgreSQL connecté — MyScholaria");
  client.release();
}
