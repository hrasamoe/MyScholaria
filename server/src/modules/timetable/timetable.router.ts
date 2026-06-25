import { Request, Response, Router } from "express";
import {
  AuthRequest,
  RequireAuth,
  RequireAuthOnly,
} from "../../middleware/auth.middleware";
import { slotSchema } from "./timetable.schema";
import { createSlot } from "./timetable.service";
export const timetableRouter = Router();

timetableRouter.post("/create", RequireAuth, async (req: AuthRequest, res: Response) => {
  const userID = req.userId as string;

  try {
    const parsed = slotSchema.safeParse(req.body);
    if (parsed.error) {
      throw new Error(JSON.stringify(parsed.error));
    }
    const result = await createSlot(userID, parsed.data);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message, message: error.message });
  }
});
