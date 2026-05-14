import { Router, Request, Response } from "express";
import { establishementSchema, joinSchema } from "./establishments.schema";
import {
  createEtablishments,
  joinEstablishment,
} from "./establishement.service";
import { AuthRequest, RequireAuth } from "../../middleware/auth.middleware";

export const establishementRouter = Router();

establishementRouter.post(
  "/join",
  RequireAuth,
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
  RequireAuth,
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
