import { Request, Response, Router } from "express";
import {
  AuthRequest,
  RequireAuth,
  RequireAuthOnly,
} from "../../middleware/auth.middleware";
import {
  scheduleSlotSchema,
  updateScheduleSlotSchema,
} from "./timetable.schema";
import {
  createScheduleSlot,
  deleteScheduleSlot,
  getClassSchedule,
  updateScheduleSlot,
} from "./timetable.service";

export const timetableRouter = Router();

timetableRouter.post(
  "/create",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    const establishmentID = req.establishmentID as string;
    const parsed = scheduleSlotSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.message });
    }
    try {
      const slot = await createScheduleSlot(establishmentID, parsed.data);
      res.status(201).json({ message: "Schedule slot created", data: slot });
    } catch (error: any) {
      res
        .status(400)
        .json({ message: error.message || "Internal server error" });
    }
  },
);

timetableRouter.get(
  "/class/:classID",
  RequireAuth,
  async (req: Request, res: Response) => {
    const classID = req.params.classID as string;
    try {
      const schedule = await getClassSchedule(classID);
      res.status(200).json(schedule);
    } catch (error: any) {
      res
        .status(500)
        .json({ message: error.message || "Internal server error" });
    }
  },
);

timetableRouter.put(
  "/update/:id",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    const slotID = req.params.id as string;
    const establishmentID = req.establishmentID as string;
    const parsed = updateScheduleSlotSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.message });
    }
    try {
      const slot = await updateScheduleSlot(
        slotID,
        establishmentID,
        parsed.data,
      );
      res.status(200).json({ message: "Schedule slot updated", data: slot });
    } catch (error: any) {
      res
        .status(400)
        .json({ message: error.message || "Internal server error" });
    }
  },
);

timetableRouter.delete(
  "/delete/:id",
  RequireAuthOnly,
  async (req: Request, res: Response) => {
    const slotID = req.params.id as string;
    try {
      await deleteScheduleSlot(slotID);
      res.status(200).json({ message: "Schedule slot deleted" });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: error.message || "Internal server error" });
    }
  },
);
