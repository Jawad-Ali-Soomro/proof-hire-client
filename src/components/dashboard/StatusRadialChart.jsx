import { useMemo, useState } from "react";

const VIEW = 400;
const CX = 200;
const CY = 200;
const VIEW_PAD = 64;
const VIEW_BOX = `${-VIEW_PAD} ${-VIEW_PAD} ${VIEW + VIEW_PAD * 2} ${VIEW + VIEW_PAD * 2}`;

const OUTER_R = 132;
const GAP_DEG = 14;
/** 12 o'clock, then clockwise (deployed → in dev → backlog → blocked). */
const START_DEG = -90 + GAP_DEG / 2;
/** Clockwise from 12 o'clock — matches reference (deployed → in dev → backlog → blocked). */
export const CLIENT_CHART_LAYOUT = ["deployed", "in_development", "backlog", "blocked"];
export const FREELANCER_CHART_LAYOUT = ["completed", "active", "pending", "declined"];
const DEFAULT_LAYOUT_ORDER = CLIENT_CHART_LAYOUT;

const LABEL_FILL = "#1e293b";
const LABEL_PERCENT_FILL = "#334155";
const MUTED_STROKE = "rgba(148, 163, 184, 0.22)";
const TRACK_STROKE = "transparent";

/** Outer-aligned band widths — mirrors reference (40% / 35% / 20% / 5% tiers). */
const THICKNESS_BY_PERCENT = [
  { min: 35, width: 20 },
  { min: 25, width: 20 },
  { min: 12, width: 20 },
  { min: 0, width: 11 },
];

function degToRad(deg) {
  return ((deg - 90) * Math.PI) / 180;
}

function point(cx, cy, r, deg) {
  const rad = degToRad(deg);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcStroke(cx, cy, radius, startDeg, endDeg) {
  const span = endDeg - startDeg;
  if (span < 0.5) return "";
  const large = span > 180 ? 1 : 0;
  const p0 = point(cx, cy, radius, startDeg);
  const p1 = point(cx, cy, radius, endDeg);
  return `M ${p0.x} ${p0.y} A ${radius} ${radius} 0 ${large} 1 ${p1.x} ${p1.y}`;
}

function thicknessForPercent(percent) {
  for (const tier of THICKNESS_BY_PERCENT) {
    if (percent >= tier.min) return tier.width;
  }
  return 50;
}

function assignThickness(segments) {
  const map = new Map();
  for (const seg of segments) {
    if ((seg.percent ?? 0) > 0) {
      map.set(seg.key, thicknessForPercent(seg.percent ?? 0));
    }
  }
  return map;
}

function orderForLayout(segments, layoutOrder) {
  const map = new Map(segments.map((s) => [s.key, s]));
  const ordered = layoutOrder.map((k) => map.get(k)).filter(Boolean);
  for (const s of segments) {
    if (!layoutOrder.includes(s.key)) ordered.push(s);
  }
  return ordered;
}

function buildCallout({ mid, outerR }) {
  const labelR = outerR + 54;
  const labelPt = point(CX, CY, labelR, mid);
  const anchorPt = point(CX, CY, outerR, mid);
  const isLeft = mid > 90 && mid < 270;
  const textX = isLeft ? labelPt.x - 14 : labelPt.x + 14;
  const anchor = isLeft ? "end" : "start";
  const stubLen = 30;
  const elbowPt = {
    x: isLeft ? textX + stubLen : textX - stubLen,
    y: labelPt.y,
  };
  return { textX, anchor, elbowPt, anchorPt, labelPt };
}

function StatHoverChip({ segment, className = "" }) {
  if (!segment) return null;
  return (
    <div
      role="tooltip"
      className={`pointer-events-none z-20 min-w-[140px] rounded-xl border bg-white px-3 py-2.5 text-center shadow-lg dark:border-gray-700 dark:bg-gray-900 ${className}`}
      style={{ borderColor: `${segment.color}55` }}
    >
      <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: segment.color }}>
        {segment.label}
      </p>
      <p className="mt-1 text-xl font-bold tabular-nums text-slate-900 dark:text-white">{segment.count}</p>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{segment.percent}% of total</p>
      {segment.description ? (
        <p className="mt-1.5 text-[11px] leading-snug text-slate-500 dark:text-slate-400">{segment.description}</p>
      ) : null}
    </div>
  );
}

/**
 * Radial pipeline chart — variable band width (outer-aligned), rounded caps, elbow labels.
 */
