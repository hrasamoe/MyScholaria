import { Request, Response, Router } from "express";
import { MessageSchema } from "./message.schema";
import { sendMessage } from "./message.service";

export const messageRouter = Router();

messageRouter.post("/send/:senderID", async (req: Request, res: Response) => {
  const userID = req.params.senderID as string;
  try {
    const parsed = MessageSchema.parse({
      sender_id: userID,
      recipient_id: req.body.recipient_id,
      content: req.body.content,
    });

    await sendMessage(parsed);
    res.status(200).json({ message: "Message sent successfully" });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ message: error.message, error: error.message });
  }
});
