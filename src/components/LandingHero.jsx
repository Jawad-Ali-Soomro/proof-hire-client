import { motion } from "framer-motion";
import { CARD_ART, RANDOM_CARD_ART } from "../data/landingImages.js";
import FanCardImage from "./FanCardImage.jsx";

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

export default function LandingHero() {
  return (
    <section
      data-scroll
      data-scroll-speed="-0.06"
      className="relative z-[1] min-h-[calc(100vh-5rem)] overflow-hidden px-4 pb-20 pt-28 text-center sm:px-8 md:min-h-screen md:pb-28 md:pt-32"
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
