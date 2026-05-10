import { Router, Request, Response } from "express";
import { registerSchema, loginSchema } from "./auth.schema";
import { loginUser, logoutUser, registerUser } from "./auth.service";

export const authRouter = Router();

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
    const userID = req.body.userId;
    if (!userID) {
      return res.status(400).json({ message: "userId is required" });
    }
    await logoutUser(userID);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});
