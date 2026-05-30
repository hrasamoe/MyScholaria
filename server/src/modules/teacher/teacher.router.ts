import { Request, Response, Router } from "express";
import { RequireAuthOnly } from "../../middleware/auth.middleware";
import { teacherSchema } from "./teacher.schema";
import { createTeacher, getTeacherList } from "./teacher.service";

export const teacherRouter = Router();

teacherRouter.post(
  "/create-teacher/:id",
  RequireAuthOnly,
  async (req: Request, res: Response) => {
    try {
      const establishmentID = req.params?.id as string;
      const body = req.body;
      const data = teacherSchema.parse({
        IDNumber: body.IDNumber,
        firstName: body.firstName,
        lastName: body.lastName,
        hire_date: body.hire_date,
        subject: body.subject,
        email: body.email || undefined,
        phone: body.phone || undefined,
        address: body.address || undefined,
        gender: body.gender || undefined,
        contractType: body.contractType || undefined,
        hpw: body.hpw || undefined,
      });

      await createTeacher(data, establishmentID);
      res.status(201).json({ message: "Teacher created successfully" });
    } catch (error: any) {
      if (error.errors) {
        console.log("ZOD ERRORS:", JSON.stringify(error.errors, null, 2));
        return res
          .status(400)
          .json({ message: error.errors[0].message, errors: error.errors });
      }
      console.log("OTHER ERROR:", error.message);
      res.status(400).json({ error: error.message });
    }
  },
);

teacherRouter.get(
  "/get-list/:id",
  RequireAuthOnly,
  async (req: Request, res: Response) => {
    try {
      const establishmentID = req.params?.id as string;
      const teacherList = await getTeacherList(establishmentID);
      res.status(200).json(teacherList);
    } catch (error: any) {
      if (error.errors) {
        console.log("ZOD ERRORS:", JSON.stringify(error.errors, null, 2));
        return res
          .status(400)
          .json({ message: error.errors[0].message, errors: error.errors });
      }
      console.log("OTHER ERROR:", error.message);
      res.status(400).json({ error: error.message });
    }
  },
);
