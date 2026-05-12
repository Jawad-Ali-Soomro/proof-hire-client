import { motion } from "framer-motion";
import {
  PiCodeBlockDuotone,
  PiGavelDuotone,
  PiGlobeDuotone,
  PiLinkDuotone,
  PiShieldCheckDuotone,
} from "react-icons/pi";

const spring = { type: "spring", stiffness: 280, damping: 30 };

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.05 * i,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const pillars = [
  {
    step: "01",
    title: "Escrow you can read",
    body: "Milestone splits and release rules live in contract text both sides review before a single wei moves.",
    icon: PiShieldCheckDuotone,
    span: "lg:col-span-2",
    mesh: "from-teal-500/[0.14] via-cyan-500/[0.06] to-transparent",
    bar: "bg-teal-500 dark:bg-teal-400",
    iconBg:
      "border-teal-500/25 bg-teal-500/[0.08] text-teal-700 dark:border-teal-400/30 dark:bg-teal-400/10 dark:text-teal-300",
    featured: true,
  },
  {
    step: "02",
    title: "Portable proof",
    body: "Ship hashes, reviews, and completion signals that verify outside any one app.",
    icon: PiLinkDuotone,
    span: "lg:col-span-1",
    mesh: "from-sky-500/[0.12] via-blue-500/[0.05] to-transparent",
    bar: "bg-sky-500 dark:bg-sky-400",
    iconBg:
      "border-sky-500/25 bg-sky-500/[0.08] text-sky-700 dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-300",
  },
  {
    step: "03",
    title: "Global by default",
    body: "Stablecoins and major L1/L2 networks—same rails for Lagos, Lisbon, or LA.",
    icon: PiGlobeDuotone,
    span: "lg:col-span-1",
    mesh: "from-violet-500/[0.12] via-fuchsia-500/[0.05] to-transparent",
    bar: "bg-violet-500 dark:bg-violet-400",
    iconBg:
      "border-violet-500/25 bg-violet-500/[0.08] text-violet-700 dark:border-violet-400/30 dark:bg-violet-400/10 dark:text-violet-300",
  },
  {
    step: "04",
    title: "Fair exits",
    body: "Mediation paths and dispute hooks are first-class—not bolted on after the fact.",
    icon: PiGavelDuotone,
    span: "lg:col-span-1",
    mesh: "from-orange-500/[0.12] via-amber-500/[0.05] to-transparent",
    bar: "bg-orange-500 dark:bg-orange-400",
    iconBg:
      "border-orange-500/25 bg-orange-500/[0.08] text-orange-800 dark:border-orange-400/30 dark:bg-orange-400/10 dark:text-orange-200",
  },
  {
    step: "05",
    title: "Developer-friendly",
    body: "Webhooks, job schemas, and wallet flows you can integrate without reverse-engineering a black box.",
    icon: PiCodeBlockDuotone,
    span: "lg:col-span-1",
    mesh: "from-emerald-500/[0.12] via-teal-500/[0.06] to-transparent",
    bar: "bg-emerald-500 dark:bg-emerald-400",
    iconBg:
      "border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300",
  },
];



function GridTexture() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.45] dark:opacity-[0.28]"
      aria-hidden
      style={{
        backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px),
          linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
        maskImage:
          "radial-gradient(ellipse 85% 70% at 50% 0%, black 20%, transparent 72%)",
      }}
    />
  );
}

