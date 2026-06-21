import { Request, Response, Router } from "express";
import {
  AuthRequest,
  RequireAuth,
  RequireAuthOnly,
} from "../../middleware/auth.middleware";
import {
  approveMember,
  createClasses,
  createEtablishments,
  deleteClass,
  editClass,
  findAllMemberAproved,
  findPendingMember,
  getClassList,
  getMyEstablishment,
  joinEstablishment,
  selectEstablishment,
} from "./establishement.service";
import {
  ClassInfo,
  establishementSchema,
  joinSchema,
} from "./establishments.schema";

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
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(400).json({ message: error.message });
    } finally {
    }
  },
);

establishementRouter.post(
  "/my",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const userID = req.userId as string;
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
  "/pending-members",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const establishementID = req.establishmentID;
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

establishementRouter.get(
  "/all-users",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const establishementID = req.establishmentID;
      const allmembers = await findAllMemberAproved(establishementID as string);
      res.status(200).json(allmembers);
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({
          message: error.errors[0].message,
        });
      }
      res.status(500).json({ error: "Error when fetching your users" });
    }
  },
);

establishementRouter.post(
  "/approved-member",
  RequireAuthOnly,
  async (req: AuthRequest, res: Response) => {
    try {
      const establishmentId = req.establishmentID as string;
      const { email, isAproved, role } = req.body;
      const response = await approveMember(
        email,
        establishmentId,
        isAproved,
        role,
      );
      return res.status(200).json(response);
    } catch (error: any) {
      console.error(error);
      return res
        .status(400)
        .json({ message: error.message || "An error occurred" });
    }
  },
);

establishementRouter.post(
  "/classes",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const establishmentID = req.establishmentID as string;
      const classData = req.body as ClassInfo;
      const newClass = await createClasses(establishmentID, classData);
      res.status(201).json({
        message: "Class created successfully",
        data: newClass,
      });
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(400).json({ message: error.message });
    }
  },
);

establishementRouter.get(
  "/classes-list",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const establishmentID = req.establishmentID as string;
      const classList = await getClassList(establishmentID);
      res.status(200).json(classList);
    } catch (error: any) {
      if (error.errors) {
        console.log(
          "An error was occured while fetching the class list:",
          error.errors[0].message,
        );
        return res.status(400).json({
          message: error.errors[0].message,
        });
      }
      res
        .status(500)
        .json({ message: "An error occurred while creating the class" });
    }
  },
);

establishementRouter.put(
  "/edit-classes/:id",
  RequireAuthOnly,
  async (req: Request, res: Response) => {
    try {
      const classID = req.params.id as string;
      const classData = req.body as ClassInfo;
      const newClass = await editClass(classID, classData);
      res.status(201).json({
        message: "Class updated successfully",
        data: newClass,
      });
    } catch (error: any) {
      if (error.errors) {
        console.log(
          "An error was occured while editing the class:",
          error.errors[0].message,
        );
        return res.status(400).json({
          message: error.errors[0].message,
        });
      }

      res
        .status(500)
        .json({ message: "An error occurred while updating the class" });
    }
  },
);

establishementRouter.delete(
  "/delete-classes/:classID",
  RequireAuth,
  async (req: Request, res: Response) => {
    try {
      const classID = req.params.classID as string;
      await deleteClass(classID);
      res.status(200).json({
        message: "Class deleted successfully",
      });
    } catch (error: any) {
      if (error.errors) {
        console.log(
          "An error was occured while deleting the class:",
          error.errors[0].message,
        );
        return res.status(400).json({
          message: error.errors[0].message,
        });
      }

      res
        .status(500)
        .json({ message: "An error occurred while deleting the class" });
    }
  },
);
