import { createContext, useContext } from "react";
import { useDashboardStats } from "../hooks/useDashboardStats.js";

const DashboardStatsContext = createContext(null);

export function DashboardStatsProvider({ role, children }) {
  const value = useDashboardStats(role);
  return (
    <DashboardStatsContext.Provider value={value}>{children}</DashboardStatsContext.Provider>
  );
}

export function useDashboardStatsContext() {
  const ctx = useContext(DashboardStatsContext);
  if (!ctx) {
    throw new Error("useDashboardStatsContext must be used within DashboardStatsProvider");
  }
  return ctx;
}
