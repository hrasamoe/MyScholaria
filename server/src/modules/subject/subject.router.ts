import { Response, Router } from "express";
import { AuthRequest, RequireAuth } from "../../middleware/auth.middleware";
import { SubjectSchema } from "./subject.schema";
import { createSubject, getSubjectList } from "./subject.service";
export const subjectRouter = Router();

subjectRouter.post(
  "/create",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    const userID = req.userId as string;
    const establishmentID = req.establishmentID as string;
    try {
      const parsed = SubjectSchema.safeParse(req.body);
      if (!parsed.success) {
        console.log(parsed.error);
        throw new Error(JSON.stringify(parsed.error.flatten().fieldErrors));
      }
      const result = await createSubject(userID, establishmentID, parsed.data);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({
        message: error.message,
        error: error.message,
      });
    }
  },
);

subjectRouter.put(
  "/edit/:subjectID",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
    } catch {}
  },
);

subjectRouter.delete(
  "/delete/:subjectID",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
    } catch {}
  },
);
subjectRouter.get(
  "/list",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const establishmentID = req.establishmentID as string;
      const response = await getSubjectList(establishmentID);
      res.status(200).json(response);
    } catch (error: any) {
      res.status(500).json({
        message: error.message,
        error: error.message,
      });
    }
  },
);
