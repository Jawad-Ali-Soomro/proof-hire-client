import { Link } from "react-router-dom";
import {
  PiBinocularsDuotone,
  PiChatCircleDotsDuotone,
  PiCloudArrowUpDuotone,
  PiCurrencyCircleDollarDuotone,
  PiHandshakeDuotone,
  PiListChecksDuotone,
  PiTimerDuotone,
  PiUsersThreeDuotone,
} from "react-icons/pi";
import { ClientDashboardCharts } from "../../components/dashboard/DashboardCharts.jsx";
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

function formatUsd(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "$0";
  return `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function ClientDashboard() {
  const { stats, loading, refreshing, lastUpdated, reload, error } = useDashboardStatsContext();
  const s = stats?.summary ?? {};
  const activity = stats?.activity;

  const kpis = loading
    ? null
    : [
        {
          label: "Open listings",
          value: s.openListings ?? 0,
          hint: `${formatUsd(s.openListingsBudget)} total budget`,
          accent: "#f97316",
        },
        {
          label: "Pending applicants",
          value: s.pendingApplicants ?? 0,
          hint: "Awaiting your review",
          accent: "#8b5cf6",
        },
        {
          label: "In development",
          value: s.inProgress ?? 0,
          hint: "Hired & underway",
          accent: "#3b82f6",
        },
        {
          label: "Active contracts",
          value: s.activeContracts ?? 0,
          hint: `${s.pendingContracts ?? 0} pending start`,
          accent: "#26b69c",
        },
      ];

  return (
    <DashboardBackdrop className="space-y-6">
      <DashboardHero
        eyebrow="Client workspace"
        title="Hire with clarity"
        subtitle="Track listings, review applicants, and monitor contracts — numbers update live while this tab is open."
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
            to="/dashboard/client/post-project"
            title="Post project"
            description="Publish a new brief with milestones, images, and links."
            icon={PiCloudArrowUpDuotone}
            accent="#26b69c"
          />
          <QuickActionCard
            to="/dashboard/client/projects"
            title="Track projects"
            description="Review bids and manage active listings."
            icon={PiBinocularsDuotone}
            accent="#3b82f6"
          />
          <QuickActionCard
            to="/dashboard/contracts"
            title="Contracts"
            description="Milestones, payments, and closure with freelancers."
            icon={PiHandshakeDuotone}
            accent="#8b5cf6"
          />
          <QuickActionCard
            to="/dashboard/messages"
            title="Messages"
            description="Direct chat with freelancers on your projects."
            icon={PiChatCircleDotsDuotone}
            accent="#14b8a6"
          />
          <QuickActionCard
            to="/dashboard/tasks"
            title="Tasks"
            description="Open items across all active contracts."
            icon={PiListChecksDuotone}
            accent="#a855f7"
          />
          <QuickActionCard
            to="/dashboard/history"
            title="History"
            description="Completed and cancelled work in one place."
            icon={PiTimerDuotone}
            accent="#64748b"
          />
        </div>
      </section>

      <DashboardEngagementKpis summary={s} loading={loading} />

      <DashboardNotificationsBanner count={s.unreadNotifications} />

      <DashboardActivityPanels activity={activity} loading={loading} />

      <ClientDashboardCharts />

      {!loading && (s.pendingApplicants ?? 0) > 0 ? (
        <div className="rounded-2xl border border-violet-200/80 bg-gradient-to-r from-violet-500/10 to-[#26b69c]/10 p-5 dark:border-violet-900/50">
          <div className="flex flex-wrap items-center gap-3">
            <PiUsersThreeDuotone className="text-violet-600 dark:text-violet-400" size={28} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900 dark:text-white">
                {s.pendingApplicants} applicant{s.pendingApplicants === 1 ? "" : "s"} waiting
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Review proposals on your open listings before they go stale.
              </p>
            </div>
            <a
              href="/dashboard/client/projects"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:brightness-110"
            >
              Review now
            </a>
          </div>
        </div>
      ) : null}

      {!loading && (s.openListings ?? 0) === 0 ? (
        <div className="rounded-2xl border mt-5 border-dashed border-[#26b69c]/40 bg-[#26b69c]/5 p-6 text-center dark:bg-[#26b69c]/10">
          {/* <PiCurrencyCircleDollarDuotone className="mx-auto text-[#26b69c]" size={36} aria-hidden /> */}
          <p className="mt-3 font-semibold text-slate-900 dark:text-white">No open listings yet</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Post your first project to start receiving bids from freelancers.
          </p>
        </div>
      ) : null}
    </DashboardBackdrop>
  );
}
