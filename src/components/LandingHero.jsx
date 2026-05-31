import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  PiArrowUpRightDuotone,
  PiGithubLogoDuotone,
  PiHandshakeDuotone,
  PiLinkedinLogoDuotone,
  PiShieldCheckDuotone,
  PiSparkleDuotone,
  PiXLogoDuotone,
} from "react-icons/pi";
import { RANDOM_CARD_ART } from "../data/landingImages.js";
import FanCardImage from "./FanCardImage.jsx";

const FOOTER_LINKS = {
  product: [
    { label: "Browse jobs", to: "/dashboard/jobs" },
    { label: "Post a project", to: "/dashboard/client/post-project" },
    { label: "Contracts", to: "/dashboard/contracts" },
  ],
  platform: [
    { label: "How it works", to: "/#how-it-works" },
    { label: "Marketplace", to: "/#marketplace" },
    { label: "Features", to: "/#features" },
  ],
  legal: [
    { label: "Privacy", to: "#" },
    { label: "Terms", to: "#" },
    { label: "Security", to: "#" },
  ],
};

const FOOTER_STATS = [
  { value: "On-chain", label: "Escrow milestones" },
  { value: "Verified", label: "Portfolio proof" },
  { value: "Global", label: "Talent network" },
];

const FAN = [
  { rotate: -20, y: 10, scale: 0.88, z: 1 },
  { rotate: -13, y: 5, scale: 0.92, z: 2 },
  { rotate: -6, y: 2, scale: 0.96, z: 3 },
  { rotate: 0, y: 0, scale: 1, z: 5 },
  { rotate: 6, y: 2, scale: 0.96, z: 4 },
  { rotate: 13, y: 5, scale: 0.92, z: 2 },
  { rotate: 20, y: 10, scale: 0.88, z: 1 },
];

const spring = { type: "spring", stiffness: 260, damping: 28 };

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 48 },
  show: { opacity: 1, y: 0, transition: spring },
};

function FloatingTag({ children, bg, style, delay = 0 }) {
  return (
    <motion.div
      className="pointer-events-none absolute z-20"
      style={style}
      initial={{ opacity: 0, y: 12, scale: 0.9 }}
      animate={{
        opacity: 1,
        y: [0, -6, 0],
        scale: 1,
      }}
      transition={{
        opacity: { delay, duration: 0.35 },
        y: {
          delay: delay + 0.2,
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut",
        },
        scale: { delay, duration: 0.35 },
      }}
    >
      <div
        className="whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg"
        style={{ backgroundColor: bg }}
      >
        {children}
      </div>
      <div
        className="absolute left-1/2 top-full -mt-px -translate-x-1/2 border-[7px] border-transparent"
        style={{ borderTopColor: bg }}
        aria-hidden
      />
    </motion.div>
  );
}

export function HeroFooter() {
  return (
    <footer className="relative z-[1] mt-16 w-full md:mt-20">
      <motion.div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute -left-[20%] top-0 h-px w-[140%] bg-gradient-to-r from-transparent via-[#26b69c]/60 to-transparent" />
        <motion.div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#26b69c]/[0.03] to-[#26b69c]/[0.09] dark:via-[#26b69c]/[0.06] dark:to-[#26b69c]/[0.14]" />
        <motion.div className="absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
        <motion.div className="absolute -left-24 bottom-8 h-56 w-56 rounded-full bg-teal-500/15 blur-3xl" />
        <p
          className="absolute bottom-4 left-1/2 -translate-x-1/2 select-none whitespace-nowrap text-[clamp(4rem,18vw,12rem)] font-black uppercase leading-none tracking-tighter text-[var(--text)]/[0.03] dark:text-white/[0.04]"
          aria-hidden
        >
          Proof Hire
        </p>
      </motion.div>

      <motion.div
        className="relative w-full px-5 py-14 sm:px-10 sm:py-16 lg:px-16 xl:px-24"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div className="flex flex-wrap items-end justify-between gap-6 border-b border-[var(--border)]/80 pb-10">
          <motion.div className="min-w-0 text-left">
            <motion.div className="flex items-center gap-3">
              <img src="/logo.svg" alt="" className="h-11 w-11" />
              <motion.div>
                <p className="text-2xl font-black tracking-tight text-[var(--text)] sm:text-3xl">
                  Proof<span className="text-[#26b69c]"> Hire</span>
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)]">
                  <PiSparkleDuotone className="text-[#26b69c]" aria-hidden />
                  Hire with proof, not promises
                </p>
              </motion.div>
            </motion.div>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
              The marketplace where portfolios, milestones, and escrow meet—built for freelancers
              who ship and teams who hire with confidence.
            </p>
          </motion.div>

          <motion.div className="flex w-full flex-wrap gap-3 sm:w-auto sm:justify-end">
            {FOOTER_STATS.map((stat) => (
              <motion.div
                key={stat.label}
                className="min-w-[7.5rem] flex-1 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)]/80 px-4 py-3 text-left shadow-sm backdrop-blur-sm sm:flex-none"
              >
                <p className="text-sm font-black uppercase tracking-wide text-[#26b69c]">{stat.value}</p>
                <p className="mt-0.5 text-xs font-medium text-[var(--text-muted)]">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div className="mt-10 grid gap-10 text-left sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <motion.div className="lg:col-span-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#26b69c]">Product</p>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text)] transition hover:text-[#26b69c]"
                  >
                    {link.label}
                    <PiArrowUpRightDuotone
                      className="opacity-0 transition group-hover:opacity-100"
                      size={14}
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#26b69c]">Platform</p>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.platform.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.to}
                    className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text)] transition hover:text-[#26b69c]"
                  >
                    {link.label}
                    <PiArrowUpRightDuotone
                      className="opacity-0 transition group-hover:opacity-100"
                      size={14}
                      aria-hidden
                    />
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#26b69c]">Legal</p>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.to}
                    className="text-sm font-semibold text-[var(--text-muted)] transition hover:text-[var(--text)]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#26b69c]">Connect</p>
            <motion.div className="mt-4 flex flex-wrap gap-2">
              {[
                { Icon: PiXLogoDuotone, label: "X", href: "#" },
                { Icon: PiGithubLogoDuotone, label: "GitHub", href: "#" },
                { Icon: PiLinkedinLogoDuotone, label: "LinkedIn", href: "#" },
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text)] transition hover:border-[#26b69c]/40 hover:bg-[#26b69c]/10 hover:text-[#26b69c]"
                >
                  <Icon size={20} />
                </a>
              ))}
            </motion.div>
            <Link
              to="/dashboard"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#26b69c] to-teal-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-teal-500/25 transition hover:brightness-110 sm:w-auto"
            >
              <PiHandshakeDuotone size={18} aria-hidden />
              Open dashboard
            </Link>
          </motion.div>
        </motion.div>

        <motion.div className="mt-12 flex flex-col gap-4 border-t border-[var(--border)]/70 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-medium text-[var(--text-muted)]">
            © {new Date().getFullYear()} Proof Hire. All rights reserved.
          </p>
          <motion.div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-1 text-[11px] font-semibold text-[var(--text-muted)]">
              <PiShieldCheckDuotone className="text-[#26b69c]" aria-hidden />
              Escrow-ready workflows
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-1 text-[11px] font-semibold text-[var(--text-muted)]">
              <PiSparkleDuotone className="text-[#26b69c]" aria-hidden />
              Wallet-native sign-in
            </span>
          </motion.div>
        </motion.div>
      </motion.div>
    </footer>
  );
}

