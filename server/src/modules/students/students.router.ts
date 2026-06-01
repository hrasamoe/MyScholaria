import { Request, Response, Router } from "express";
import { RequireAuthOnly } from "../../middleware/auth.middleware";
import { studentSchema } from "./students.schema";
import { createStudent } from "./students.service";

export const studentRouter = Router();

studentRouter.post(
  "/create/:id",
  RequireAuthOnly,
  async (req: Request, res: Response) => {
    const establishmentID = req.params.id as string;
    const parsed = studentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: "Validation error",
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
