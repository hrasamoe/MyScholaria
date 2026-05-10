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
