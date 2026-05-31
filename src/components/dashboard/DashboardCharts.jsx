import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDashboardStatsContext } from "../../context/DashboardStatsContext.jsx";
import StatusRadialChart, {
  CLIENT_CHART_LAYOUT,
  FREELANCER_CHART_LAYOUT,
} from "./StatusRadialChart.jsx";
import { useDashboardStats } from "../../hooks/useDashboardStats.js";

function StatChip({ chip, className = "" }) {
  if (!chip) return null;
  return (
    <div
      role="tooltip"
      className={`pointer-events-none z-30 min-w-[132px] rounded-xl border bg-white px-3 py-2 text-center shadow-lg dark:bg-gray-900 ${className}`}
      style={{ borderColor: `${chip.color}55` }}
    >
      <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: chip.color }}>
        {chip.label}
      </p>
      <p className="mt-1 text-lg font-bold tabular-nums text-slate-900 dark:text-white">{chip.count}</p>
      <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{chip.percent}%</p>
      {chip.description ? (
        <p className="mt-1 text-[10px] leading-snug text-slate-500 dark:text-slate-400">{chip.description}</p>
      ) : null}
    </div>
  );
}

function SummaryCard({ label, value, sub, chip, active, emphasized = true, className = "" }) {
  const showAccent = emphasized || active;
  return (
    <div
      className={`group/card relative flex h-full min-h-[4.5rem] w-full flex-col rounded-[20px] border p-4 transition-all duration-200 ${
        active
          ? "z-[1] border-transparent shadow-sm ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900"
          : showAccent
            ? "border-slate-200/80 bg-slate-50/60 hover:border-slate-300 hover:bg-slate-50 dark:border-gray-700/80 dark:bg-gray-800/30 dark:hover:border-gray-600 dark:hover:bg-gray-800/50"
            : "border-slate-200/60 bg-slate-100/50 dark:border-gray-700/50 dark:bg-gray-800/20"
      } ${className}`}
      style={
        active && chip
          ? {
              ringColor: `${chip.color}66`,
              backgroundColor: `${chip.color}0c`,
            }
          : undefined
      }
    >
      <p
        className={`text-[10px] font-bold uppercase tracking-[0.18em] ${
          showAccent ? "text-slate-500 dark:text-slate-400" : "text-slate-400 dark:text-slate-500"
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-2 text-2xl font-bold tabular-nums transition-colors ${
          showAccent ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"
        }`}
        style={active && chip ? { color: chip.color } : showAccent && chip ? { color: chip.color } : undefined}
      >
        {value}
      </p>
      {sub ? <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{sub}</div> : null}

      {chip ? (
        <StatChip
          chip={chip}
          className="absolute -top-2 right-2 translate-y-1 opacity-0 transition-[opacity,transform] duration-200 ease-out group-hover/card:translate-y-0 group-hover/card:opacity-100 group-hover/card:animate-sidebar-chip-shake motion-reduce:group-hover/card:animate-none"
        />
      ) : null}
    </div>
  );
}

function ChartsSkeleton() {
  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="grid min-h-[420px] animate-pulse items-stretch lg:grid-cols-12">
        <div className="border-b border-slate-200 bg-slate-100 dark:border-gray-800 dark:bg-gray-800/50 lg:col-span-7 lg:border-b-0 lg:border-r" />
        <div className="grid grid-rows-4 gap-3 p-4 lg:col-span-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl bg-slate-100 dark:bg-gray-800/50" />
          ))}
        </div>
      </div>
    </div>
  );
}

function segmentByKey(segments, key) {
  return segments?.find((s) => s.key === key) ?? null;
}

/** Keys whose numeric value ties for the highest count (> 0). */
function peakValueKeys(entries) {
  const max = Math.max(0, ...entries.map((e) => e.value ?? 0));
  if (max === 0) return new Set();
  return new Set(entries.filter((e) => (e.value ?? 0) === max).map((e) => e.key));
}

function DashboardOverviewGroup({ title, description, children, className = "" }) {
  const [hoveredKey, setHoveredKey] = useState(null);

  return (
    <div className={`flex flex-col gap-4 mt-5 ${className}`}>
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>
      </div>
      <div
        className="group/dashboard overflow-visible border border-slate-200/90 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95"
        onMouseLeave={() => setHoveredKey(null)}
      >
        <div className="grid items-stretch lg:min-h-[420px] lg:grid-cols-12">
          {children({ hoveredKey, setHoveredKey })}
        </div>
      </div>
    </div>
  );
}

