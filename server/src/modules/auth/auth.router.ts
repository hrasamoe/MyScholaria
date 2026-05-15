import { Router, Request, Response } from "express";
import {
  registerSchema,
  loginSchema,
  registerMemberSchema,
} from "./auth.schema";
import {
  forgotPassword,
  loginUser,
  logoutUser,
  registerUserAsAdmin,
  registerUserAsMember,
  resetPassword,
  verifyEmail,
  verifyEmailWithEstablishment,
} from "./auth.service";
import {
  RequireAuth,
  AuthRequest,
  RequireAuthOnly,
} from "../../middleware/auth.middleware";
export const authRouter = Router();
import jwt from "jsonwebtoken";
import { ENV } from "../../config/env";
import { pool } from "../../db/pool";
import { en } from "zod/locales";

function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
) {
  const isProd = process.env.NODE_ENV === "producion";
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookies(res: Response) {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
}

authRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await registerUserAsAdmin(data);
    res.status(201).json(result);
  } catch (err: any) {
    if (err.errors) {
      return res.status(400).json({ message: err.errors[0].message });
    }
    res.status(400).json({ message: err.message });
  }
});

authRouter.get("/verify-email-member", async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    const result = await verifyEmailWithEstablishment(token);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});
authRouter.post("/register-member", async (req: Request, res: Response) => {
  try {
    const data = registerMemberSchema.parse(req.body);
    const result = await registerUserAsMember(data);
    res.status(201).json(result);
  } catch (error: any) {
    if (error.errors) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(400).json({ message: error.message });
  }
});

authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await loginUser(data);
    setAuthCookies(res, result.accessToken, result.refreshToken);
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

authRouter.post("/logout", RequireAuth, async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      try {
        const playoad = jwt.verify(refreshToken, ENV.JWT_SECRET) as {
          userID: string;
        };
        await logoutUser(playoad.userID);
      } catch {
        res.status(401).json({ message: "Invalid or expired token" });
      }
    }
    clearAuthCookies(res);
    res.status(200).json({ message: "Logged out" });
  } catch {
    res.status(500).json({ message: "Log out failed" });
  }
});

authRouter.post("/refresh", async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token missing" });
    }
    const playload = jwt.verify(refreshToken, ENV.JWT_SECRET) as {
      userId: string;
    };
    const { rows } = await pool.query(
      `
      SELECT id FROM refresh_tokens
      WHERE user_id = $1
      AND revoked_at IS NULL 
      AND expires_at > NOW()`,
      [playload.userId],
    );
    if (rows.length === 0)
      return res.status(401).json({ message: "Refresh token revoked" });

    const newAccessToken = jwt.sign(
      { userId: playload.userId },
      ENV.JWT_SECRET,
      { expiresIn: "15m" },
    );
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "strict" : "lax",
      maxAge: 15 * 60 * 1000,
    });
    res.status(200).json({ accessToken: newAccessToken });
  } catch {
    res.status(401).json({ message: "Invalid reresh token" });
  }
});

// SECURITY
authRouter.post("/forgot-password", async (req: Request, res: Response) => {
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
      return res.status(400).json({ message: "Token and password required" });
    const result = await resetPassword(token, password);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

authRouter.get("/verify-reset-token", async (req: Request, res: Response) => {
  const { token } = req.query;
  if (!token || typeof token !== "string")
    return res.status(400).json({ message: "Missing token" });
  const { rows } = await pool.query(
    `SELECT id FROM users WHERE reset_token = $1 AND reset_expires > NOW()`,
    [token],
  );
  if (rows.length === 0)
    return res.status(400).json({ message: "Invalid or expored token" });
  res.status(200).json({ message: "Done" });
});

authRouter.get(
  "/me",
  RequireAuthOnly,
  async (req: AuthRequest, res: Response) => {
    try {
      const { rows } = await pool.query(
        `SELECT u.id, u.email, p.full_name,
              em.is_aproved, e.name AS establishment_name, e.id AS establishment_id
       FROM users u
       LEFT JOIN profiles p ON p.id = u.id
       LEFT JOIN establishment_members em ON em.user_id = u.id AND em.is_active = true
       LEFT JOIN establishments e ON e.id = em.establishment_id
       WHERE u.id = $1
       LIMIT 1`,
        [req.userId],
      );
      if (rows.length === 0)
        return res.status(401).json({ message: "User not found" });

      const rolesResult = await pool.query(
        "SELECT role FROM user_roles WHERE user_id = $1",
        [req.userId],
      );
      const roles = rolesResult.rows.map((r: any) => r.role);
      const u = rows[0];

      res.status(200).json({
        user: {
          id: u.id,
          email: u.email,
          full_name: u.full_name,
          roles,
          establishment_id: u.establishment_id ?? null,
          establishment_name: u.establishment_name ?? null,
          is_aproved: u.is_aproved ?? false,
        },
      });
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  },
);
