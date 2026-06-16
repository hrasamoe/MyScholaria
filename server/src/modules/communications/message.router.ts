import { Request, Response, Router } from "express";
import { MessageSchema } from "./message.schema";
import { sendMessage } from "./message.service";
import { sendToUser } from "../../services/websocket/ws-server";

export const messageRouter = Router();

messageRouter.post("/send/:senderID", async (req: Request, res: Response) => {
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
});
