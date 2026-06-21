import { Request, Response, Router } from "express";
import { AuthRequest, RequireAuth, RequireAuthOnly } from "../../middleware/auth.middleware";
import { announcementSchema, NotificationSchema } from "./notification.schema";
import {
  createAnnouncement,
  createNotification,
  deleteAnnouncement,
  deleteNotification,
  getAnnouncements,
  getAllAlerts,
  getNotification,
  markAllNotificationAsRead,
  markNotificationAsRead,
} from "./notification.service";
export const announcementRouter = Router();
export const notificationROuter = Router();

announcementRouter.post(
  "/create",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    const userID = req.userId as string;
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
  "/create",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    const userID = req.userId as string;
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

notificationROuter.delete(
  "/delete/:id",
  RequireAuthOnly,
  async (req: Request, res: Response) => {
    const notificationID = req.params.id as string;
    try {
      await deleteNotification(notificationID);
      res.status(200).json({
        message: "Notification deleted successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message,
      });
    }
  },
);

notificationROuter.get(
  "/get-list/:id",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    const establishmentID = req.params.id as string;
    const userID = req.userId as string;
    try {
      const result = await getNotification(establishmentID, userID);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({
        message: error.message,
      });
    }
  },
);

notificationROuter.put(
  "/mark-all-read",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    const userID = req.userId as string;
    try {
      await markAllNotificationAsRead(userID);
      res.status(201).json({
        message: "Change made successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message,
      });
    }
  },
);

notificationROuter.put(
  "/mark-read/:id",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    const notificationID = req.params.id as string;
    const userID = req.userId as string
    try {
      await markNotificationAsRead(notificationID, userID);
      res.status(201).json({
        message: "Change made successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        error: error.message,
      });
    }
  },
);

notificationROuter.get(
  "/alerts",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    const establishmentID = req.establishmentID as string;
    const userID = req.userId as string;
    try {
      const result = await getAllAlerts(establishmentID, userID);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({
        message: error.message,
        error: error.message,
      });
    }
  },
);
