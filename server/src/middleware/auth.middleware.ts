import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env";

export interface AuthRequest extends Request {
  userID?: string;
}

export function RequireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const token = req.headers.authorization?.split("")[1];

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }
  try {
    const playload = jwt.verify(token, ENV.JWT_SECRET) as { userID: string };
    req.userID = playload.userID;
  } catch {
    return res.status(401).json({ message: "Token invalid or expired" });
  } finally {
  }
}
