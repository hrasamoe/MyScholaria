import { Request, Response, Router } from "express";
import { AuthRequest, RequireAuth } from "../../middleware/auth.middleware";
import { markAttendanceSchema } from "./attendance.schema";
import {
  getAccessibleClassSubjects,
  getRoster,
  markAttendance,
  getStudentAttendanceHistory,
  getAttendanceStats,
} from "./attendance.service";

export const attendanceRouter = Router();

attendanceRouter.get(
  "/class-subjects",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const list = await getAccessibleClassSubjects(
        req.userId as string,
        req.establishmentID as string,
      );
      res.status(200).json(list);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
);

attendanceRouter.get(
  "/roster",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const { classSubjectID, date } = req.query as {
        classSubjectID: string;
        date: string;
      };
      if (!classSubjectID || !date) {
        return res
          .status(400)
          .json({ message: "classSubjectID and date are required" });
      }
      const roster = await getRoster(
        req.userId as string,
        req.establishmentID as string,
        classSubjectID,
        date,
      );
      res.status(200).json(roster);
    } catch (error: any) {
      res.status(403).json({ message: error.message });
    }
  },
);

attendanceRouter.post(
  "/mark",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const parsed = markAttendanceSchema.parse(req.body);
      await markAttendance(
        req.userId as string,
        req.establishmentID as string,
        parsed.classSubjectID,
        parsed.date,
        parsed.entries,
      );
      res.status(200).json({ message: "Attendance recorded successfully" });
    } catch (error: any) {
      if (error.errors)
        return res.status(400).json({ message: error.errors[0].message });
      res.status(403).json({ message: error.message });
    }
  },
);

attendanceRouter.get(
  "/student/:id",
  RequireAuth,
  async (req: Request, res: Response) => {
    try {
      const history = await getStudentAttendanceHistory(
        req.params.id as string,
      );
      res.status(200).json(history);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

attendanceRouter.get(
  "/stats",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const { classSubjectID, startDate, endDate } = req.query as {
        classSubjectID: string;
        startDate: string;
        endDate: string;
      };
      if (!classSubjectID || !startDate || !endDate) {
        return res.status(400).json({
          message: "classSubjectID, startDate and endDate are required",
        });
      }
      const stats = await getAttendanceStats(
        req.userId as string,
        req.establishmentID as string,
        classSubjectID,
        startDate,
        endDate,
      );
      res.status(200).json(stats);
    } catch (error: any) {
      res.status(403).json({ message: error.message });
    }
  },
);
