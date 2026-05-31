import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PiCheck, PiEnvelopeDuotone, PiGithubLogo, PiLockDuotone, PiSignIn } from "react-icons/pi";
import {
  AuthCard,
  AuthDivider,
  AuthError,
  AuthField,
  AuthHeader,
  AuthIconButton,
  AuthLogo,
  AuthPageShell,
  AuthPrimaryButton,
  AuthSocialRow,
  fadeUp,
} from "../../components/auth/AuthMotion.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const inputWrap =
  "flex items-center gap-2 rounded-[15px] border border-slate-200 focus-within:border-[#26b69c]";

const inputClass =
  "w-full rounded-lg border-none bg-transparent px-2 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthPageShell>
      <AuthCard>
        <AuthHeader>
          <AuthLogo />
          <motion.h1
            className="text-2xl font-bold text-slate-900 dark:text-white"
            variants={fadeUp}
          >
            Welcome back
          </motion.h1>
          <motion.p className="text-center text-sm text-slate-600" variants={fadeUp}>
            Let&apos;s Begin Your Journey &amp; Get Started!
          </motion.p>
        </AuthHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthField className={inputWrap}>
            <PiEnvelopeDuotone className="ml-3 shrink-0" aria-hidden />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@example.com"
            />
          </AuthField>

          <AuthField className={inputWrap}>
            <PiLockDuotone className="ml-3 shrink-0" aria-hidden />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
            />
          </AuthField>

          <motion.div variants={fadeUp}>
            <AuthError message={error} />
          </motion.div>

          <AuthField>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="peer sr-only" />
              <motion.div
                className="flex h-4 w-4 items-center justify-center rounded-[4px] border border-slate-300 transition-colors peer-checked:border-gray-900 peer-checked:bg-gray-900 peer-focus-visible:ring-2 peer-focus-visible:ring-orange-500/50 peer-checked:[&_svg]:opacity-100"
                whileTap={{ scale: 0.88 }}
              >
                <PiCheck className="h-3 w-3 text-white opacity-0" />
              </motion.div>
              <span className="text-sm font-bold text-slate-600">Remember Me</span>
            </label>
          </AuthField>

          <AuthPrimaryButton type="submit" disabled={submitting}>
            {submitting ? "Connecting..." : "Connect!"}
          </AuthPrimaryButton>

          <AuthDivider />
        </form>

        <AuthSocialRow>
          <AuthIconButton
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-sm font-bold capitalize text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            aria-label="Sign in with GitHub"
          >
            <PiGithubLogo size={18} />
          </AuthIconButton>
          <AuthIconButton
            onClick={() => navigate("/signup")}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#26b69c]/50 text-sm font-bold capitalize text-[#26b69c] focus:outline-none"
            aria-label="Go to sign up"
          >
            <PiSignIn size={18} />
          </AuthIconButton>
        </AuthSocialRow>
      </AuthCard>
    </AuthPageShell>
  );
}
