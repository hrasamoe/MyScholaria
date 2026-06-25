import { Request, Response, Router } from "express";
import {
  getSlotsByClass,
  createSlot,
  deleteSlot,
  updateSlot,
} from "./timetable.service";
import {
  AuthRequest,
  RequireAuth,
  RequireAuthOnly,
} from "../../middleware/auth.middleware";
import { slotSchema } from "./timetable.schema";
export const timetableRouter = Router();

timetableRouter.post(
  "/create",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
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
  },
);

timetableRouter.get(
  "/class/:classID",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const classID = req.params.classID as string;
      const slots = await getSlotsByClass(classID);
      res.status(200).json(slots);
    } catch (error: any) {
      res.status(500).json({ error: error.message, message: error.message });
    }
  },
);

timetableRouter.delete(
  "/delete/:slotID",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    const userID = req.userId as string;
    const slotID = req.params.slotID as string;
    try {
      await deleteSlot(slotID, userID);
      res.status(200).json({ message: "Slot deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message, message: error.message });
    }
  },
);

timetableRouter.put(
  "/update/:slotID",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const parsed = slotSchema.safeParse(req.body);
      if (parsed.error) {
        throw new Error(JSON.stringify(parsed.error));
      }
      const slotID = req.params.slotID as string;
      const userID = req.userId as string;
      const result = await updateSlot(slotID, userID, parsed.data);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message, message: error.message });
    }
  },
);
