import { Request, Response, Router } from "express";
import { RequireAuthOnly } from "../../middleware/auth.middleware";
import { announcementSchema } from "./notification.schema";
import { createAnnouncement } from "./notification.service";
export const announcementRouter = Router();

announcementRouter.post(
  "/create/:userID",
  RequireAuthOnly,
  async (req: Request, res: Response) => {
    const userID = req.params.userID as string;
    const parsed = announcementSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: "Validation error",
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }
    try {
      const result = await createAnnouncement(userID, parsed.data);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({
        message: error.message,
      });
    }
  },
);
