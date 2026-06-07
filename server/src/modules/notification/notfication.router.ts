import { Request, Response, Router } from "express";
import { RequireAuthOnly } from "../../middleware/auth.middleware";
import { announcementSchema, NotificationSchema } from "./notification.schema";
import {
  createAnnouncement,
  createNotification,
  deleteAnnouncement,
  getAnnouncements,
} from "./notification.service";
export const announcementRouter = Router();
export const notificationROuter = Router();

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

announcementRouter.get(
  "/get-list/:id",
  RequireAuthOnly,
  async (req: Request, res: Response) => {
    const establishmentID = req.params.id as string;
    try {
      const result = await getAnnouncements(establishmentID);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({
        message: error.message,
      });
    }
  },
);

announcementRouter.delete(
  "/delete/:id",
  RequireAuthOnly,
  async (req: Request, res: Response) => {
    const announcemenID = req.params.id as string;
    try {
      await deleteAnnouncement(announcemenID);
      res.status(200).json({
        message: "Announcement deleted successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message,
      });
    }
  },
);

notificationROuter.post(
  "/create/:userID",
  RequireAuthOnly,
  async (req: Request, res: Response) => {
    const userID = req.params.userID as string;
    console.log(req.body);
    const parsed = NotificationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: "Validation error",
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }
    try {
      const result = await createNotification(userID, parsed.data);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({
        message: error.message,
      });
    }
  },
);
