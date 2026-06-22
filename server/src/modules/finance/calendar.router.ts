import { Response, Router } from "express";
import { AuthRequest, RequireAuth } from "../../middleware/auth.middleware";

export const calendarRouter = Router();

calendarRouter.post(
  "/create",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
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
