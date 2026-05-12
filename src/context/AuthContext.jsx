import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiRequest, getStoredToken, setStoredToken } from "../lib/api.js";
import { useWallet } from "./WalletContext.jsx";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { address, wallet, isConnected } = useWallet();

  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(isConnected));

  const applyAuthPayload = useCallback((data) => {
    if (data?.access_token) {
      setToken(data.access_token);
      setStoredToken(data.access_token);
    }
    if (data?.user) setUser(data.user);
  }, []);

  const refreshUser = useCallback(async () => {
    const t = getStoredToken();
    if (!t) return null;
    try {
      const me = await apiRequest("/profile/me", { token: t });
      setUser(me);
      return me;
    } catch {
      setUser(null);
      setToken(null);
      setStoredToken(null);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!address) {
      setToken(null);
      setUser(null);
      setStoredToken(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const data = await apiRequest("/auth/wallet", {
          method: "POST",
          body: { address, chainId: wallet?.chainId },
          token: null,
        });
        if (cancelled) return;
        applyAuthPayload(data);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setUser(null);
          setToken(null);
          setStoredToken(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [address, wallet?.chainId, applyAuthPayload]);

  const logoutSession = useCallback(() => {
    setToken(null);
    setUser(null);
    setStoredToken(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      profileComplete: Boolean(user?.profileComplete),
      applyAuthPayload,
      refreshUser,
      logoutSession,
    }),
    [
      token,
      user,
      loading,
      applyAuthPayload,
      refreshUser,
      logoutSession,
    ]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
