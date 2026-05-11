import { Router, Request, Response } from "express";
import { registerSchema, loginSchema } from "./auth.schema";
import {
  forgotPassword,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  verifyEmail,
} from "./auth.service";
import { RequireAuth, AuthRequest } from "../../middleware/auth.middleware";
export const authRouter = Router();
import jwt from "jsonwebtoken";
import { ENV } from "../../config/env";
import { pool } from "../../db/pool";

authRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await registerUser(data);
    res.status(201).json(result);
  } catch (err: any) {
    if (err.errors) {
      return res.status(400).json({ message: err.errors[0].message });
    }
    res.status(400).json({ message: err.message });
  }
});
authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await loginUser(data);
    res.status(201).json(result);
  } catch (err: any) {
    if (err.errors) {
      return res.status(400).json({ message: err.errors[0].message });
    }
    res.status(401).json({ message: err.message });
  }
});

authRouter.get("/verify-email", async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    const result = await verifyEmail(token);
    res.status(201).json(result);
  } catch (err: any) {
    if (err.errors) {
      return res.status(400).json({ message: err.errors[0].message });
    }
    res.status(500).json({ message: err.message });
  } finally {
  }
});

authRouter.post("/logout", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }
    const payload = jwt.verify(refreshToken, ENV.JWT_SECRET) as {
      userId: string;
    };

    await logoutUser(payload.userId);
    res.status(200).json({ message: "Logged out successfully" });
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

// SECURITY
authRouter.post("/forgot-passoword", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email requires" });
    await forgotPassword(email);
    res
      .status(200)
      .json({ message: "If this email exists, a reset link has been send" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

authRouter.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      return res.status(400).json("Token and password required");
    await resetPassword(token, password);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});
