import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env";
import { pool } from "../db/pool";

export interface AuthRequest extends Request {
  userId?: string;
  establishmentID?: string | null;
}

export async function RequireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const token =
    req.cookies?.accessToken ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Token missing. Refresh the page" });
  }
  try {
    const payload = jwt.verify(token, ENV.JWT_SECRET) as {
      userId: string;
      establishmentID: string | null;
    };
    req.userId = payload.userId;
    req.establishmentID = payload.establishmentID;

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
  const token =
    req.cookies?.accessToken ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Token missing. Refresh the page" });
  }
  try {
    const playload = jwt.verify(token, ENV.JWT_SECRET) as { userId: string };
    req.userId = playload.userId;
    next();
  } catch {
    return res.status(401).json({ message: "TOken invalid or missing" });
  }
}
