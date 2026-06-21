import { Request, Response, Router } from "express";
import { RequireAuth, RequireAuthOnly, AuthRequest } from "../../middleware/auth.middleware";
import { teacherSchema } from "./teacher.schema";
import {
  createTeacher,
  deleteTeacher,
  getTeacherDetails,
  getTeacherList,
  updateTeacher,
} from "./teacher.service";

export const teacherRouter = Router();

teacherRouter.post(
  "/create-teacher",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const establishmentID = req.establishmentID as string;
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
        qualification: body.qualification || undefined,
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
  "/get-list",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const establishmentID = req.establishmentID as string;
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

teacherRouter.get(
  "/details/:id",
  RequireAuthOnly,
  async (req: Request, res: Response) => {
    try {
      const teacherID = req.params?.id as string;
      const teacherDetails = await getTeacherDetails(teacherID);
      res.status(200).json(teacherDetails);
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

teacherRouter.put(
  "/update/:id",
  RequireAuthOnly,
  async (req: Request, res: Response) => {
    try {
      const teacherID = req.params?.id as string;
      const body = req.body;
      const data = teacherSchema.parse({
        firstName: body.firstName,
        IDNumber: body.IDNumber,
        lastName: body.lastName,
        hire_date: body.hire_date,
        gender: body.gender,
        subject: body.subject,
        hpw: body.hpw,
        contractType: body.contractType,
        qualification: body.qualification,
        email: body.email || undefined,
        phone: body.phone || undefined,
        address: body.address || undefined,
      });

      await updateTeacher(teacherID, data);
      res.status(200).json({ message: "Teacher updated successfully" });
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

teacherRouter.delete(
  "/delete/:id",
  RequireAuthOnly,
  async (req: Request, res: Response) => {
    try {
      const teacherID = req.params?.id as string;
      await deleteTeacher(teacherID);
      res.status(200).json({ message: "Teacher deleted successfully" });
    } catch (error: any) {
      console.log("ERROR:", error.message);
      res.status(400).json({ error: error.message });
    }
  },
);
