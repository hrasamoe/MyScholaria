import { Request, Response, Router } from "express";
import {
  AuthRequest,
  RequireAuth,
  RequireAuthOnly,
} from "../../middleware/auth.middleware";
import { NotificationSchema } from "./notification.schema";
import {
  createNotification,
  deleteNotification,
  getAllAlerts,
  getNotification,
  markAllNotificationAsRead,
  markNotificationAsRead,
} from "./notification.service";
export const notificationROuter = Router();

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
  "/get-list",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    const establishmentID = req.establishmentID as string;
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
    const userID = req.userId as string;
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
