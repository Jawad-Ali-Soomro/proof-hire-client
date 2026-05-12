import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "framer-motion";
import { useMemo, useRef } from "react";
import { PiCaretDown, PiCaretUp } from "react-icons/pi";
import { CARD_ART, RANDOM_CARD_ART } from "../data/landingImages.js";
import FanCardImage from "./FanCardImage.jsx";

/** Start: tight cluster (px). Mid: fan. End: converge + huge scale toward viewport fill */
const FROM = [
  { x: -18, y: 24, r: -14, s: 0.66, z: 1 },
  { x: -8, y: 16, r: -8, s: 0.68, z: 2 },
  { x: 0, y: 10, r: 0, s: 0.7, z: 4 },
  { x: 8, y: 16, r: 8, s: 0.68, z: 3 },
  { x: 18, y: 24, r: 14, s: 0.66, z: 2 },
  { x: 26, y: 32, r: 18, s: 0.64, z: 1 },
  { x: -26, y: 32, r: -18, s: 0.64, z: 1 },
];

const TO = [
  { x: -150, y: -10, r: -10, s: 0.88, z: 1 },
  { x: -100, y: -24, r: -6, s: 0.92, z: 2 },
  { x: -48, y: -36, r: -3, s: 0.96, z: 3 },
  { x: 8, y: -42, r: 0, s: 1, z: 5 },
  { x: 64, y: -34, r: 4, s: 0.96, z: 4 },
  { x: 118, y: -18, r: 8, s: 0.92, z: 3 },
  { x: 168, y: 8, r: 12, s: 0.88, z: 2 },
];

/**
 * Max scale at end of scroll. Tuned so center card × base width stays inside
 * ~1920px viewports (base lg width cap 400px → ~3.2× ≈ 1280px wide).
 */
const ZOOM_MAX = [2.5, 2.75, 2.95, 3.15, 2.95, 2.75, 2.5];

function ScrollCard({ index, progress }) {
  const f = FROM[index] ?? FROM[0];
  const t = TO[index] ?? TO[0];
  const zEnd = ZOOM_MAX[index] ?? 4.5;
  const dist = Math.abs(index - 3);

  const opacityStops = useMemo(() => {
    if (dist >= 3) return [1, 1, 0.35, 0];
    if (dist === 2) return [1, 1, 0.7, 0.28];
    if (dist === 1) return [1, 1, 0.92, 0.72];
    return [1, 1, 1, 1];
  }, [dist]);

  const x = useTransform(progress, [0, 0.5, 0.78, 1], [f.x, t.x, t.x * 0.35, 0]);
  const y = useTransform(progress, [0, 0.5, 0.78, 1], [f.y, t.y, t.y * 0.25, 0]);
  const rotate = useTransform(progress, [0, 0.5, 0.88, 1], [f.r, t.r, t.r * 0.35, 0]);
  const scale = useTransform(
    progress,
    [0, 0.5, 0.72, 1],
    [f.s, t.s, t.s * 1.0, zEnd]
  );
  const opacity = useTransform(
    progress,
    [0, 0.52, 0.7, 1],
    opacityStops
  );

  /** Slide zoomed stack toward real viewport center (column anchor is ~75vw). */
  const toCenterX = useTransform(progress, [0.62, 0.78, 1], [0, 0, -26]);
  const toCenterY = useTransform(progress, [0.62, 0.78, 1], [0, 0, -10]);

  const transform = useMotionTemplate`translate(-50%, -50%) translate(calc(${x}px + ${toCenterX}vw), calc(${y}px + ${toCenterY}vh)) rotate(${rotate}deg) scale(${scale})`;

  return (
    <motion.figure
      className="absolute left-1/2 top-[44%] w-[min(30vw,400px)] overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_24px_60px_-16px_rgba(0,0,0,0.28)] sm:w-[min(26vw,220px)] lg:left-1/2 lg:top-[48%] lg:w-[min(22vw,400px)]"
      style={{
        transform,
        zIndex: index === 3 ? 50 : t.z + 10,
        opacity,
      }}
    >
      <FanCardImage primary={RANDOM_CARD_ART[index]} index={index} />
    </motion.figure>
  );
}

export default function MarketplaceReveal() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const leftOpacity = useTransform(
    scrollYProgress,
    [0, 0.18, 0.6, 0.86],
    [0.45, 1, 1, 0]
  );
  const leftY = useTransform(scrollYProgress, [0, 0.2], [24, 0]);

  const tagsOpacity = useTransform(
    scrollYProgress,
    [0.28, 0.48, 0.58, 0.75],
    [0, 1, 1, 0]
  );
  const tagsY = useTransform(scrollYProgress, [0.28, 0.48], [10, 0]);

  return (
    <section
      ref={ref}
      data-scroll
      data-scroll-speed="0.12"
      className="relative z-[1] min-h-[420vh] overflow-x-clip bg-[var(--surface)] pb-[min(20vh,120px)]"
      aria-label="Marketplace showcase"
    >
      <div className="sticky top-0 flex min-h-[100dvh] flex-col overflow-visible lg:flex-row">
        <motion.div
          className="relative z-40 flex max-w-xl flex-col justify-center px-6 pb-8 pt-24 lg:max-w-[48%] lg:flex-1 lg:pl-14 lg:pr-8 lg:pt-20"
          style={{ opacity: leftOpacity, y: leftY }}
        >
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
            Marketplace
          </p>
          <h2 className="text-balance text-3xl capitalize font-bold leading-[1.12] tracking-tight text-[var(--text)] sm:text-4xl lg:text-[2.65rem]">
            Showcase, hire,{" "}
            <span className="text-[#26b69c]">
              &amp; settle on-chain
              <br />
            </span>{" "}
            in one place.
          </h2>
          <p className="mt-5 text-justify capitalize font-semibold max-w-[calc(100%-275px)] text-pretty text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">
            A living network where freelancers and recruiters meet - portfolios,
            escrow, and attestations—Proof Hire keeps the creative work center
            stage.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-full bg-[#26b69c] w-[200px] h-14 text-sm font-semibold text-[var(--surface-elevated)] shadow-md transition hover:opacity-90 dark:bg-white dark:text-neutral-900"
            >
              Join Now
            </button>
            <button
              type="button"
              className="rounded-full w-[200px] h-14 border border-[var(--border)] bg-[var(--surface-elevated)] px-7 py-3 text-sm font-semibold text-[var(--text)] shadow-sm transition hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
            >
              Read more
            </button>
          </div>
        </motion.div>

        <div
          data-scroll
          data-scroll-speed="-0.08"
          className="relative min-h-[52vh] flex-1 overflow-visible lg:min-h-0"
        >
          <div className="absolute inset-0 overflow-visible">
            {RANDOM_CARD_ART.map((_, i) => (
              <ScrollCard key={i} index={i} progress={scrollYProgress} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
