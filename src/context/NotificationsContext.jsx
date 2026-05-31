import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import { apiRequest, getStoredToken } from "../lib/api.js";
import { getSocketOrigin } from "../lib/socketUrl.js";
import { useAuth } from "./AuthContext.jsx";
import { useWallet } from "./WalletContext.jsx";

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const { isConnected } = useWallet();
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);

  const load = useCallback(async () => {
    const token = getStoredToken();
    if (!token || !user?.id) return;
    setLoading(true);
    try {
      const [list, countRes] = await Promise.all([
        apiRequest("/notifications?limit=50", { token }),
        apiRequest("/notifications/unread-count", { token }),
      ]);
      setItems(Array.isArray(list) ? list : []);
      setUnreadCount(countRes?.count ?? 0);
    } catch {
      /* keep prior state */
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!isConnected || !user?.id) {
      setItems([]);
      setUnreadCount(0);
      return undefined;
    }
    void load();
    return undefined;
  }, [isConnected, user?.id, load]);

  useEffect(() => {
    const token = getStoredToken();
    if (!isConnected || !user?.id || !token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
      return undefined;
    }

    const socket = io(`${getSocketOrigin()}/notifications`, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 12,
    });
    socketRef.current = socket;

    socket.on("connect", () => setSocketConnected(true));
    socket.on("disconnect", () => setSocketConnected(false));

    socket.on("notification", (payload) => {
      if (!payload?.id) return;
      setItems((prev) => {
        if (prev.some((n) => n.id === payload.id)) return prev;
        return [payload, ...prev].slice(0, 50);
      });
      if (!payload.read) {
        setUnreadCount((c) => c + 1);
      }
    });

    socket.on("unread_count", (payload) => {
      if (typeof payload?.count === "number") {
        setUnreadCount(payload.count);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
    };
  }, [isConnected, user?.id]);

  const markRead = useCallback(async (id) => {
    const token = getStoredToken();
    if (!token) return;
    try {
      const updated = await apiRequest(`/notifications/${id}/read`, {
        method: "PATCH",
        token,
      });
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, ...updated, read: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      /* ignore */
    }
  }, []);

  const markAllRead = useCallback(async () => {
    const token = getStoredToken();
    if (!token) return;
    try {
      await apiRequest("/notifications/read-all", { method: "PATCH", token });
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({
      items,
      unreadCount,
      loading,
      socketConnected,
      reload: load,
      markRead,
      markAllRead,
    }),
    [items, unreadCount, loading, socketConnected, load, markRead, markAllRead],
  );

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }
  return ctx;
}
