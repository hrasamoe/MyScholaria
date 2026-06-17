import { useAuth } from "@/hooks/Authcontext";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import ReconnectingWebSocket from "reconnecting-websocket";

interface NotificationContextType {
  unreadCounts: Map<string, number>;
  clearUnread: (userId: string) => void;
  onNewMessage: (cb: (msg: any) => void) => () => void;
  playSound: (type: SoundType) => void;
}

type SoundType = "message" | "delete" | "success" | "error";

const SOUNDS: Record<SoundType, string> = {
  message: "/sound/notification.mp3",
  delete: "/sound/delete.mp3",
  success: "/sound/success.mp3",
  error: "/sound/error.mp3",
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const currentUserID = user?.id;
  const [unreadCounts, setUnreadCounts] = useState<Map<string, number>>(
    new Map(),
  );
  const wsRef = useRef<ReconnectingWebSocket | null>(null);
  const listenersRef = useRef<Set<(msg: any) => void>>(new Set());
  const audioCache = useRef<Map<SoundType, HTMLAudioElement>>(new Map());

  const playSound = (type: SoundType) => {
    if (!audioCache.current.has(type)) {
      audioCache.current.set(type, new Audio(SOUNDS[type]));
    }
    const audio = audioCache.current.get(type);
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  };

  useEffect(() => {
    const unlockAudio = () => {
      Object.keys(SOUNDS).forEach((key) => {
        const type = key as SoundType;
        if (!audioCache.current.has(type)) {
          const audio = new Audio(SOUNDS[type]);
          audio.load();
          audioCache.current.set(type, audio);
        }
      });
      window.removeEventListener("click", unlockAudio);
    };

    window.addEventListener("click", unlockAudio);
    return () => window.removeEventListener("click", unlockAudio);
  }, []);

  useEffect(() => {
    if (!currentUserID) return;
    const ws = new ReconnectingWebSocket(
      `${import.meta.env.VITE_WS_URL}?userId=${currentUserID}`,
    );
    wsRef.current = ws;
    ws.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      listenersRef.current.forEach((cb) => cb(newMessage));
      playSound("message");
      setUnreadCounts((prev) => {
        const next = new Map(prev);
        next.set(
          newMessage.sender_id,
          (next.get(newMessage.sender_id) ?? 0) + 1,
        );
        return next;
      });
    };
    return () => ws.close();
  }, [currentUserID]);

  const clearUnread = (userId: string) => {
    setUnreadCounts((prev) => {
      const next = new Map(prev);
      next.delete(userId);
      return next;
    });
  };

  const onNewMessage = (cb: (msg: any) => void) => {
    listenersRef.current.add(cb);
    return () => listenersRef.current.delete(cb);
  };

  return (
    <NotificationContext.Provider
      value={{ unreadCounts, clearUnread, onNewMessage, playSound }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error("useNotification must be used inside NotificationProvider");
  return ctx;
};
