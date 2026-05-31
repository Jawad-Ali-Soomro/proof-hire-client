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
  const [loading, setLoading] = useState(true);

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

  // On mount, try to restore session from stored token
  useEffect(() => {
    const stored = getStoredToken();
    if (stored) {
      (async () => {
        try {
          const me = await apiRequest("/profile/me", { token: stored });
          setUser(me);
          setToken(stored);
        } catch {
          setStoredToken(null);
          setToken(null);
          setUser(null);
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setLoading(false);
    }
  }, []);

  const linkWalletToAccount = useCallback(
    async (walletAddress, chainId) => {
      const t = getStoredToken();
      if (!t) throw new Error("You must be logged in to link a wallet.");

      const addr = walletAddress ?? address;
      if (!addr) throw new Error("No wallet address to link.");

      const data = await apiRequest("/auth/link-wallet", {
        method: "POST",
        body: { address: addr, chainId: chainId ?? wallet?.chainId },
        token: t,
      });
      if (data?.user) setUser(data.user);
      return data;
    },
    [address, wallet?.chainId],
  );

  // If wallet connects while logged in but not yet linked in the DB, link automatically
  useEffect(() => {
    if (!address || !token || user?.wallet?.address) return;
    (async () => {
      try {
        await linkWalletToAccount(address, wallet?.chainId);
      } catch {
        /* wallet may belong to another account — modal shows the error on manual link */
      }
    })();
  }, [address, wallet?.chainId, token, user?.wallet?.address, linkWalletToAccount]);

  // If wallet connects but user is NOT logged in, try wallet auth (legacy)
  useEffect(() => {
    if (!address || token) return;
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
      } catch {
        if (!cancelled) {
          setUser(null);
          setToken(null);
          setStoredToken(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [address, wallet?.chainId, token, applyAuthPayload]);

  const login = useCallback(async (email, password) => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: { email, password },
      token: null,
    });
    applyAuthPayload(data);
    return data;
  }, [applyAuthPayload]);

  const signup = useCallback(async ({ email, username, password, role }) => {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: { email, username, password, role },
      token: null,
    });
    applyAuthPayload(data);
    return data;
  }, [applyAuthPayload]);

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
      isWalletLinked: Boolean(user?.wallet?.address),
      applyAuthPayload,
      refreshUser,
      linkWalletToAccount,
      login,
      signup,
      logoutSession,
    }),
    [
      token,
      user,
      loading,
      applyAuthPayload,
      refreshUser,
      linkWalletToAccount,
      login,
      signup,
      logoutSession,
    ],
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
