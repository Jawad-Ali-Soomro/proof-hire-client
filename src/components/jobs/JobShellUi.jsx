/** Shared job marketplace / client track visuals — color-rich labels, price, badges */

export function statusLabel(status) {
  return String(status || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function RichLabel({ children, className = "" }) {
  return (
    <span
      className={`inline-block text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] ${className}`}
    >
      {children}
    </span>
  );
}

export function RichPrice({ value, size = "lg" }) {
  const sizeCls = size === "sm" ? "text-base font-bold" : "text-xl font-bold";
  return (
    <span
      className={`bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text tabular-nums text-transparent dark:from-emerald-400 dark:to-teal-300 ${sizeCls}`}
    >
      ${Number(value).toLocaleString()}
    </span>
  );
}

export function StatusBadge({ status }) {
  return (
    <span className="inline-flex rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm shadow-violet-500/25">
      {statusLabel(status)}
    </span>
  );
}

export function BidCountBadge({ n }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm shadow-amber-500/20">
      {n} bid{n === 1 ? "" : "s"}
    </span>
  );
}

export function BidStatusBadge({ status }) {
  const s = String(status || "").toUpperCase();
  let grad = "from-slate-500 to-slate-600";
  if (s === "PENDING") grad = "from-amber-500 to-orange-500";
  if (s === "ACCEPTED") grad = "from-emerald-500 to-teal-500";
  if (s === "REJECTED") grad = "from-rose-500 to-red-600";
  return (
    <span
      className={`inline-flex rounded-full bg-gradient-to-r ${grad} px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm`}
    >
      {statusLabel(status)}
    </span>
  );
}

export function ContractStatusBadge({ status }) {
  const s = String(status || "").toUpperCase();
  let grad = "from-slate-500 to-slate-600";
  if (s === "PENDING_START") grad = "from-amber-500 to-orange-500";
  if (s === "ACTIVE") grad = "from-violet-600 to-indigo-600";
  if (s === "COMPLETED") grad = "from-emerald-500 to-teal-500";
  if (s === "TERMINATED") grad = "from-rose-500 to-red-600";
  return (
    <span
      className={`inline-flex rounded-full bg-gradient-to-r ${grad} px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm`}
    >
      {statusLabel(status)}
    </span>
  );
}

export function MilestoneStatusBadge({ status }) {
  const s = String(status || "").toUpperCase();
  let grad = "from-slate-500 to-slate-600";
  if (s === "PENDING") grad = "from-amber-500 to-orange-500";
  if (s === "IN_PROGRESS") grad = "from-violet-600 to-indigo-600";
  if (s === "COMPLETED") grad = "from-emerald-500 to-teal-500";
  return (
    <span
      className={`inline-flex rounded-full bg-gradient-to-r ${grad} px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm`}
    >
      {statusLabel(status)}
    </span>
  );
}

export function parseMilestones(raw) {
  if (!Array.isArray(raw)) return [];
  return raw;
}

export { BulletRichText, BulletTextarea, ProseRichText } from "./ProjectMedia.jsx";
