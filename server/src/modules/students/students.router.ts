import { Request, Response, Router } from "express";
import { RequireAuthOnly } from "../../middleware/auth.middleware";
import { studentSchema } from "./students.schema";
import {
  createStudent,
  deleteStudent,
  getStudentList,
} from "./students.service";

export const studentRouter = Router();

studentRouter.post(
  "/create/:id",
  RequireAuthOnly,
  async (req: Request, res: Response) => {
    const establishmentID = req.params.id as string;
    const parsed = studentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: parsed.error.flatten().fieldErrors,
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    try {
      const result = await createStudent(parsed.data, establishmentID);
      res.status(201).json({
        message: "Student created successfully",
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Internal server error",
      });
    }
  },
);

studentRouter.get(
  "/list/:id",
  RequireAuthOnly,
  async (req: Request, res: Response) => {
    const establishmentID = req.params.id as string;
    try {
      const students = await getStudentList(establishmentID);
      res.status(200).json(students);
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Internal server error",
      });
    }
  },
);

studentRouter.delete(
  "/delete/:id",
  RequireAuthOnly,
  async (req: Request, res: Response) => {
    const studentID = req.params.id as string;
    try {
      await deleteStudent(studentID);
      res.status(200).json({ message: "Student deleted successfully" });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Internal server error",
      });
    }
  },
);
