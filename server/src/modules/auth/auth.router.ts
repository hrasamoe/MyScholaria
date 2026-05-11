import { Router, Request, Response } from "express";
import { registerSchema, loginSchema } from "./auth.schema";
import { loginUser, logoutUser, registerUser } from "./auth.service";
import { RequireAuth, AuthRequest } from "../../middleware/auth.middleware";
export const authRouter = Router();
import jwt from 'jsonwebtoken';
import { ENV } from "../../config/env";

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

authRouter.post("/logout", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }
    const payload = jwt.verify(
      refreshToken,
      ENV.JWT_SECRET
    ) as { userId: string };

    await logoutUser(payload.userId);
    res.status(200).json({ message: "Logged out successfully" });
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
});
