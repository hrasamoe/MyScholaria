import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../../db/pool";
import { RegisterInput, LoginInput } from "./auth.schema";
import { ENV } from "../../config/env";
import { json } from "zod";

function generateAccessToken(userID: string) {
  return jwt.sign({ userID }, ENV.JWT_SECRET!, { expiresIn: "15m" });
}

function generateRefreshToken(userId: string) {
  return jwt.sign({ userId }, ENV.JWT_SECRET!, { expiresIn: "7d" });
}

export async function registerUser(data: RegisterInput) {
  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
    data.email,
  ]);
  if (existing.rows.length > 0) {
    throw new Error("Email already in use");
  }
  const hashed_passowrd = await bcrypt.hash(data.password, 12);

  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, is_verified, is_active)
    VALUES ($1, $2, false, true)
    RETURNING id, email, created_at
    `,
    [data.email, hashed_passowrd],
  );
  const user = rows[0];
  await pool.query("UPDATE profiles SET full_name = $1 WHERE id = $2", [
    data.full_name,
    user.id,
  ]);
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  const tokenHash = await bcrypt.hash(refreshToken, 8);
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
    VALUES ($1, $2, NOW() + INTERVAL '7 days)`,
    [user.id, tokenHash],
  );
  return {
    user: {
      id: user.id,
      email: user.email,
      full_name: data.full_name,
      created_at: user.created_at,
    },
    accessToken,
    refreshToken,
  };
}

export async function loginUser(data: LoginInput) {
  const { rows } = await pool.query(
    `SELECT u.*, p.full_name
    FROM users u 
    LEFT JOIN profiles p ON p.id = u.id
    WHERE u.email = $1 AND u.is_active = true
    `,
    [data.email],
  );
  const { user } = rows[0];
  if (!user) {
    throw new Error("Email or password is incorrect");
  }

  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    const minutes = Math.ceil(
      (new Date(user.locked_until).getTime() - Date.now()) / 60000,
    );
    throw new Error(`Account is locked. Try again in ${minutes} minutes.`);
  }

  const valid = await bcrypt.compare(data.password, user.password_hash);
  if (!valid) {
    await pool.query("SELECT record_failed_login($1)", [data.email]);
    throw new Error("Email or password is incorrect");
  }
  await pool.query("SELECT record_successful_login($1)", [user.id]);
  const rolesResult = await pool.query(
    "SELECT role FROM user_role WHERE user_id = $1",
    [user.id],
  );
  const roles = rolesResult.rows.map((r) => r.role);
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  const hash_toke = bcrypt.hash(refreshToken, 8);
  await pool.query(
    `INSERT INTO refresh_tokes (user_id, token_hash, expires_at)
    VALUES ($1, $2, NOW() + INTERVAL '7days')
    `,
    [user.id, hash_toke],
  );
  return {
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      roles,
    },
    accessToken,
    refreshToken,
  };
}
