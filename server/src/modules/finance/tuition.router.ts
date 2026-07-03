import { Router, Response, Request } from "express";
import {
  AuthRequest,
  RequireAuth,
  RequireAuthOnly,
} from "../../middleware/auth.middleware";
import {
  createTuition,
  deleteTuition,
  editTuition,
  getTuitionList,
} from "./tuition.service";
import { TuitionSchema } from "./tuition.schema";
export const financeRouter = Router();

financeRouter.post(
  "/tuition-rules",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const userID = req.userId as string;
      const parsed = TuitionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.format() });
      }
      const newTuition = await createTuition(parsed.data, userID);
      res
        .status(201)
        .json({ message: "Tuition created with success", data: newTuition });
    } catch (error: any) {
      res.status(500).json({ message: error.message, error: error.message });
    }
  },
);

financeRouter.get(
  "/tuition-rules",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const establishmentID = req.establishmentID as string;
      if (!establishmentID) {
        return res
          .status(400)
          .json({ message: "Missing establishmentID query parameter" });
      }

      const tuitionList = await getTuitionList(establishmentID);
      res.status(200).json(tuitionList);
    } catch (error: any) {
      res.status(500).json({ message: error.message, error: error.message });
    }
  },
);

financeRouter.put(
  "/tuition-rules/:id",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    const tuitionID = req.params.id as string;
    const parsed = TuitionSchema.safeParse(req.body);
    const userID = req.userId as string;
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.format() });
    }
    if (!tuitionID) {
      throw new Error("Missing tuitionID");
    }
    try {
      const result = await editTuition(tuitionID, parsed.data, userID);
      res.status(201).json({
        message: "Tuition updated successfully",
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message,
        error: error.message,
      });
    }
  },
);

financeRouter.delete(
  "/tuition-rules/:id",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    const TuitionID = req.params.id as string;
    const userID = req.userId as string;
    try {
      await deleteTuition(TuitionID, userID);
      res.status(200).json({
        message: "The tuition data has been deleted successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        error: error.message,
        message: error.message,
      });
    }
  },
);
