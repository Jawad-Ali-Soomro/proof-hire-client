import { Link } from "react-router-dom";
import {
  PiBriefcaseDuotone,
  PiChartLineUpDuotone,
  PiChatCircleDotsDuotone,
  PiFolderOpenDuotone,
  PiHandshakeDuotone,
  PiListChecksDuotone,
  PiSealCheckDuotone,
  PiTimerDuotone,
} from "react-icons/pi";
import { FreelancerDashboardCharts } from "../../components/dashboard/DashboardCharts.jsx";
import {
  DashboardActivityPanels,
  DashboardEngagementKpis,
  DashboardNotificationsBanner,
} from "../../components/dashboard/DashboardActivity.jsx";
import {
  DashboardBackdrop,
  DashboardHero,
  KpiTile,
  QuickActionCard,
} from "../../components/dashboard/DashboardUI.jsx";
import { useDashboardStatsContext } from "../../context/DashboardStatsContext.jsx";

export default function FreelancerDashboard() {
  const { stats, loading, refreshing, lastUpdated, reload, error } = useDashboardStatsContext();
  const s = stats?.summary ?? {};
  const activity = stats?.activity;

  const kpis = loading
    ? null
    : [
        {
          label: "Applications",
          value: s.uniqueApplications ?? 0,
          hint: `${s.totalBids ?? 0} total bids placed`,
          accent: "#14b8a6",
        },
        {
          label: "Pending review",
          value: s.pendingBids ?? 0,
          hint: "Waiting on clients",
          accent: "#f97316",
        },
        {
          label: "Win rate",
          value: `${s.winRate ?? 0}%`,
          hint: `${s.acceptedBids ?? 0} accepted · ${s.rejectedBids ?? 0} declined`,
          accent: "#22c55e",
        },
        {
          label: "Active contracts",
          value: (s.activeContracts ?? 0) + (s.pendingContracts ?? 0),
          hint: `${s.completedContracts ?? 0} completed`,
          accent: "#3b82f6",
        },
      ];

  return (
    <DashboardBackdrop className="space-y-6">
      <DashboardHero
        eyebrow="Freelancer workspace"
        title="Grow your pipeline"
        subtitle="Browse open work, track bids, and ship contracts — metrics refresh live while you stay on this page."
        refreshing={refreshing}
        lastUpdated={lastUpdated}
        onRefresh={() => void reload()}
      >
        {!loading && !error && kpis ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((k, i) => (
              <KpiTile key={k.label} {...k} delay={0.08 + i * 0.04} />
            ))}
          </div>
        ) : null}
        {error ? (
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            {error}{" "}
            <button type="button" onClick={() => void reload()} className="underline">
              Retry
            </button>
          </p>
        ) : null}
      </DashboardHero>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Quick actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          <QuickActionCard
            to="/dashboard/jobs"
            title="Browse jobs"
            description={
              s.openMarketplaceJobs != null
                ? `${s.openMarketplaceJobs} open project${s.openMarketplaceJobs === 1 ? "" : "s"} on the marketplace.`
                : "Find new projects that match your skills."
            }
            icon={PiBriefcaseDuotone}
            accent="#26b69c"
          />
          <QuickActionCard
            to="/dashboard/bids"
            title="My bids"
            description="Track pending, accepted, and rejected proposals."
            icon={PiFolderOpenDuotone}
            accent="#f97316"
          />
          <QuickActionCard
            to="/dashboard/contracts"
            title="Contracts"
            description="Deliver milestones and close out payments."
            icon={PiHandshakeDuotone}
            accent="#8b5cf6"
          />
          <QuickActionCard
            to="/dashboard/messages"
            title="Messages"
            description="Chat directly with clients you work with."
            icon={PiChatCircleDotsDuotone}
            accent="#14b8a6"
          />
          <QuickActionCard
            to="/dashboard/tasks"
            title="Tasks"
            description="Track open work items on your contracts."
            icon={PiListChecksDuotone}
            accent="#a855f7"
          />
          <QuickActionCard
            to="/dashboard/history"
            title="History"
            description="Portfolio of finished engagements."
            icon={PiTimerDuotone}
            accent="#64748b"
          />
        </div>
      </section>

      <DashboardEngagementKpis summary={s} loading={loading} />

      <DashboardNotificationsBanner count={s.unreadNotifications} />

      <DashboardActivityPanels activity={activity} loading={loading} />

      <FreelancerDashboardCharts />

      {!loading && (s.openMarketplaceJobs ?? 0) > 0 ? (
        <div className="rounded-2xl mt-5 border border-[#26b69c]/30 bg-gradient-to-r from-[#26b69c]/12 to-cyan-500/10 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <PiChartLineUpDuotone className="text-[#26b69c]" size={28} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900 dark:text-white">
                {s.openMarketplaceJobs} open job{s.openMarketplaceJobs === 1 ? "" : "s"} available
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                New opportunities are live on the marketplace right now.
              </p>
            </div>
            <Link
              to="/dashboard/jobs"
              className="inline-flex items-center gap-2 rounded-xl bg-[#26b69c] px-4 py-2.5 text-sm font-bold text-white shadow-md hover:brightness-110"
            >
              Explore jobs
            </Link>
          </div>
        </div>
      ) : null}

      {!loading && (s.pendingBids ?? 0) > 0 ? (
        <div className="flex items-center gap-3 mt-5 rounded-2xl border border-amber-200/80 bg-amber-500/10 p-4 dark:border-amber-900/40">
          <PiSealCheckDuotone className="shrink-0 text-amber-600 dark:text-amber-400" size={24} aria-hidden />
          <p className="text-sm text-slate-700 dark:text-slate-300">
            <span className="font-semibold text-slate-900 dark:text-white">{s.pendingBids} pending bid{s.pendingBids === 1 ? "" : "s"}</span>
            {" — "}
            clients are still reviewing your proposals. Check{" "}
            <Link to="/dashboard/bids" className="font-semibold text-[#26b69c] hover:underline">
              My bids
            </Link>{" "}
            for updates.
          </p>
        </div>
      ) : null}
    </DashboardBackdrop>
  );
}