export default function LandingFeatures() {
  return (
    <section
      data-scroll
      data-scroll-speed="-0.04"
      className="relative z-[1] overflow-hidden border-t border-[var(--border)] px-4 py-20 sm:px-8 md:py-28 lg:px-12"
      aria-labelledby="landing-features-heading"
    >
      <div className="pointer-events-none absolute -left-24 top-1/4 h-[420px] w-[420px] rounded-full bg-teal-500/[0.07] blur-[100px] dark:bg-teal-400/[0.06]" />
      <div className="pointer-events-none absolute -right-20 bottom-1/4 h-[380px] w-[380px] rounded-full bg-rose-500/[0.06] blur-[100px] dark:bg-rose-400/[0.05]" />

      <div className="relative z-[1] mx-auto">
        <GridTexture />

        <motion.div
          className="relative mb-16 grid gap-10 md:mb-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.1fr)] lg:items-end lg:gap-16"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.09 } },
          }}
        >
          <motion.div
            variants={fadeUp}
            custom={0}
            className="hidden lg:flex lg:flex-col lg:items-stretch lg:gap-5"
            aria-hidden
          >
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-[var(--text-muted)]">
              Layer
            </span>
            <div className="relative flex min-h-[120px] flex-1">
              <div className="absolute bottom-0 left-[11px] top-0 w-px bg-gradient-to-b from-transparent via-[var(--border)] to-[var(--accent)]/50" />
              <div className="mt-auto flex items-center gap-3 pl-8">
                <span className="font-mono text-5xl font-bold tabular-nums tracking-tighter text-[var(--text)]/90">
                  02
                </span>
                <span className="max-w-[4.5rem] font-mono text-[9px] uppercase leading-snug tracking-widest text-[var(--text-muted)]">
                  Protocol surface
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={1}>
            <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--text-muted)]">
              Why Proof Hire
            </p>
            <h2
              id="landing-features-heading"
              className="text-balance capitalize text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl md:text-[2.65rem] md:leading-[1.12]"
            >
              The layer where{" "}
              <span className="text-[#0d9488] dark:text-[#5eead4]">talent</span>
              ,{" "}
              <span className="text-[#9f1239] dark:text-[#fb7185]">capital</span>,
              and truth meet.
            </h2>
            <p className="mt-4 max-w-4xl text-pretty text-base font-semibold leading-relaxed text-[var(--text-muted)] sm:text-lg">
              Built for serious freelancers and teams who want receipts—not just
              ratings. Every block below is something you can explain to finance,
              legal, or your future self.
            </p>
          </motion.div>
        </motion.div>

        <div className="relative mb-16 grid gap-4 sm:grid-cols-2 lg:mb-20 lg:grid-cols-3 lg:gap-5">
          {pillars.map((item, i) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-48px" }}
              transition={{ ...spring, delay: i * 0.06 }}
              whileHover={{ y: -5, transition: { ...spring, stiffness: 400 } }}
              className={`group relative flex flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface-elevated)] shadow-[0_1px_0_rgba(255,255,255,0.06)_inset] backdrop-blur-[2px] dark:shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] md:p-8 ${item.span} ${
                item.featured
                  ? "p-7 md:p-10"
                  : "p-6 md:p-8"
              }`}
            >
              <div
                className={`pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-gradient-to-br ${item.mesh} opacity-90 blur-3xl transition duration-500 group-hover:opacity-100`}
                aria-hidden
              />
              <div
                className={`pointer-events-none absolute left-0 top-8 h-24 w-[3px] rounded-full ${item.bar} opacity-90`}
                aria-hidden
              />

              {item.featured ? (
                <div
                  className="relative mb-6 flex items-center gap-2"
                  aria-hidden
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-neutral-400/80 dark:bg-neutral-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-neutral-300/80 dark:bg-neutral-600" />
                  <span className="h-2.5 w-2.5 rounded-full bg-teal-500/70" />
                  <span className="ml-3 font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                    Contract view
                  </span>
                </div>
              ) : null}

              <div className="relative flex flex-1 flex-col">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <span className="font-mono text-[11px] font-medium tabular-nums tracking-[0.2em] text-[var(--text-muted)]">
                    {item.step}
                  </span>
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-2xl ${item.iconBg}`}
                  >
                    <item.icon aria-hidden />
                  </div>
                </div>

                <h3 className="text-lg font-semibold capitalize tracking-tight text-[var(--text)] md:text-xl">
                  {item.title}
                </h3>
                <p className="mt-2.5 flex-1 text-pretty text-sm leading-relaxed text-[var(--text-muted)] md:text-[15px] md:leading-relaxed">
                  {item.body}
                </p>

                <div
                  className="relative mt-6 h-px w-full overflow-hidden rounded-full bg-[var(--border)]"
                  aria-hidden
                >
                  <motion.div
                    className={`h-full w-1/3 rounded-full ${item.bar} opacity-70`}
                    initial={{ x: "-100%" }}
                    whileInView={{ x: "280%" }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 1.35,
                      delay: 0.15 + i * 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                </div>
              </div>
            </motion.article>
          ))}
        </div>

       
      </div>
    </section>
  );
}
