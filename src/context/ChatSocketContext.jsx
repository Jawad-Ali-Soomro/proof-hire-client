import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import { getStoredToken } from "../lib/api.js";
import { getSocketOrigin } from "../lib/socketUrl.js";
import { useAuth } from "./AuthContext.jsx";
import { useWallet } from "./WalletContext.jsx";

const ChatSocketContext = createContext(null);

export function ChatSocketProvider({ children }) {
  const { user } = useAuth();
  const { isConnected } = useWallet();
  const [connected, setConnected] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const socketRef = useRef(null);
  const listenersRef = useRef({ message: new Set(), task: new Set() });

  useEffect(() => {
    const token = getStoredToken();
    if (!isConnected || !user?.id || !token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
      return undefined;
    }

    const socket = io(`${getSocketOrigin()}/chat`, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("message", (payload) => {
      listenersRef.current.message.forEach((fn) => fn(payload));
    });
    socket.on("task", (payload) => {
      listenersRef.current.task.forEach((fn) => fn(payload));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [isConnected, user?.id]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !connected) return;

    if (activeConversationId) {
      socket.emit("join_conversation", { conversationId: activeConversationId });
    }

    return () => {
      if (activeConversationId) {
        socket.emit("leave_conversation", { conversationId: activeConversationId });
      }
    };
  }, [activeConversationId, connected]);

  const subscribe = useCallback((event, handler) => {
    listenersRef.current[event]?.add(handler);
    return () => listenersRef.current[event]?.delete(handler);
  }, []);

  const value = {
    connected,
    activeConversationId,
    setActiveConversationId,
    subscribe,
  };

  return <ChatSocketContext.Provider value={value}>{children}</ChatSocketContext.Provider>;
}

export function useChatSocket() {
  const ctx = useContext(ChatSocketContext);
  if (!ctx) throw new Error("useChatSocket must be used within ChatSocketProvider");
  return ctx;
}