export function ClientDashboardCharts({ className = "" }) {
  const { loading, error, stats, reload, userId, userRole } = useDashboardStats("CLIENT");

  const segments = stats?.role === "CLIENT" ? stats.segments ?? [] : [];
  const s = stats?.role === "CLIENT" ? stats.summary ?? {} : {};

  const extras = useMemo(
    () => ({
      total: {
        label: "All projects",
        count: s.totalProjects ?? 0,
        percent: 100,
        color: "#26b69c",
        description: "Listings you posted as a client",
      },
      contracts: {
        label: "Active contracts",
        count: s.activeContracts ?? 0,
        percent: s.totalProjects
          ? Math.round(((s.activeContracts ?? 0) / s.totalProjects) * 100)
          : 0,
        color: "#8b5cf6",
        description: "Contracts currently in progress",
      },
    }),
    [s],
  );

  const peakKeys = useMemo(
    () =>
      peakValueKeys([
        { key: "total", value: s.totalProjects ?? 0 },
        { key: "backlog", value: s.openListings ?? 0 },
        { key: "in_development", value: s.inProgress ?? 0 },
        { key: "contracts", value: s.activeContracts ?? 0 },
      ]),
    [s],
  );

  if (userRole && userRole !== "CLIENT") return null;
  if (loading) return <ChartsSkeleton />;

  if (error) {
    return (
      <p className="text-sm font-medium text-red-600 dark:text-red-400">
        {error}{" "}
        <button type="button" onClick={() => void reload()} className="underline">
          Retry
        </button>
      </p>
    );
  }

  return (
    <DashboardOverviewGroup
      className={className}
      title="Pipeline breakdown"
      description="Hover segments or cards — stats refresh automatically every few seconds."
    >
      {({ hoveredKey, setHoveredKey }) => {
        const highlightedSegment =
          hoveredKey != null
            ? segmentByKey(segments, hoveredKey) ?? extras[hoveredKey] ?? null
            : null;

        return (
          <>
            <div className="flex flex-col justify-center overflow-visible border-b border-slate-200 p-4 sm:p-6 lg:col-span-7 lg:border-b-0 lg:border-r dark:border-gray-800">
              <StatusRadialChart
                key={`client-chart-${userId}`}
                embedded
                className="group/chart"
                title="Your project pipeline"
                totalLabel="Projects"
                centerValue={s.totalProjects ?? 0}
                segments={segments}
                layoutOrder={CLIENT_CHART_LAYOUT}
                hoveredKey={hoveredKey}
                onHoverChange={setHoveredKey}
                highlightedSegment={highlightedSegment}
              />
            </div>

            <div className="group/cards grid grid-rows-4 gap-2.5 p-4 sm:grid-cols-2 sm:gap-3 sm:p-6 lg:col-span-5 lg:grid-cols-1 lg:gap-2.5">
              <div
                className="group/card-item flex h-full"
                onMouseEnter={() => setHoveredKey("total")}
              >
                <SummaryCard
                  label="Total projects"
                  value={s.totalProjects ?? 0}
                  chip={extras.total}
                  active={hoveredKey === "total"}
                  emphasized={peakKeys.has("total")}
                />
              </div>
              <div
                className="group/card-item flex h-full"
                onMouseEnter={() => setHoveredKey("backlog")}
              >
                <SummaryCard
                  label="Open listings"
                  value={s.openListings ?? 0}
                  sub="Backlog"
                  chip={segmentByKey(segments, "backlog")}
                  active={hoveredKey === "backlog"}
                  emphasized={peakKeys.has("backlog")}
                />
              </div>
              <div
                className="group/card-item flex h-full"
                onMouseEnter={() => setHoveredKey("in_development")}
              >
                <SummaryCard
                  label="In development"
                  value={s.inProgress ?? 0}
                  chip={segmentByKey(segments, "in_development")}
                  active={hoveredKey === "in_development"}
                  emphasized={peakKeys.has("in_development")}
                />
              </div>
              <div
                className="group/card-item flex h-full"
                onMouseEnter={() => setHoveredKey("contracts")}
              >
                <SummaryCard
                  label="Active contracts"
                  value={s.activeContracts ?? 0}
                  sub={
                    <Link to="/dashboard/contracts" className="text-[#26b69c] hover:underline">
                      View contracts
                    </Link>
                  }
                  chip={extras.contracts}
                  active={hoveredKey === "contracts"}
                  emphasized={peakKeys.has("contracts")}
                />
              </div>
            </div>
          </>
        );
      }}
    </DashboardOverviewGroup>
  );
}

