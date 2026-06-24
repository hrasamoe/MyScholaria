import { Response, Router } from "express";
import { AuthRequest, RequireAuth } from "../../middleware/auth.middleware";
import { SubjectSchema } from "./subject.schema";
import {
  AssignSubjectToTeacher,
  createSubject,
  deleteSubject,
  editSubject,
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
  "/edit/:subjectID",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const userID = req.userId as string;
      const subjectID = req.params.subjectID as string;
      const parsed = SubjectSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new Error(JSON.stringify(parsed.error.flatten().fieldErrors));
      }
      const result = await editSubject(userID, parsed.data, subjectID);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message, message: error.message });
    }
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

subjectRouter.put("/assign-teacher", RequireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const subjectID = req.body.subjectClassId as string;
    const teacherID = req.body.teacherId as string;
    await AssignSubjectToTeacher(subjectID, teacherID);
    res.status(200).json({ message: "Teacher assigned successfully" });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      error: error.message,
      message: error.message,
    } )
  }
})