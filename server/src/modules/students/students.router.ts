import { Request, Response, Router } from "express";
import { RequireAuthOnly } from "../../middleware/auth.middleware";

export const studentRouter = Router();

studentRouter.post(
  "/create/:id",
  RequireAuthOnly,
  async (req: Request, res: Response) => {},
);
