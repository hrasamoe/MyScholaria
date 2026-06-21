import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../../config/env";
import { pool } from "../../db/pool";
import { AuthRequest, RequireAuth } from "../../middleware/auth.middleware";
import {
  loginSchema,
  registerMemberSchema,
  registerSchema,
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
export const authRouter = Router();

const isProd = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ("none" as const) : ("lax" as const),
};

function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
) {
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookies(res: Response) {
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
}

authRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await registerUserAsAdmin(data);
    res.status(201).json(result);
  } catch (err: any) {
    if (err.errors)
      return res.status(400).json({ message: err.errors[0].message });
    res.status(400).json({ message: err.message });
  }
});

authRouter.post("/register-member", async (req: Request, res: Response) => {
  try {
    const data = registerMemberSchema.parse(req.body);
    const result = await registerUserAsMember(data);
    res.status(201).json(result);
  } catch (error: any) {
    if (error.errors)
      return res.status(400).json({ message: error.errors[0].message });
    res.status(400).json({ message: error.message });
  }
});

authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await loginUser(data);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    res.status(200).json(result);
  } catch (err: any) {
    if (err.errors)
      return res.status(400).json({ message: err.errors[0].message });
    res.status(401).json({ message: err.message });
  }
});

authRouter.get("/verify-email", async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    const result = await verifyEmail(token);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    res.status(200).json(result);
  } catch (err: any) {
    if (err.errors)
      return res.status(400).json({ message: err.errors[0].message });
    res.status(500).json({ message: err.message });
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

authRouter.post("/logout", async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      try {
        const payload = jwt.verify(refreshToken, ENV.JWT_SECRET) as {
          userId: string;
        };
        await logoutUser(payload.userId);
      } catch {}
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
    if (!refreshToken)
      return res.status(401).json({ message: "Refresh token missing" });

    const payload = jwt.verify(refreshToken, ENV.JWT_SECRET) as {
      userId: string;
    };

    const { rows } = await pool.query(
      `SELECT id FROM refresh_tokens
       WHERE user_id = $1 AND revoked_at IS NULL AND expires_at > NOW()`,
      [payload.userId],
    );
    if (rows.length === 0)
      return res.status(401).json({ message: "Refresh token revoked" });
    const memberResult = await pool.query(
      `SELECT e.id as establishment_id
       FROM establishment_members em
       JOIN establishments e ON e.id = em.establishment_id
       WHERE em.user_id = $1 AND em.is_active = true
       LIMIT 1`,
      [payload.userId],
    );
    const establishmentID = memberResult.rows[0]?.establishment_id ?? null;
    const newAccessToken = jwt.sign(
      { userId: payload.userId, establishmentID },
      ENV.JWT_SECRET,
      { expiresIn: "15m" },
    );

    res.cookie("accessToken", newAccessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });
    res.status(200).json({ accessToken: newAccessToken });
  } catch {
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

authRouter.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });
    await forgotPassword(email);
    res
      .status(200)
      .json({ message: "If this email exists, a reset link has been sent" });
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
    setAuthCookies(res, result.accessToken, result.refreshToken);
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
    return res.status(400).json({ message: "Invalid or expired token" });
  res.status(200).json({ message: "Done" });
});

authRouter.get("/me", RequireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.email, p.full_name,
              em.is_aproved, e.name AS establishment_name, e.id AS establishment_id,
              ur.role AS roles
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       LEFT JOIN establishment_members em ON em.user_id = u.id AND em.is_active = true
       LEFT JOIN establishments e ON e.id = em.establishment_id
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       WHERE u.id = $1
       GROUP BY u.id, u.email, p.full_name, em.is_aproved, e.name, e.id, ur.role`,
      [req.userId],
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "User not found" });
    const u = rows[0];
    res.json({
      user: {
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        roles: u.roles ? [u.roles] : [],
        establishment_id: u.establishment_id ?? null,
        establishment_name: u.establishment_name ?? null,
        is_aproved: u.is_aproved ?? false,
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});