export default function LandingHero() {
  return (
    <section
      data-scroll
      data-scroll-speed="-0.06"
      className="relative z-[1] flex min-h-[calc(100vh-5rem)] flex-col overflow-hidden px-4 pb-0 pt-28 text-center sm:px-8 md:min-h-screen md:pt-32"
    >
      <div
        data-scroll
        data-scroll-speed="0.04"
        className="relative z-[1] mx-auto flex max-w-4xl flex-col items-center"
      >
        <motion.h2
          className="max-w-3xl text-balance text-3xl font-bold leading-[1.15] tracking-tight text-[var(--text)] sm:text-4xl md:text-5xl lg:text-[3.25rem]"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.span variants={item} className="block capitalize">
            A place to display your
          </motion.span>
          <motion.span variants={item} className="block capitalize">
            masterpiece.
          </motion.span>
        </motion.h2>

        <motion.p
          className="mt-6 max-w-xl text-pretty text-base text-[var(--text-muted)] sm:text-lg"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.35 }}
        >
          Freelancers showcase verified work; recruiters discover talent with
          escrow-backed milestones—all in one on-chain marketplace.
        </motion.p>
      </div>

      <div
        data-scroll
        data-scroll-speed="0.1"
        className="relative z-[1] mx-auto mt-10 w-full max-w-5xl md:mt-14"
      >
        <div
          className="relative mx-auto flex min-h-[min(52vw,260px)] w-full max-w-[880px] items-end justify-center px-2 pb-2 pt-16 sm:min-h-[300px] sm:px-4 sm:pt-20 md:min-h-[360px] md:pt-24"
          style={{ perspective: "1200px" }}
        >
          <FloatingTag
            bg="#3b82f6"
            style={{ left: "max(0.5rem, 6%)", top: "0.5rem" }}
            delay={0.5}
          >
            @devnetic-labs-paksitan
          </FloatingTag>
          <FloatingTag
            bg="#26b69c"
            style={{ right: "max(0.5rem, 5%)", top: "0.75rem" }}
            delay={0.65}
          >
            @code-hikers-united-stated
          </FloatingTag>

          <div className="flex items-end justify-center -space-x-10 sm:-space-x-9 md:-space-x-10 lg:-space-x-100">
            {RANDOM_CARD_ART.map((src, i) => {
              const cfg = FAN[i];
              return (
                <motion.figure
                  key={i}
                  className="relative shrink-0 overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.22)] first:ml-0 dark:border-white/10  sm:w-[min(20vw,168px)] md:w-[min(500px)]"
                  style={{
                    zIndex: cfg.z,
                    transformOrigin: "bottom center",
                  }}
                  initial={{
                    opacity: 0,
                    y: 64,
                    rotate: 0,
                    scale: 0.82,
                  }}
                  animate={{
                    opacity: 1,
                    y: -cfg.y,
                    rotate: cfg.rotate,
                    scale: cfg.scale,
                  }}
                  transition={{
                    ...spring,
                    delay: 0.12 + i * 0.055,
                  }}
                  whileHover={{
                    y: -cfg.y - 12,
                    scale: cfg.scale * 1.04,
                    rotate: cfg.rotate * 0.9,
                    transition: { type: "spring", stiffness: 400, damping: 22 },
                  }}
                >
                  <FanCardImage primary={src} index={i} />
                </motion.figure>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
