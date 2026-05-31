import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest, getStoredToken } from "../lib/api.js";

const POLL_MS = 12_000;

/**
 * Live dashboard stats — initial fetch + polling while tab is visible.
 * @param {"CLIENT" | "FREELANCER"} expectedRole
 */
export function useDashboardStats(expectedRole) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const mountedRef = useRef(true);

  const userId = user?.id;
  const userRole = user?.role;

  const load = useCallback(
    async (silent = false) => {
      if (!userId || userRole !== expectedRole) {
        setStats(null);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      if (!silent) setLoading(true);
      else setRefreshing(true);
      setError("");
      try {
        const data = await apiRequest("/dashboard/stats", { token: getStoredToken() });
        if (data?.role !== expectedRole) {
          throw new Error("Dashboard stats do not match your account. Please sign out and sign in again.");
        }
        if (mountedRef.current) setStats(data);
      } catch (e) {
        if (mountedRef.current) {
          setError(e instanceof Error ? e.message : "Could not load dashboard");
          if (!silent) setStats(null);
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [userId, userRole, expectedRole],
  );

  useEffect(() => {
    mountedRef.current = true;
    setStats(null);
    void load(false);
    return () => {
      mountedRef.current = false;
    };
  }, [load]);

  useEffect(() => {
    if (!userId || userRole !== expectedRole) return undefined;

    const tick = () => {
      if (document.visibilityState === "visible") void load(true);
    };

    const id = window.setInterval(tick, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void load(true);
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [userId, userRole, expectedRole, load]);

  const lastUpdated = stats?.generatedAt ? new Date(stats.generatedAt) : null;

  return {
    loading,
    refreshing,
    error,
    stats,
    reload: () => load(false),
    userId,
    userRole,
    lastUpdated,
    isLive: !loading && !error && Boolean(stats),
  };
}
