import { Response, Router } from "express";
import { AuthRequest, RequireAuth } from "../../middleware/auth.middleware";
import { SubjectSchema } from "./subject.schema";
import {
  createSubject,
  deleteSubject,
  getSubjectList,
} from "./subject.service";

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
  "/edit/:subjectID/:classID",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
    } catch {}
  },
);

subjectRouter.delete(
  "/delete/:classID/:subjectID",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    const userID = req.userId as string;
    const classID = req.params.classID as string;
    const subjectID = req.params.subjectID as string;
    try {
      await deleteSubject(userID, subjectID, classID);
      res.status(200).json({
        message: "The subject has been deleted successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        error: error.message,
        message: error.message,
      });
    }
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
