import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export const pageVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.12 },
  },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

export const tapZoom = {
  whileTap: { scale: 1 },
  whileHover: { scale: 1 },
  transition: { type: "spring", stiffness: 500, damping: 28 },
};

export const tapZoomSoft = {
  whileTap: { scale: 0.97 },
  whileHover: { scale: 1.03 },
  transition: { type: "spring", stiffness: 400, damping: 22 },
};

export function AuthPageShell({ children }) {
  return (
    <motion.div
      className="flex min-h-screen items-center justify-center overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      {children}
    </motion.div>
  );
}

export function AuthCard({ children }) {
  return (
    <motion.div className="w-full max-w-md p-6" variants={staggerContainer} initial="hidden" animate="visible">
      {children}
    </motion.div>
  );
}

export function AuthHeader({ children }) {
  return (
    <motion.div
      className="mb-6 flex flex-col items-center justify-center gap-3"
      variants={fadeUp}
    >
      {children}
    </motion.div>
  );
}

export function AuthLogo() {
  const navigate = useNavigate();
  return (
    <motion.img
      src="/logo.svg"
      alt="ProofHire"
      className="mx-auto mb-4 h-10 w-10"
      initial={{ opacity: 0, scale: 0.5, rotate: -12 }}
      onClick={() => navigate("/")}
      animate={{
        opacity: 1,
        scale: 1,
        rotate: 0,
        transition: { type: "spring", stiffness: 260, damping: 18, delay: 0.05 },
      }}
      whileHover={{ scale: 1.08, rotate: 4 }}
      whileTap={{ scale: 0.92 }}
    />
  );
}

export function AuthField({ children, className = "" }) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      whileHover={{ scale: 1.008 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}

export function AuthPrimaryButton({ children, disabled, type = "button", ...props }) {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      className="w-full rounded-xl bg-[#26b69c] px-5 py-2.5 text-sm font-bold capitalize text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-60"
      variants={fadeUp}
      {...tapZoom}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function AuthIconButton({ children, className, ...props }) {
  return (
    <motion.button
      type="button"
      onClick={() => navigate("/")}
      className={className}
      variants={fadeUp}
      {...tapZoomSoft}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function AuthRoleButton({ active, children, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      layout
      className={`flex items-center justify-center gap-1.5 rounded-[15px] border px-3 py-2.5 text-sm font-bold transition ${
        active
          ? "border-[#26b69c] bg-[#26b69c]/10 text-[#156b59] "
          : "border-slate-200 text-slate-600 hover:border-slate-300"
      }`}
    >
      {children}
    </motion.button>
  );
}

export function AuthDivider() {
  return (
    <motion.div
      className="relative mt-2 flex h-px w-full items-center justify-center bg-[#26b69c]"
      variants={fadeUp}
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <motion.p
        className="absolute left-1/2 top-1/2 z-[200] -translate-x-1/2 -translate-y-1/2 bg-white p-1 text-sm font-bold text-[#26b69c] dark:bg-gray-950"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.35 }}
      >
        OR
      </motion.p>
    </motion.div>
  );
}

export function AuthError({ message }) {
  return (
    <AnimatePresence mode="wait">
      {message ? (
        <motion.p
          key={message}
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400"
          initial={{ opacity: 0, x: -8, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
        >
          {message}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}

export function AuthSocialRow({ children }) {
  return (
    <motion.div className="mt-5 flex justify-end gap-2" variants={fadeUp}>
      {children}
    </motion.div>
  );
}
