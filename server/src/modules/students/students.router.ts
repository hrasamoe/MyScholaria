import { Request, Response, Router } from "express";
import { RequireAuthOnly } from "../../middleware/auth.middleware";
import { studentSchema } from "./students.schema";
import {
  createStudent,
  deleteStudent,
  getStudentDetails,
  getStudentList,
  getStudentMainTeacher,
  updateStudent,
} from "./students.service";

export const studentRouter = Router();

studentRouter.post(
  "/create/:id",
  RequireAuthOnly,
  async (req: Request, res: Response) => {
    const establishmentID = req.params.id as string;
    const parsed = studentSchema.safeParse(req.body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const message = Object.entries(fieldErrors)
        .map(([field, errors]) => `${field}: ${errors?.join(", ")}`)
        .join(" | ");

      res.status(400).json({
        message,
        errors: fieldErrors,
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

studentRouter.get(
  "/details/:id",
  RequireAuthOnly,
  async (req: Request, res: Response) => {
    const studentID = req.params.id as string;
    try {
      const studentDetails = await getStudentDetails(studentID);
      res.status(200).json(studentDetails);
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Internal server error",
      });
    }
  },
);

studentRouter.get(
  "/teacher/:id",
  RequireAuthOnly,
  async (req: Request, res: Response) => {
    const studentID = req.params.id as string;
    try {
      const teacher = await getStudentMainTeacher(studentID);
      res.status(200).json(teacher);
    } catch (error: any) {
      console.log(error);
      res.status(500).json({
        message: error.message || "Internal server error",
      });
    }
  },
);

studentRouter.put(
  "/update/:id",
  RequireAuthOnly,
  async (req: Request, res: Response) => {
    const studentID = req.params.id as string;
    const parsed = studentSchema.safeParse(req.body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const message = Object.entries(fieldErrors)
        .map(([field, errors]) => `${field}: ${errors?.join(", ")}`)
        .join(" | ");

      res.status(400).json({
        message,
        errors: fieldErrors,
      });
      return;
    }
    try {
      await updateStudent(studentID, parsed.data);
      res.status(201).json({
        message: "Student data updated successfully",
      });
    } catch (error: any) {
      if (error.errors) {
        console.log(error.errors[0].message);
        res.status(500).json({
          message: error.errors[0].message,
          error: error.errors[0].message,
        });
        throw error.errors[0].message;
      }
      res.status(500).json({ message: error.message });
      throw error.message;
    }
  },
);
