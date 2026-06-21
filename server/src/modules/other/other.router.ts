import { Request, Response, Router } from "express";
import {
  AuthRequest,
  RequireAuth,
  RequireAuthOnly,
} from "../../middleware/auth.middleware";
import { parentSchema, roomSchema } from "./other.schema";
import {
  createParent,
  createRoom,
  deleteParent,
  deleteRoom,
  getParentDetails,
  getParentList,
  getRooms,
  updateParent,
  updateRoomsDetails,
} from "./other.service";

export const utilschemaRouter = Router();

utilschemaRouter.post(
  "/create-parent",
  RequireAuth,
  async (req: AuthRequest | Request | any, res: Response) => {
    try {
      const establishmentId = req.establishmentID as string;

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
  "/get-parent-list",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const establishmentId = req.establishmentID as string;
      const parentList = await getParentList(establishmentId);
      res.status(200).json(parentList);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

utilschemaRouter.delete(
  "/delete-parent/:id",
  RequireAuthOnly,
  async (req: Request, res: Response) => {
    try {
      const parentId = req.params?.id || req.body.parentId;
      await deleteParent(parentId);
      res.status(200).json({ message: "Parent deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

utilschemaRouter.get(
  "/get-parent-details/:id",
  RequireAuthOnly,
  async (req: Request, res: Response) => {
    try {
      const parentId = req.params?.id || req.body.parentId;
      const parentDetails = await getParentDetails(parentId);
      res.status(200).json(parentDetails);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

utilschemaRouter.put(
  "/update-parent/:id",
  RequireAuthOnly,
  async (req: Request, res: Response) => {
    try {
      const parentId = req.params?.id || req.body.parentId;
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
      const updatedParent = await updateParent(data, parentId);
      res.status(200).json({
        message: "Parent updated successfully",
        data: updatedParent,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
);

utilschemaRouter.post(
  "/create-classroom",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const estalishmentID = req.establishmentID as string;
      const data = roomSchema.parse({
        name: req.body.name,
        building: req.body.building,
        capacity: req.body.capacity,
        type: req.body.type,
        equipment: req.body.equipment,
      });
      const newRoom = await createRoom(estalishmentID, data);
      res.status(201).json({
        message: "New classroom created successfully",
        data: newRoom,
      });
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(400).json({ message: error.message });
    }
  },
);

utilschemaRouter.get(
  "/get-classrooms",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const establishmentID = req.establishmentID;
      const roomList = await getRooms(establishmentID);
      res.status(200).json(roomList);
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: error.message });
    }
  },
);

utilschemaRouter.put(
  "/update-classroom/:id",
  RequireAuthOnly,
  async (req: Request, res: Response) => {
    try {
      const roomID = req.params?.id;
      const data = roomSchema.parse({
        name: req.body.name,
        building: req.body.building,
        capacity: req.body.capacity,
        type: req.body.type,
        equipment: req.body.equipment,
      });
      const updatedRoom = await updateRoomsDetails(roomID, data);
      res.status(200).json({
        message: "Classroom updated successfully",
        data: updatedRoom,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
);

utilschemaRouter.delete(
  "/delete-classroom/:id",
  RequireAuthOnly,
  async (req: Request, res: Response) => {
    try {
      const roomID = req.params?.id;
      await deleteRoom(roomID);
      res.status(200).json({ message: "Classroom deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);
