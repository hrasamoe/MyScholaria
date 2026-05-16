import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env";
import { pool } from "../db/pool";

export interface AuthRequest extends Request {
  userId?: string;
}

export async function RequireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }
  try {
    const payload = jwt.verify(token, ENV.JWT_SECRET) as { userId: string };
    req.userId = payload.userId;

    const { rows } = await pool.query(
      `SELECT is_aproved FROM establishment_members
       WHERE user_id = $1 AND is_active = true LIMIT 1`,
      [payload.userId],
    );
    if (rows.length > 0 && !rows[0].is_aproved) {
      return res.status(403).json({ message: "Account pending aproval" });
    }
    next();
  } catch {
    return res.status(401).json({ message: "Token invalid or expired" });
  } finally {
  }
}

export async function RequireAuthOnly(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  console.log("🍪 Cookies reçus:", req.cookies);
  const token = req.cookies?.accessToken;
  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }
  try {
    const playload = jwt.verify(token, ENV.JWT_SECRET) as { userId: string };
    req.userId = playload.userId;
    next();
  } catch {
    return res.status(401).json({ message: "TOken invalid or missing" });
  }
}
