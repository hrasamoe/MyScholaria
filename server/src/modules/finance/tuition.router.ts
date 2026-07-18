import { Router, Response, Request } from "express";
import {
  AuthRequest,
  RequireAuth,
  RequireAuthOnly,
} from "../../middleware/auth.middleware";
import {
  createTuition,
  deleteTuition,
  getFinanceOverview,
  editTuition,
  getTuitionList,
  saveStudentTuition,
} from "./tuition.service";
import { StudentTuitionSchema, TuitionSchema } from "./tuition.schema";
export const financeRouter = Router();
import { pool } from "../../db/pool";

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

financeRouter.put("/student-settings/:id", RequireAuth, async (req, res) => {
  const studentId = req.params.id as string;

  try {
    const validatedData = StudentTuitionSchema.parse(req.body);
    await saveStudentTuition(studentId, validatedData);
    res
      .status(200)
      .json({ message: "Financial configuration updated successfully" });
  } catch (error: any) {
    if (error.name === "ZodError") {
      console.error("Validation error:", error);
      return res.status(400).json({
        error: "Invalid data format",
        details: error.issues ?? error.errors,
      });
    }
    console.error("Unexpected error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

financeRouter.get("/student-settings/:id", RequireAuth, async (req, res) => {
  const studentId = req.params.id as string;

  try {
    const settingsQuery = `
            SELECT 
                student_id, 
                base_monthly_tuition::float, 
                discount_type, 
                discount_value::float, 
                total_paid_amount::float, 
                registration_fee::float, 
                is_registration_fee_paid, 
                notes
            FROM student_finance_settings
            WHERE student_id = $1;
        `;
    const settingsResult = await pool.query(settingsQuery, [studentId]);

    if (settingsResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Financial configuration not found" });
    }

    const monthsQuery = `
            SELECT 
                month_id AS id, 
                month_name AS month, 
                amount_due::float, 
                is_paid
            FROM student_tuition_months
            WHERE student_id = $1
            ORDER BY month_id::int ASC;
        `;
    const monthsResult = await pool.query(monthsQuery, [studentId]);

    const responseData = {
      ...settingsResult.rows[0],
      tuition_months: monthsResult.rows,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("GET student-settings error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

financeRouter.get(
  "/overview",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const establishmentID = req.establishmentID as string;
      if (!establishmentID) {
        return res.status(400).json({ message: "Missing establishmentID" });
      }

      const overview = await getFinanceOverview(establishmentID);
      res.status(200).json(overview);
    } catch (error: any) {
      console.error("GET /finance/overview error:", error);
      res
        .status(500)
        .json({ message: error.message || "Internal server error" });
    }
  },
);
