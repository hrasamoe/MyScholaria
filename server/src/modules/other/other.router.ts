import { Router, Request, Response } from "express";
import { parentSchema } from "./other.schema";
import { getParentList, createParent } from "./other.service";
import {
  AuthRequest,
  RequireAuth,
  RequireAuthOnly,
} from "../../middleware/auth.middleware";

export const utilschemaRouter = Router();

utilschemaRouter.post(
  "/create-parent/:id",
  RequireAuthOnly,
  async (req: AuthRequest | Request | any, res: Response) => {
    try {
      const establishmentId = req.params?.id || req.body.establishmentId;

      const data = parentSchema.parse({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        gender: req.body.gender,
        profession: req.body.profession,
        phone: req.body.phone,
        address: req.body.address,
        fullname: req.body.fullname,
      });

      const newParent = await createParent(data, establishmentId);

      res.status(201).json({
        message: "New parent created successfully",
        data: newParent,
      });
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: error.message });
    }
  },
);

utilschemaRouter.get(
  "/get-parent-list/:id",
  RequireAuthOnly,
  async (req: Request, res: Response) => {
    try {
      const establishmentId = req.params?.id || req.body.establishmentId;
      const parentList = await getParentList(establishmentId);
      res.status(200).json(parentList);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);