export default function StatusRadialChart({
  segments = [],
  title = "Project status",
  totalLabel = "Total",
  centerValue,
  className = "",
  hoveredKey: controlledHoveredKey,
  onHoverChange,
  highlightedSegment = null,
  layoutOrder = DEFAULT_LAYOUT_ORDER,
  embedded = false,
}) {
  const [internalHoveredKey, setInternalHoveredKey] = useState(null);
  const hoveredKey = controlledHoveredKey !== undefined ? controlledHoveredKey : internalHoveredKey;
  const setHoveredKey = (key) => {
    onHoverChange?.(key);
    if (controlledHoveredKey === undefined) setInternalHoveredKey(key);
  };

  const segmentSum = useMemo(
    () => segments.reduce((s, seg) => s + (seg.count ?? 0), 0),
    [segments],
  );
  const displayTotal = centerValue ?? segmentSum;

  const arcs = useMemo(() => {
    const ordered = orderForLayout(segments, layoutOrder);
    const withData = ordered.filter((s) => (s.percent ?? 0) > 0);
    if (!withData.length) return [];

    const thicknessMap = assignThickness(withData);
    const totalGap = GAP_DEG * withData.length;
    const sweep = 360 - totalGap;
    let cursor = START_DEG;

    return withData.map((seg) => {
      const span = (seg.percent / 100) * sweep;
      const start = cursor;
      const end = cursor + span;
      cursor = end + GAP_DEG;

      const thickness = thicknessMap.get(seg.key) ?? 12;
      const midR = OUTER_R - thickness / 2;
      const mid = (start + end) / 2;
      const callout = buildCallout({ mid, outerR: OUTER_R });

      return {
        ...seg,
        start,
        end,
        mid,
        thickness,
        midR,
        strokePath: arcStroke(CX, CY, midR, start, end),
        chipPt: point(CX, CY, midR, mid),
        ...callout,
      };
    });
  }, [segments, layoutOrder]);

  const hovered =
    highlightedSegment ??
    (hoveredKey != null ? segments.find((s) => s.key === hoveredKey) ?? null : null);
  const hoveredArc = arcs.find((a) => a.key === hoveredKey);
  const hasData = displayTotal > 0 && arcs.length > 0;

  const shellClass = embedded
    ? `flex h-full min-h-0 flex-col ${className}`
    : `rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 ${className}`;

  return (
    <div className={shellClass}>
      {!embedded ? (
        <>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Hover segments for details</p>
        </>
      ) : (
        <h3 className="mb-3 shrink-0 text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
          {title}
        </h3>
      )}

      <div
        className={`relative mx-auto w-full max-w-[min(100%,500px)] flex-1 overflow-visible ${embedded ? "" : "mt-2"}`}
      >
        <svg
          viewBox={VIEW_BOX}
          className="h-auto w-full select-none"
          role="img"
          aria-label={title}
          style={{ overflow: "visible" }}
        >
          {/* Light track ring */}
          <circle cx={CX} cy={CY} r={OUTER_R + 8} fill="#f1f5f9" className="dark:fill-gray-800/50" />
          <circle
            cx={CX}
            cy={CY}
            r={OUTER_R - 4}
            fill="none"
            stroke={TRACK_STROKE}
            strokeWidth={44}
            className="dark:stroke-gray-800/80"
          />

          {!hasData ? (
            <text
              x={CX}
              y={CY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-slate-400 text-sm font-medium dark:fill-slate-500"
            >
              No data yet
            </text>
          ) : null}

          {hasData
            ? arcs.map((a) => {
                const active = hoveredKey === a.key;
                const dim = hoveredKey != null && !active;
                const useColor = active || !hoveredKey;
                const strokeColor = useColor ? a.color : MUTED_STROKE;
                const lineColor = useColor ? a.color : "rgba(148, 163, 184, 0.5)";
                const labelTitle = useColor ? LABEL_FILL : "#94a3b8";
                const labelPct = useColor ? LABEL_PERCENT_FILL : "#94a3b8";

                return (
                  <g key={a.key}>
                    <path
                      d={a.strokePath}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={100}
                      // strokeLinecap="round"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredKey(a.key)}
                      onFocus={() => setHoveredKey(a.key)}
                      tabIndex={0}
                      aria-label={`${a.label} ${a.count} ${a.percent} percent`}
                    />
                    <path
                      d={a.strokePath}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={active ? a.thickness + 10 : a.thickness}
                      strokeLinecap="round"
                      className="pointer-events-none transition-all duration-200"
                      style={{ opacity: dim ? 0.28 : 1 }}
                    />
                    <polyline
                      points={`${a.anchorPt.x},${a.anchorPt.y} ${a.elbowPt.x},${a.elbowPt.y} ${a.textX},${a.labelPt.y}`}
                      fill="none"
                      stroke={lineColor}
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="pointer-events-none transition-opacity duration-200"
                      style={{ opacity: dim ? 0.35 : 1 }}
                    />
                    <text
                      x={a.textX}
                      y={a.labelPt.y - 6}
                      textAnchor={a.anchor}
                      className="pointer-events-none text-[14px] font-semibold transition-opacity duration-200 dark:fill-slate-200"
                      style={{
                        fill: labelTitle,
                        opacity: dim ? 0.4 : 1,
                      }}
                    >
                      {a.label}
                    </text>
                    <text
                      x={a.textX}
                      y={a.labelPt.y + 14}
                      textAnchor={a.anchor}
                      className="pointer-events-none text-[14px] font-semibold tabular-nums transition-opacity duration-200"
                      style={{
                        fill: labelPct,
                        opacity: dim ? 0.4 : 1,
                      }}
                    >
                      {a.percent}%
                    </text>
                  </g>
                );
              })
            : null}

          {/* Subtle center on hover only */}
          {hovered ? (
            <>
              <text
                x={CX}
                y={CY - 8}
                textAnchor="middle"
                className="fill-slate-400 text-[10px] font-bold uppercase tracking-wider dark:fill-slate-500"
              >
                {hovered.label}
              </text>
              <text
                x={CX}
                y={CY + 12}
                textAnchor="middle"
                className="fill-slate-900 text-2xl font-bold tabular-nums dark:fill-white"
              >
                {hovered.count}
              </text>
              <text
                x={CX}
                y={CY + 32}
                textAnchor="middle"
                className="fill-slate-500 text-[11px] font-semibold dark:fill-slate-400"
              >
                {hovered.percent}%
              </text>
            </>
          ) : null}
        </svg>

        {hovered && !hoveredArc ? (
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
            <StatHoverChip segment={hovered} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
