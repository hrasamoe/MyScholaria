import { Response, Router } from "express";
import { AuthRequest, RequireAuth } from "../../middleware/auth.middleware";
import { calendarSchema } from "./calendar.schema";
import {
  createCalendar,
  deleteCalendar,
  GetListOfCalendar,
} from "./calendar.service";
export const calendarRouter = Router();

calendarRouter.post(
  "/create",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    const userID = req.userId as string;
    try {
      const parsed = calendarSchema.safeParse(req.body);
      if (!parsed.success) {
        console.log(parsed.error.message);
        return res
          .status(400)
          .json({ message: "Invalid data", errors: parsed.error });
      }

      const result = await createCalendar(userID, parsed.data);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

calendarRouter.delete(
  "/delete/:id",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    const userID = req.userId as string;
    const eventID = req.params.id as string;

    try {
      await deleteCalendar(userID, eventID);
      res.status(200).json({
        message: "Event have been deleted successfully",
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

calendarRouter.get(
  "/get-list",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    const establishmentID = req.establishmentID as string;
    try {
      const result = await GetListOfCalendar(establishmentID);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);
