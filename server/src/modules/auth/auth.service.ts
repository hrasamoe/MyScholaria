import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { ENV } from "../../config/env";
import { pool } from "../../db/pool";
import { sendConfirmationEmail } from "../../services/email/confirmation-email";
import { sendForgotPasswordEmail } from "../../services/email/forgot-password";
import { sendPendingValidationEmail } from "../../services/email/pendingValidation";
import { LoginInput, RegisterInput, RegisterMemberInput } from "./auth.schema";

function generateAccessToken(userId: string) {
  return jwt.sign({ userId }, ENV.JWT_SECRET!, { expiresIn: "15m" });
}

function generateRefreshToken(userId: string) {
  return jwt.sign({ userId }, ENV.JWT_SECRET!, { expiresIn: "7d" });
}

export async function registerUserAsAdmin(data: RegisterInput) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existing = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [data.email],
    );
    if (existing.rows.length > 0) throw new Error("Email already in use");

    const hashed_password = await bcrypt.hash(data.password, 10);
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const { rows } = await client.query(
      `INSERT INTO users (email, password_hash, is_verified, is_active, verify_token, verify_expires)
       VALUES ($1, $2, false, true, $3, $4)
       RETURNING id, email`,
      [data.email, hashed_password, verifyToken, verifyExpires],
    );
    const user = rows[0];

    await client.query(
      "UPDATE profiles SET full_name = $1 WHERE user_id = $2",
      [data.full_name, user.id],
    );
    await client.query(
      "INSERT INTO user_roles (user_id, role) VALUES ($1, $2)",
      [user.id, data.role || "admin"],
    );

    await client.query("COMMIT");

    await sendConfirmationEmail(
      data.email,
      data.full_name,
      data.schoolName,
      verifyToken,
    );

    return {
      message:
        "Account created. Please check your email to verify your account",
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function registerUserAsMember(data: RegisterMemberInput) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existing = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [data.email],
    );
    if (existing.rows.length > 0) throw new Error("Email already in use");

    const establishmentResult = await client.query(
      "SELECT * FROM establishments WHERE code = $1",
      [data.schoolID],
    );
    if (establishmentResult.rows.length === 0)
      throw new Error("Establishment not found.");

    const establishment = establishmentResult.rows[0];
    const match = await bcrypt.compare(
      data.joinCode,
      establishment.join_code_hash,
    );
    if (!match) throw new Error("Incorrect join code");

    const hashed_password = await bcrypt.hash(data.password, 10);
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const { rows } = await client.query(
      `INSERT INTO users (email, password_hash, is_verified, is_active, verify_token, verify_expires, pending_establishment_id)
       VALUES ($1, $2, false, true, $3, $4, $5)
       RETURNING id, email`,
      [
        data.email,
        hashed_password,
        verifyToken,
        verifyExpires,
        establishment.id,
      ],
    );
    const user = rows[0];

    await client.query(
      "UPDATE profiles SET full_name = $1, last_name = $3, first_name = $4 WHERE user_id = $2",
      [data.full_name, user.id, data.last_name, data.first_name],
    );
    await client.query(
      "INSERT INTO user_roles (user_id, role) VALUES ($1, $2)",
      [user.id, data.role || "student"],
    );

    await client.query("COMMIT");

    await sendPendingValidationEmail(
      data.email,
      data.full_name,
      establishment.name,
      verifyToken,
    );

    return {
      message:
        "Account created. Please check your email to verify your account",
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function loginUser(data: LoginInput) {
  const { rows } = await pool.query(
    `SELECT u.*, p.full_name
     FROM users u
     LEFT JOIN profiles p ON p.user_id = u.id
     WHERE u.email = $1 AND u.is_active = true`,
    [data.email],
  );
  const user = rows[0];
  if (!user) throw new Error("Email or password is incorrect");

  if (!user.is_verified)
    throw new Error("Please verify your email before signing in");

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
    "SELECT role FROM user_roles WHERE user_id = $1",
    [user.id],
  );
  const roles = rolesResult.rows.map((r) => r.role);

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  const tokenHash = await bcrypt.hash(refreshToken, 8);

  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
    [user.id, tokenHash],
  );
  const memberResult = await pool.query(
    `SELECT em.is_aproved, e.name AS establishment_name, e.id as establishment_id
  FROM establishment_members em
  JOIN establishments e ON e.id = em.establishment_id
  WHERE  em.user_id = $1 AND em.is_active = true
  LIMIT 1`,
    [user.id],
  );
  const member = memberResult.rows[0];
  return {
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      roles,
      establishment_id: member?.establishment_id ?? null,
      establishment_name: member?.establishment_name ?? null,
      is_aproved: member?.is_aproved ?? false,
    },
    accessToken,
    refreshToken,
  };
}