export function FreelancerDashboardCharts({ className = "" }) {
  const { loading, error, stats, reload, userId, userRole } = useDashboardStatsContext();

  const segments = stats?.role === "FREELANCER" ? stats.segments ?? [] : [];
  const s = stats?.role === "FREELANCER" ? stats.summary ?? {} : {};

  const extras = useMemo(
    () => ({
      applications: {
        label: "Applications",
        count: s.uniqueApplications ?? 0,
        percent: 100,
        color: "#14b8a6",
        description: "Distinct projects you applied to",
      },
      accepted: {
        label: "Accepted",
        count: s.acceptedBids ?? 0,
        percent: s.totalBids ? Math.round(((s.acceptedBids ?? 0) / s.totalBids) * 100) : 0,
        color: "#22c55e",
        description: "Bids approved by clients",
      },
    }),
    [s],
  );

  const peakKeys = useMemo(
    () =>
      peakValueKeys([
        { key: "applications", value: s.uniqueApplications ?? 0 },
        { key: "pending", value: s.pendingBids ?? 0 },
        { key: "accepted", value: s.acceptedBids ?? 0 },
        { key: "active", value: s.activeContracts ?? 0 },
      ]),
    [s],
  );

  if (userRole && userRole !== "FREELANCER") return null;
  if (loading) return <ChartsSkeleton />;

  if (error) {
    return (
      <p className="text-sm font-medium text-red-600 dark:text-red-400">
        {error}{" "}
        <button type="button" onClick={() => void reload()} className="underline">
          Retry
        </button>
      </p>
    );
  }

  return (
    <DashboardOverviewGroup
      className={className}
      title="Bid & contract breakdown"
      description="Hover segments or cards — stats refresh automatically every few seconds."
    >
      {({ hoveredKey, setHoveredKey }) => {
        const highlightedSegment =
          hoveredKey != null
            ? segmentByKey(segments, hoveredKey) ?? extras[hoveredKey] ?? null
            : null;

        return (
          <>
            <div className="flex flex-col justify-center overflow-visible border-b border-slate-200 p-4 sm:p-6 lg:col-span-7 lg:border-b-0 lg:border-r dark:border-gray-800">
              <StatusRadialChart
                key={`freelancer-chart-${userId}`}
                embedded
                className="group/chart"
                title="Your bid & contract status"
                totalLabel="Applications"
                centerValue={s.uniqueApplications ?? 0}
                segments={segments}
                layoutOrder={FREELANCER_CHART_LAYOUT}
                hoveredKey={hoveredKey}
                onHoverChange={setHoveredKey}
                highlightedSegment={highlightedSegment}
              />
            </div>

            <div className="group/cards grid grid-rows-4 gap-2.5 p-4 sm:grid-cols-2 sm:gap-3 sm:p-6 lg:col-span-5 lg:grid-cols-1 lg:gap-2.5">
              <div
                className="group/card-item flex h-full"
                onMouseEnter={() => setHoveredKey("applications")}
              >
                <SummaryCard
                  label="Job applications"
                  value={s.uniqueApplications ?? 0}
                  sub="Distinct projects"
                  chip={extras.applications}
                  active={hoveredKey === "applications"}
                  emphasized={peakKeys.has("applications")}
                />
              </div>
              <div
                className="group/card-item flex h-full"
                onMouseEnter={() => setHoveredKey("pending")}
              >
                <SummaryCard
                  label="Pending bids"
                  value={s.pendingBids ?? 0}
                  sub={
                    <Link to="/dashboard/bids" className="text-[#26b69c] hover:underline">
                      My bids
                    </Link>
                  }
                  chip={segmentByKey(segments, "pending")}
                  active={hoveredKey === "pending"}
                  emphasized={peakKeys.has("pending")}
                />
              </div>
              <div
                className="group/card-item flex h-full"
                onMouseEnter={() => setHoveredKey("accepted")}
              >
                <SummaryCard
                  label="Accepted"
                  value={s.acceptedBids ?? 0}
                  chip={extras.accepted}
                  active={hoveredKey === "accepted"}
                  emphasized={peakKeys.has("accepted")}
                />
              </div>
              <div
                className="group/card-item flex h-full"
                onMouseEnter={() => setHoveredKey("active")}
              >
                <SummaryCard
                  label="Active contracts"
                  value={s.activeContracts ?? 0}
                  sub={
                    <Link to="/dashboard/contracts" className="text-[#26b69c] hover:underline">
                      View contracts
                    </Link>
                  }
                  chip={segmentByKey(segments, "active")}
                  active={hoveredKey === "active"}
                  emphasized={peakKeys.has("active")}
                />
              </div>
            </div>
          </>
        );
      }}
    </DashboardOverviewGroup>
  );
}
