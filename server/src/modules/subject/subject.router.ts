import { Request, Response, Router } from "express";
import { RequireAuth } from "../../middleware/auth.middleware";
export const subjectRouter = Router();

subjectRouter.post(
  "/create",
  RequireAuth,
  async (req: Request, res: Response) => {
    try {
    } catch {}
  },
);

subjectRouter.put(
  "/edit/:subjectID",
  RequireAuth,
  async (req: Request, res: Response) => {
    try {
    } catch {}
  },
);

subjectRouter.delete(
  "/delete/:subjectID",
  RequireAuth,
  async (req: Request, res: Response) => {
    try {
    } catch {}
  },
);
subjectRouter.get(
  "/list",
  RequireAuth,
  async (req: Request, res: Response) => {
    try {
    } catch {}
  },
);