export async function verifyEmail(token: any) {
  if (!token || typeof token !== "string") throw new Error("Missing token");

  const { rows } = await pool.query(
    `SELECT id FROM users
     WHERE verify_token = $1 AND verify_expires > NOW() AND is_verified = false`,
    [token],
  );
  if (rows.length === 0) throw new Error("Token invalid or expired");

  const userId = rows[0].id;
  await pool.query(
    `UPDATE users SET is_verified = true, verify_token = NULL, verify_expires = NULL
     WHERE id = $1`,
    [userId],
  );

  const rolesResult = await pool.query(
    "SELECT role FROM user_roles WHERE user_id = $1",
    [userId],
  );
  const roles = rolesResult.rows.map((r) => r.role);

  const { rows: userRows } = await pool.query(
    `SELECT u.id, u.email, p.full_name FROM users u
     LEFT JOIN profiles p ON p.user_id = u.id WHERE u.id = $1`,
    [userId],
  );
  const user = userRows[0];

  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);
  const tokenHash = await bcrypt.hash(refreshToken, 8);

  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
    [userId, tokenHash],
  );

  return {
    user: { id: user.id, email: user.email, full_name: user.full_name, roles },
    accessToken,
    refreshToken,
  };
}

export async function verifyEmailWithEstablishment(token: any) {
  if (!token || typeof token !== "string") throw new Error("Missing token");

  const { rows } = await pool.query(
    `SELECT u.id, u.email, u.pending_establishment_id, p.full_name
     FROM users u
     LEFT JOIN profiles p ON p.user_id = u.id
     WHERE u.verify_token = $1 AND u.verify_expires > NOW() AND u.is_verified = false`,
    [token],
  );

  if (rows.length === 0) throw new Error("Token invalid or expired");

  const userId = rows[0].id;
  const userEmail = rows[0].email;
  const establishmentId = rows[0].pending_establishment_id;

  await pool.query(
    `UPDATE users SET is_verified = true, verify_token = NULL, verify_expires = NULL, pending_establishment_id = NULL
     WHERE id = $1`,
    [userId],
  );

  const rolesResult = await pool.query(
    "SELECT role FROM user_roles WHERE user_id = $1",
    [userId],
  );
  const establishmentResult = await pool.query(
    `SELECT name FROM establishments WHERE id = $1`,
    [establishmentId],
  );
  const establishmentName = establishmentResult.rows[0]?.name ?? null;

  const roles = rolesResult.rows.map((r) => r.role);

  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);
  const tokenHash = await bcrypt.hash(refreshToken, 8);

  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
    [userId, tokenHash],
  );

  return {
    user: {
      id: userId,
      email: userEmail,
      full_name: rows[0].full_name,
      roles,
      establishment_id: establishmentId,
      establishment_name: establishmentName,
      is_aproved: false,
    },
    establishment_id: establishmentId,
    accessToken,
    refreshToken,
  };
}

export async function logoutUser(userId: string, tokenHash?: string) {
  if (tokenHash) {
    await pool.query(
      "UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND token_hash = $2",
      [userId, tokenHash],
    );
  } else {
    await pool.query(
      "UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL",
      [userId],
    );
  }
}

export async function forgotPassword(email: string) {
  const { rows } = await pool.query(
    `SELECT u.id, p.full_name FROM users u
     LEFT JOIN profiles p ON p.user_id = u.id
     WHERE u.email = $1 AND u.is_active = true`,
    [email],
  );
  if (rows.length === 0) return;

  const user = rows[0];
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

  const result = await pool.query(
    "UPDATE users SET reset_token = $1, reset_expires = $2 WHERE id = $3 RETURNING id",
    [resetToken, resetExpires, user.id],
  );

  if (result.rowCount === 0) throw new Error("Failed to save reset token");

  await sendForgotPasswordEmail(email, user.full_name ?? "User", resetToken);
}

export async function resetPassword(token: string, newPassword: string) {
  const { rows } = await pool.query(
    `SELECT id FROM users WHERE reset_token = $1 AND reset_expires > NOW()`,
    [token],
  );
  if (rows.length === 0) throw new Error("Token invalid or expired");

  const userId = rows[0].id;
  const hashed = await bcrypt.hash(newPassword, 12);

  await pool.query(
    `UPDATE users SET password_hash = $1, reset_token = NULL, reset_expires = NULL
     WHERE id = $2`,
    [hashed, userId],
  );

  const rolesResult = await pool.query(
    "SELECT role FROM user_roles WHERE user_id = $1",
    [userId],
  );
  const roles = rolesResult.rows.map((r) => r.role);

  const { rows: userRows } = await pool.query(
    `SELECT u.id, u.email, p.full_name FROM users u
     LEFT JOIN profiles p ON p.user_id = u.id WHERE u.id = $1`,
    [userId],
  );
  const user = userRows[0];

  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);
  const tokenHash = await bcrypt.hash(refreshToken, 8);

  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
    [userId, tokenHash],
  );

  return {
    user: { id: user.id, email: user.email, full_name: user.full_name, roles },
    accessToken,
    refreshToken,
  };
}

export async function cleanUnverifiedAccounts() {
  await pool.query(
    `DELETE FROM users WHERE is_verified = false AND verify_expires < NOW()`,
  );
}
