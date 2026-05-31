import { useEffect, useState } from "react";
import { apiRequest, getStoredToken } from "../../lib/api.js";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiRequest("/admin/stats", {
          token: getStoredToken(),
        });
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        Platform Overview
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Admin dashboard — real-time platform stats
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={stats?.totalUsers ?? 0} />
        <StatCard label="Total Projects" value={stats?.totalJobs ?? 0} />
        <StatCard label="Total Bids" value={stats?.totalBids ?? 0} />
        <StatCard label="Total Contracts" value={stats?.totalContracts ?? 0} />
      </div>

      {stats?.roleBreakdown?.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Users by Role
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {stats.roleBreakdown.map((r) => (
              <div
                key={r.role}
                className="rounded-xl border border-slate-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {r.role}
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                  {r.count}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}
