import { Request, Response, Router } from "express";
import { RequireAuthOnly } from "../../middleware/auth.middleware";
import { staffSchema } from "./staff.schema";
import {
  createStaff,
  deleteStaff,
  getStaffDetails,
  getStaffList,
  updateStaff,
} from "./staff.service";

export const staffRouter = Router();

staffRouter.post(
  "/create/:id",
  RequireAuthOnly,
  async (req: Request, res: Response) => {
    const establishementID = req.params.id as string;
    const parsed = staffSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: parsed.error.flatten().fieldErrors,
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }
    try {
      await createStaff(establishementID, parsed.data);
      res.status(201).json({ message: "Staff created successfully" });
    } catch (error: any) {
      res.status(500).json({
        messsage: error.message || "Internal server errror",
      });
    }
  },
);

staffRouter.get(
  "/list/:id",
  RequireAuthOnly,
  async (req: Request, res: Response) => {
    const establishementID = req.params.id as string;
    try {
      const result = await getStaffList(establishementID);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Internal server error",
      });
    }
  },
);

staffRouter.delete(
  "/delete/:id",
  RequireAuthOnly,
  async (req: Request, res: Response) => {
    const staffID = req.params.id as string;
    try {
      await deleteStaff(staffID);
      res.status(200).json({ message: "Staff member deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ errors: error.message, message: error.message });
    }
  },
);

staffRouter.get(
  "/details/:id",
  RequireAuthOnly,
  async (req: Request, res: Response) => {
    const staffID = req.params.id as string;
    try {
      const result = await getStaffDetails(staffID);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ errors: error.message, message: error.message });
    }
  },
);

staffRouter.put(
  "/update/:id",
  RequireAuthOnly,
  async (req: Request, res: Response) => {
    const staffID = req.params.id as string;
    const parsed = staffSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: parsed.error.flatten().fieldErrors,
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }
    try {
      await updateStaff(staffID, parsed.data);
      res.status(200).json({ message: "Staff member updated successfully" });
    } catch (error: any) {
      res.status(400).json({ errors: error.message, message: error.message });
    }
  },
);
