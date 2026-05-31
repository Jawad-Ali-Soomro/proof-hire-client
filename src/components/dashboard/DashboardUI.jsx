import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PiArrowRight, PiPulseDuotone, PiArrowClockwise } from "react-icons/pi";

export function DashboardBackdrop({ children, className = "" }) {
  return (
    <div className={`dashboard-shell relative ${className}`}>
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

export function LiveBadge({ refreshing, lastUpdated }) {
  const timeLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "—";

  return (
    <div className="inline-flex items-center justify-center h-8 gap-2 w-20 rounded-full border border-[#26b69c]/25 bg-[#26b69c]/8 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#156b59] dark:text-[#56d9c0]">
      <span className="relative flex h-2 w-2">
        <span
          className={`absolute inline-flex h-full w-full rounded-full bg-[#26b69c] opacity-75 ${refreshing ? "animate-ping" : "animate-pulse"}`}
        />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#26b69c]" />
      </span>
      {/* <PiPulseDuotone size={14} aria-hidden /> */}
      {refreshing ? "Updating…" : "Live"}
    </div>
  );
}

export function DashboardHero({
  eyebrow,
  title,
  subtitle,
  refreshing,
  lastUpdated,
  onRefresh,
  children,
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="overflow-hidden mb-5 border-white/60"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#26b69c]">{eyebrow}</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {subtitle}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <LiveBadge refreshing={refreshing} lastUpdated={lastUpdated} />
          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className="inline-flex items-center justify-center h-8 gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#26b69c]/40 hover:text-[#156b59] disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:text-slate-300"
            >
              <PiArrowClockwise size={14} className={refreshing ? "animate-spin" : ""} aria-hidden />
              Refresh
            </button>
          ) : null}
        </div>
      </div>
      {children ? <div className="mt-6">{children}</div> : null}
    </motion.header>
  );
}

export function KpiTile({ label, value, hint, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-4 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/90"
    >
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl transition group-hover:opacity-35"
        // style={{ backgroundColor: accent }}
        aria-hidden
      />
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p
        className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white"
        // style={{ color: accent }}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}
    </motion.div>
  );
}

export function QuickActionCard({ to, title, description, icon: Icon, accent }) {
  return (
    <Link
      to={to}
      className="group flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white/80 p-4 transition hover:-translate-y-0.5 hover:border-[#26b69c]/35 hover:shadow-lg hover:shadow-[#26b69c]/10 dark:border-gray-800 dark:bg-gray-900/80"
    >
      <div
        className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md"
        style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
      >
        <Icon size={22} aria-hidden />
      </div>
      <p className="font-semibold text-slate-900 dark:text-white">{title}</p>
      <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#26b69c]">
        Open
        <PiArrowRight size={14} className="transition group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  );
}

export function ProfileStrip({ user, profile, role, checklist, incompleteCount }) {
  const displayName =
    String(profile?.fullName || "").trim() || user?.username || "Your account";
  const avatar = String(profile?.avatar || "").trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
      className="flex flex-col gap-4 sm:flex-row sm:items-center pb-10 sm:justify-between"
    >
      <div className="flex items-center gap-4 min-w-0">
        {avatar ? (
          <img
            src={avatar}
            alt=""
            className="h-14 w-14 shrink-0 rounded-2xl border-2 border-white object-cover shadow-md dark:border-gray-800"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#26b69c] to-emerald-700 text-lg font-bold text-white shadow-md">
            {(displayName || "?").slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-slate-900 dark:text-white">{displayName}</p>
          <p className="truncate text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
         
        </div>
      </div>
      {role === "FREELANCER" && incompleteCount > 0 ? (
        <Link
          to="/dashboard/profile"
          className="shrink-0 capitalize rounded-xl bg-amber-500/15 px-4 py-2.5 text-center text-sm font-semibold text-amber-900 transition hover:bg-amber-500/25 dark:text-amber-200"
        >
          {incompleteCount} profile step{incompleteCount === 1 ? "" : "s"} left
        </Link>
      ) : (
        <Link
          to="/dashboard/profile"
          className="shrink-0 rounded-xl w-[150px] border border-slate-200 h-12 flex items-center justify-center text-sm font-semibold text-slate-700 transition hover:border-[#26b69c]/40 dark:border-gray-700 dark:text-slate-200"
        >
          Edit Profile
        </Link>
      )}
    </motion.div>
  );
}
