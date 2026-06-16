import { WebSocket, WebSocketServer } from "ws";
import { IncomingMessage, Server } from "http";

const clients = new Map<string, Set<WebSocket>>();

export const initWebSocketServer = (port: number | Server) => {
  const wss = new WebSocketServer(
    typeof port === "number" ? { port } : { server: port },
  );

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    const url = new URL(req.url!, "http://localhost");
    const userId = url.searchParams.get("userId");
    if (!userId) {
      ws.close();
      return;
    }

    if (!clients.has(userId)) clients.set(userId, new Set());
    clients.get(userId)!.add(ws);
    console.log(`User connected: ${userId} | Total users: ${clients.size}`);

    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.ping();
    }, 3000);

    ws.on("close", () => {
      clients.get(userId)?.delete(ws);
      if (clients.get(userId)?.size === 0) clients.delete(userId);
      clearInterval(pingInterval);
      console.log(`User disconnected: ${userId}`);
    });

    ws.on("error", (error) => {
      console.error(`WS error for ${userId}:`, error);
      clients.get(userId)?.delete(ws);
      clearInterval(pingInterval);
    });
  });

  if (typeof port === "number") {
    console.log(`Websocket server start on ws://localhost:${port}`);
  } else {
    console.log(`Websocket server attached to HTTP server`);
  }

  return wss;
};

export const sendToUser = (recipient_id: string, message: object): boolean => {
  const sockets = clients.get(recipient_id);
  if (!sockets || sockets.size === 0) {
    console.log(` User ${recipient_id} not connected`);
    return false;
  }

  let sent = false;
  for (const socket of sockets) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
      sent = true;
    }
  }

  console.log(
    sent
      ? `Message sent to ${recipient_id}`
      : `No OPEN socket for ${recipient_id}`,
  );
  return sent;
};
