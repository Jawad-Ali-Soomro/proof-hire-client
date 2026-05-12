import { motion } from "framer-motion";
import {
  PiWalletDuotone,
  PiUserCirclePlusDuotone,
  PiBriefcaseDuotone,
} from "react-icons/pi";
import {
  LandingFeatures,
  LandingHero,
  LocomotiveProvider,
  MarketplaceReveal,
} from "../components";

const ONBOARDING_STEPS = [
  {
    step: "01",
    title: "Connect your wallet",
    description:
      "Use your preferred wallet to securely enter Proof Hire and start your setup.",
    icon: PiWalletDuotone,
    mesh: "from-teal-500/[0.14] via-cyan-500/[0.06] to-transparent",
    bar: "bg-teal-500 dark:bg-teal-400",
    iconBg:
      "border-teal-500/25 bg-teal-500/[0.08] text-teal-700 dark:border-teal-400/30 dark:bg-teal-400/10 dark:text-teal-300",
  },
  {
    step: "02",
    title: "Complete profile details",
    description:
      "Add personal info, role, and expertise so matches are personalized from day one.",
    icon: PiUserCirclePlusDuotone,
    mesh: "from-violet-500/[0.12] via-fuchsia-500/[0.05] to-transparent",
    bar: "bg-violet-500 dark:bg-violet-400",
    iconBg:
      "border-violet-500/25 bg-violet-500/[0.08] text-violet-700 dark:border-violet-400/30 dark:bg-violet-400/10 dark:text-violet-300",
  },
  {
    step: "03",
    title: "Explore work opportunities",
    description:
      "Hire talent or apply to jobs, manage bids, and collaborate from your dashboard.",
    icon: PiBriefcaseDuotone,
    mesh: "from-emerald-500/[0.12] via-teal-500/[0.06] to-transparent",
    bar: "bg-emerald-500 dark:bg-emerald-400",
    iconBg:
      "border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300",
  },
];

export default function LandingPage() {
  return (
    <LocomotiveProvider>
      <main className="landing-page">
        <LandingHero />
        <MarketplaceReveal />
        <LandingFeatures />
        <section className="relative mx-auto px-4 pb-20 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[40px] p-6 sm:p-10 lg:p-12">
            

            <div className="relative z-[1] ">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#26b69c]">
                How It Works
              </p>
              <h2 className="mt-3 capitalize text-2xl font-black text-gray-900 dark:text-white sm:text-3xl">
                Start in minutes with a simple Three step onboarding flow
              </h2>

              <div className="mt-10 grid gap-5 lg:grid-cols-3">
                {ONBOARDING_STEPS.map((step, idx) => (
                  <motion.article
                    key={step.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.45, delay: idx * 0.08 }}
                    whileHover={{ y: -5 }}
                    className="group relative flex flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface-elevated)] p-6 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset] backdrop-blur-[2px] dark:shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] md:p-8"
                  >
                    <div
                      className={`pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-gradient-to-br ${step.mesh} opacity-90 blur-3xl transition duration-500 group-hover:opacity-100`}
                      aria-hidden
                    />
                    <div
                      className={`pointer-events-none absolute left-0 top-8 h-24 w-[3px] rounded-full ${step.bar} opacity-90`}
                      aria-hidden
                    />

                    <div className="relative flex flex-1 flex-col">
                      <div className="mb-5 flex items-start justify-between gap-4">
                        <span className="font-mono text-[11px] font-medium tabular-nums tracking-[0.2em] text-[var(--text-muted)]">
                          {step.step}
                        </span>
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-2xl ${step.iconBg}`}
                        >
                          <step.icon aria-hidden />
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold capitalize tracking-tight text-[var(--text)] md:text-xl">
                        {step.title}
                      </h3>
                      <p className="mt-2.5 flex-1 text-pretty text-sm leading-relaxed text-[var(--text-muted)] md:text-[15px] md:leading-relaxed">
                        {step.description}
                      </p>

                      <div
                        className="relative mt-6 h-px w-full overflow-hidden rounded-full bg-[var(--border)]"
                        aria-hidden
                      >
                        <motion.div
                          className={`h-full w-1/3 rounded-full ${step.bar} opacity-70`}
                          initial={{ x: "-100%" }}
                          whileInView={{ x: "280%" }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 1.2,
                            delay: 0.1 + idx * 0.08,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        />
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </LocomotiveProvider>
  );
}
