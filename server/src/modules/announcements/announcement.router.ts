import { Request, Response, Router } from "express";
import {
  AuthRequest,
  RequireAuth,
  RequireAuthOnly,
} from "../../middleware/auth.middleware";
import { announcementSchema } from "./announcement.schema";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
} from "./announcement.service";
export const announcementRouter = Router();

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
