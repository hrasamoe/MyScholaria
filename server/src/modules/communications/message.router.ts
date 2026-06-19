import { Request, Response, Router } from "express";
import { AuthRequest, RequireAuth } from "../../middleware/auth.middleware";
import { sendToUser } from "../../services/websocket/ws-server";
import { MessageSchema } from "./message.schema";
import {
  DeleteMessageForEveryone,
  DeleteMessageForMe,
  getHistory,
  getMessages,
  sendMessage,
} from "./message.service";

export const messageRouter = Router();

messageRouter.post(
  "/send/:senderID",
  RequireAuth,
  async (req: Request, res: Response) => {
    const userID = req.params.senderID as string;
    const { recipient_id, content } = req.body;
    try {
      const parsed = MessageSchema.parse({
        sender_id: userID,
        recipient_id,
        content,
      });

      const message = await sendMessage(parsed);

      const delivered = sendToUser(recipient_id, message);
      res.status(200).json({ success: true, message });
    } catch (error: any) {
      console.log(error.message);
      res.status(500).json({ message: error.message, error: error.message });
    }
  },
);

messageRouter.get(
  "/history-channels",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const currentUser = req.userId as string;
      const channels = await getHistory(currentUser);
      return res.json(channels);
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: error.message, error: error.message });
    }
  },
);

messageRouter.get(
  "/history/:userID",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const currentUserID = req.userId as string;
      const activeMemberID = req.params.userID as string;
      const messages = await getMessages(currentUserID, activeMemberID);
      return res.json(messages);
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: error.message, error: error.message });
    }
  },
);

messageRouter.put(
  "/remove-for-me/:messageID",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    const userID = req.userId as string;
    const messageID = req.params.messageID as string;
    try {
      await DeleteMessageForMe(messageID, userID);
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.log(error.message);
      res.status(500).json({ message: error.message, error: error.message });
    }
  },
);

messageRouter.put(
  "/remove-for-everyone/:messageID",
  RequireAuth,
  async (req: AuthRequest, res: Response) => {
    const userID = req.userId as string;
    const messageID = req.params.messageID as string;
    try {
      await DeleteMessageForEveryone(messageID, userID);
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.log(error.message);
      res.status(500).json({ message: error.message, error: error.message });
    }
  },
);
