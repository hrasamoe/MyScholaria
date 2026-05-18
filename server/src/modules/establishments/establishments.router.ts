import { Router, Request, Response } from "express";
import { establishementSchema, joinSchema } from "./establishments.schema";
import {
  approveMember,
  createEtablishments,
  findPendingMember,
  getMyEstablishment,
  joinEstablishment,
  selectEstablishment,
} from "./establishement.service";
import {
  AuthRequest,
  RequireAuth,
  RequireAuthOnly,
} from "../../middleware/auth.middleware";

export const establishementRouter = Router();

establishementRouter.post(
  "/join",
  RequireAuthOnly,
  async (req: Request, res: Response) => {
    try {
      const data = joinSchema.parse({
        userID: req.body.userID,
        establishmentID: req.body.establishmentID,
        role: req.body.role,
      });
      const newMember = await joinEstablishment(data);
      res.status(201).json({
        message: "New member add on the establishment",
      });
    } catch (err: any) {
      if (err.errors)
        return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: err.message });
    }
  },
);

establishementRouter.post(
  "/create",
  RequireAuthOnly,
  async (req: AuthRequest, res: Response) => {
    try {
      const data = establishementSchema.parse({
        name: req.body.name,
        code: req.body.code,
        type: req.body.type,
        address: req.body.address,
        phone: req.body.phone,
        email: req.body.email,
        identificationNumber: req.body.identificationNumber,
        joinCode: req.body.joinCode,
        adminCode: req.body.adminCode,
        city: req.body.city,
        zipCode: req.body.zipCode,
        owner_id: req.userId,
      });
      const establishement = await createEtablishments(data);
      res.status(201).json({
        message: "Establishment created successfully",
        data: {
          id: establishement.id,
          name: establishement.name,
          code: establishement.code,
          email: establishement.email,
          joinCode: establishement.join_code,
          adminCode: establishement.admin_code,
        },
      });
    } catch (err: any) {
      if (err.errors) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }

      res.status(400).json({
        message: err.message,
      });
    } finally {
    }
  },
);

establishementRouter.post(
  "/my",
  RequireAuth,
  async (req: Request, res: Response) => {
    try {
      const { userID } = req.body;
      const myEstablishment = await getMyEstablishment(userID);
      res.status(200).json({
        message: "My establishment retrieved successfully",
        data: myEstablishment,
      });
    } catch (error: any) {
      console.error("POST /my - Error:", error.message);
      res.status(400).json({
        message: error.message,
      });
    }
  },
);

establishementRouter.post(
  "/select",
  RequireAuthOnly,
  async (req: AuthRequest, res: Response) => {
    try {
      const { code, joinCode } = req.body;
      const result = await selectEstablishment(req.userId!, code, joinCode);
      res.status(200).json({ message: "Establishment selected", data: result });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },
);

establishementRouter.get(
  "/:id/pending-members",
  RequireAuthOnly,
  async (req: AuthRequest, res: Response) => {
    try {
      const establishementID = req.params.id;
      const members = await findPendingMember(establishementID as string);
      res.status(200).json(members);
    } catch (err: any) {
      if (err.errors) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      res.status(500).json({ error: "Error when fetching pending members " });
    }
  },
);

establishementRouter.post(
  "/approved-member",
  RequireAuthOnly,
  async (req: AuthRequest, res: Response) => {
    try {
      const { email, establishmentId } = req.body;
      const response = await approveMember(email, establishmentId);
      return res.status(200).json(response);
    } catch (error: any) {
      console.error(error);
      return res
        .status(400)
        .json({ message: error.message || "An error occurred" });
    }
  },
);