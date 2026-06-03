import { Request, Response, Router } from "express";
import { RequireAuthOnly } from "../../middleware/auth.middleware";
import { staffSchema } from "./staff.schema";
import { createStaff } from "./staff.service";

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
