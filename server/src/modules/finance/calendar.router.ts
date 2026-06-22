import { Response, Router } from "express";
import { AuthRequest, RequireAuth } from "../../middleware/auth.middleware";
import { calendarSchema } from "./calendar.schema";
import { createCalendar } from "./calendar.service";
export const calendarRouter = Router();

calendarRouter.post(
  "/create",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    const userID = req.userId as string;
    try {
      const parsed = calendarSchema.safeParse(req.body);
      if (!parsed.success) {
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

calendarRouter.post(
  "/delete/:id",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);
calendarRouter.post(
  "/get-list",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);
