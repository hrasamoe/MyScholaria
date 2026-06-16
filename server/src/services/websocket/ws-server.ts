import { WebSocket, WebSocketServer } from "ws";
import { IncomingMessage, Server } from "http";
import { StringValue } from "ms";

interface Client {
  userID: String;
  socket: WebSocket;
}

const client = new Map<string, WebSocket>();

export const initWebSocketServer = (port: number | Server) => {
  const wss = new WebSocketServer(
    typeof port === "number" ? { port: port } : { server: port },
  );

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    const url = new URL(req.url!, "http://localhost");
    const userId = url.searchParams.get("userId");
    if (!userId) {
      ws.close();
      return;
    }
    client.set(userId, ws);
    console.log(`User conected - Total: ${client.size}`);

    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, 3000);
    ws.on("close", () => {
      client.delete(userId);
      clearInterval(pingInterval);
      console.log("User disconnected");
    });
    ws.on("error", (error) => {
      console.log(`Error WS user ${userId}:`, error);
    });
  });
   if (typeof port === "number") {
     console.log(`Websocket server start on ws://localhost:${port}`);
   } else {
     console.log(`Websocket server attaché au serveur HTTP`);
   }
  return wss;
};

export const sendToUser = (recipient_id: string, message: object): boolean => {
  console.log("📋 Clients connectés:", [...client.keys()]);
  console.log("🎯 Envoi à:", recipient_id);

  const socket = client.get(recipient_id);
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
    console.log("✅ Message WS envoyé à", recipient_id);
    return true;
  }
  console.log("⚠️ Destinataire introuvable ou hors ligne");
  return false;
};
