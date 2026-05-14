import bcrypt from "bcryptjs";
import { pool } from "../../db/pool";
import { EstablishmentInput, JoinInput } from "./establishments.schema";

export async function createEtablishments(data: EstablishmentInput) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existing = await client.query(
      `SELECT id FROM establishments WHERE code = $1`,
      [data.code],
    );
    if (existing.rows.length > 0)
      throw new Error("Another establishment already exists");

    const hashedJoinCode = await bcrypt.hash(data.joinCode, 12);
    const hashedAdminCode = await bcrypt.hash(data.adminCode, 12);

    const { rows } = await client.query(
      `INSERT INTO establishments (
        name, code, type, address, phone, email, created_at,
        identification_number, join_code, admin_code,
        join_code_hash, admin_code_hash, is_active, owner_id, city, zip_code
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      RETURNING *`,
      [
        data.name,
        data.code,
        data.type,
        data.address,
        data.phone,
        data.email,
        new Date(),
        data.identificationNumber,
        data.joinCode,
        data.adminCode,
        hashedJoinCode,
        hashedAdminCode,
        true,
        data.owner_id,
        data.city,
        data.zipCode,
      ],
    );
    const establishment = rows[0];

    await client.query(
      `INSERT INTO school_periods (
        establishment_id, name, start_date, end_date,
        academic_year, is_current, created_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        establishment.id,
        "2025-2026",
        new Date("2025-09-01"),
        new Date("2026-07-20"),
        "2025-2026",
        true,
        new Date(),
      ],
    );

    await client.query(
      `INSERT INTO fee_structures (
        establishment_id, name, academic_year, amount, frequency, created_at
      ) VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        establishment.id,
        "Droit d'inscription",
        "2025-2026",
        "0",
        "annual",
        new Date(),
      ],
    );

    await client.query(
      `INSERT INTO subscriptions (
        establishment_id, plan_type, status, current_period_start,
        current_period_end, cancel_at_period_end, created_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        establishment.id,
        "free",
        "active",
        new Date(),
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        false,
        new Date(),
      ],
    );

    await client.query(
      `INSERT INTO settings (establishment_id, key, value, updated_at)
       VALUES ($1,$2,$3,$4)`,
      [
        establishment.id,
        "grading_system",
        JSON.stringify({ system: "out_of_20", pass_mark: 10 }),
        new Date(),
      ],
    );

    await client.query(
      `INSERT INTO establishment_members (
        establishment_id, user_id, role_name, joined_at, is_active, is_aproved
      ) VALUES ($1,$2,$3,$4,$5,$6)`,
      [establishment.id, data.owner_id, "admin", new Date(), true, true],
    );

    const existingRole = await client.query(
      `SELECT id FROM user_roles WHERE user_id = $1 AND role = $2`,
      [data.owner_id, "admin"],
    );
    if (existingRole.rows.length === 0) {
      await client.query(
        `INSERT INTO user_roles (user_id, role, created_at) VALUES ($1,$2,$3)`,
        [data.owner_id, "admin", new Date()],
      );
    }

    await client.query(
      `INSERT INTO audit_logs (
        user_id, action, entity_type, entity_id, metadata, created_at
      ) VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        data.owner_id,
        "CREATE_ESTABLISHMENT",
        "establishment",
        establishment.id,
        JSON.stringify({
          name: establishment.name,
          code: establishment.code,
          type: establishment.type,
        }),
        new Date(),
      ],
    );

    await client.query(
      `INSERT INTO notifications (user_id, type, title, body, link, created_at)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        data.owner_id,
        "establishment_created",
        "Your establishment has been created!",
        `${establishment.name} is now ready to use.`,
        `/establishment/${establishment.id}/dashboard`,
        new Date(),
      ],
    );

    await client.query("COMMIT");
    return establishment;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function joinEstablishment(data: JoinInput) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const exist = await client.query(
      `SELECT user_id FROM establishment_members WHERE user_id = $1`,
      [data.userID],
    );
    if (exist.rows.length > 0)
      throw new Error("You are already in the establishment");

    await client.query(
      `INSERT INTO establishment_members (
        establishment_id, user_id, role_name, joined_at, is_active, is_aproved
      ) VALUES ($1,$2,$3,$4,$5,$6)`,
      [data.establishmentID, data.userID, data.role, new Date(), true, false],
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
