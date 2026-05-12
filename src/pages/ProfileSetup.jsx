import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { PiArrowLeft, PiArrowRight, PiCheck, PiMagnifyingGlass, PiUserCheckDuotone, PiUserDuotone } from "react-icons/pi";
import { useAuth } from "../context/AuthContext.jsx";
import { useWallet } from "../context/WalletContext.jsx";
import { apiRequest, getStoredToken } from "../lib/api.js";
import {
  HIRING_FOCUS_OPTIONS,
  SKILL_CATEGORIES,
  skillKey,
} from "../data/profileSetupOptions.js";

/** Step badge + dashed connector + arrow into the main section title (matches sidebar numbering). */
function SectionStepBridge({ stepIndex, children }) {
  return (
    <div className="flex w-full items-start gap-4">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#26b69c] bg-white text-sm font-bold text-[#26b69c] dark:bg-gray-900 dark:text-[#26b69c]"
        aria-hidden
      >
        {stepIndex + 1}
      </div>
      <div
        className="flex h-10 min-w-[3rem] flex-1 items-center sm:max-w-[5.5rem]"
        aria-hidden
      >
        <svg
          className="h-3.5 w-full text-[#26b69c] opacity-80 dark:opacity-70"
          viewBox="0 0 88 16"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line
            x1="0"
            y1="8"
            x2="78"
            y2="8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 5"
            strokeLinecap="round"
          />
          <path
            d="M76 4.5L84 8L76 11.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
      <div className="min-w-0 flex-1 border-l-2 border-dashed border-[#26b69c]/40 pl-5 dark:border-[#26b69c]/35">
        {children}
      </div>
    </div>
  );
}

const STEP_CONFIG = [
  {
    title: "Personal information",
    description:
      "Add your name and optional bio. This is how you'll appear across Proof Hire.",
  },
  {
    title: "Choose your path",
    description:
      "Select whether you’re offering services as a freelancer or hiring talent.",
  },
  {
    title: "Expertise or hiring focus",
    description:
      "Pick skills you offer, or focus areas for roles you’re hiring for—like choosing options in a store.",
  },
];

function ToggleRow({ selected, title, description, onClick, icon }) {
  return (
    <motion.button
      layout
      type="button"
      onClick={onClick}
      className={`group flex w-full relative items-start gap-3 rounded-[20px] border px-4 py-3 text-left transition-all dark:border-gray-600 ${
        selected
          ? "border-[#26b69c] bg-[#26b69c]/[0.06] dark:bg-[#26b69c]/10"
          : "border-gray-200 bg-white hover:border-gray-400 dark:hover:border-gray-500 dark:bg-gray-900/80"
      }`}
      whileTap={{ scale: 0.985 }}
    >
      <motion.span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
          selected
            ? "border-[#26b69c] bg-[#26b69c]"
            : "border-gray-300 bg-white dark:border-gray-500 dark:bg-gray-900"
        }`}
        animate={selected ? { scale: [1, 1.15, 1] } : { scale: 1 }}
        transition={{ duration: 0.25 }}
      >
        {selected ? (
          <PiCheck className="text-[15px] text-white" aria-hidden strokeWidth={3} />
        ) : null}
      </motion.span>
      <span
        className={`text-[15px]  flex flex-col gap-1 font-semibold leading-snug ${
          selected
            ? "text-gray-900 dark:text-white"
            : "text-gray-700 dark:text-gray-200"
        }`}>
          <span className="text-sm font-semibold">{title}</span>
          {description ? (
            <span className="text-xs text-gray-500 dark:text-gray-400 leading-snug line-clamp-1 capitalize">{description}</span>
          ) : null}
          {icon && <div className="absolute right-5 top-1/2 -translate-y-1/2 text-xl">{icon}</div>}
      </span>
    </motion.button>
  );
}

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { isConnected } = useWallet();
  const { user, loading, profileComplete, applyAuthPayload } = useAuth();

  const steps = STEP_CONFIG;
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState(user?.email?.includes("@wallet.proofhire") ? "" : (user?.email ?? ""));
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState("FREELANCER");
  /** @type {[string[], function]} */
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillQuery, setSkillQuery] = useState("");
  const [selectedHiringTags, setSelectedHiringTags] = useState([]);
  const [servicesNotes, setServicesNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isConnected && !loading) navigate("/", { replace: true });
  }, [isConnected, loading, navigate]);

  useEffect(() => {
    if (!loading && profileComplete)
      navigate("/dashboard", { replace: true });
  }, [loading, profileComplete, navigate]);

  useEffect(() => {
    if (!user?.email) return;
    if (user.email.includes("@wallet.proofhire")) return;
    setEmail((prev) => prev || user.email);
  }, [user?.email]);

  const filteredSkillCategories = useMemo(() => {
    const q = skillQuery.trim().toLowerCase();
    if (!q) return SKILL_CATEGORIES;

    return SKILL_CATEGORIES.map((cat) => {
      const catHit =
        cat.title.toLowerCase().includes(q) ||
        (cat.description && cat.description.toLowerCase().includes(q));

      return {
        ...cat,
        skills: cat.skills.filter((s) => {
          if (catHit) return true;
          return (
            skillKey(s).toLowerCase().includes(q) ||
            (typeof s !== "string" &&
              s.description &&
              s.description.toLowerCase().includes(q))
          );
        }),
      };
    }).filter((cat) => cat.skills.length > 0);
  }, [skillQuery]);

  const toggleSkill = (skill) => {
    const key = skillKey(skill);
    setSelectedSkills((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  const toggleHiringTag = (tag) => {
    setSelectedHiringTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const skillsPayload = () => selectedSkills.join(", ");

  const servicesPayload = () => {
    const tags = selectedHiringTags.join(", ");
    const notes = servicesNotes.trim();
    if (tags && notes) return `${tags} · ${notes}`;
    return tags || notes;
  };

  const canAdvance = () => {
    if (step === 0) {
      const e = email.trim();
      return fullName.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    }
    if (step === 1) return true;
    if (step === 2) {
      if (role === "FREELANCER") return selectedSkills.length > 0;
      return (
        selectedHiringTags.length > 0 || servicesNotes.trim().length > 0
      );
    }
    return true;
  };

  const next = () => {
    setError("");
    if (!canAdvance()) {
      setError("Complete this step before continuing.");
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const back = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  };

  const submit = async () => {
    setError("");
    if (!canAdvance()) {
      setError("Complete this step before continuing.");
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        email: email.trim().toLowerCase(),
        fullName: fullName.trim(),
        bio: bio.trim() || undefined,
        role,
        ...(role === "FREELANCER"
          ? { skills: skillsPayload() }
          : { services: servicesPayload() }),
      };
      const data = await apiRequest("/profile/complete", {
        method: "POST",
        body,
        token: getStoredToken(),
      });
      applyAuthPayload(data);
      navigate("/dashboard", { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save profile");
    } finally {
      setSubmitting(false);
    }
  };

  const stepTwoDescription =
    role === "FREELANCER"
      ? "Select every skill that matches what you deliver—organized by category."
      : "Choose focus areas that match hiring needs. Add optional notes.";

  const selectedBucket =
    role === "FREELANCER"
      ? {
          label: "Skills selected",
          count: selectedSkills.length,
          helper:
            selectedSkills.length > 0
              ? selectedSkills.join(", ")
              : "Pick at least one skill",
        }
      : {
          label: "Fields selected",
          count: selectedHiringTags.length + (servicesNotes.trim() ? 1 : 0),
          helper:
            selectedHiringTags.length + (servicesNotes.trim() ? 1 : 0) > 0
              ? `${selectedHiringTags.length} focus area${selectedHiringTags.length === 1 ? "" : "s"}${servicesNotes.trim() ? " + notes" : ""}`
              : "Pick focus areas or add notes",
        };

  if (loading || !user) {
    return (
      <main className="min-h-[50vh] pt-28 px-6 text-center text-gray-500 dark:text-gray-400 font-semibold">
        Loading…
      </main>
    );
  }

  return (
    <main className="flex items-center overflow-hidden h-[100vh] dark:bg-gray-900 justify-between w-full pt-20 px-4 sm:px-6 lg:px-10">
      <div className="w-full">
        <div className="flex flex-col xl:flex-row xl:gap-40 pt-40 xl:items-stretch justify-center items-start w-full">
          {/* Left stepper: vertically centered in column; width unchanged from prior stepper */}
          <aside className="xl:w-[340px] mt-2 shrink-0 xl:mb-0 xl:min-h-[calc(100vh-8rem)] flex flex-col justify-start">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-center justify-start">
                <img src="/logo.svg" alt="Proof Hire" className="w-10 h-10" />
                <p className="text-xs font-bold uppercase text-[#26b69c]">
                  Proof Hire
                </p>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#26b69c] mb-4">
                Profile setup
              </p>
            </div>
            <ol className="space-y-0">
              {steps.map((s, i) => {
                const isDone = i < step;
                const isCurrent = i === step;
                const isLast = i === steps.length - 1;

                return (
                  <li key={s.title} className="relative flex gap-4">
                    <div className="flex flex-col items-center shrink-0 w-11">
                      <div
                        className={`relative z-[1] flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
                          isDone
                            ? "border-[#26b69c] bg-[#26b69c] text-white"
                            : isCurrent
                              ? "border-[#26b69c] bg-white text-[#26b69c] dark:bg-gray-900"
                              : "border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-600 dark:bg-gray-800/80"
                        }`}
                        aria-current={isCurrent ? "step" : undefined}
                      >
                        {isDone ? (
                          <PiCheck className="text-lg" strokeWidth={2.5} />
                        ) : (
                          <span>{i + 1}</span>
                        )}
                      </div>
                      {!isLast ? (
                        <div
                          className={`w-0.5 flex-1 min-h-[3.25rem] mt-0 ${
                            isDone
                              ? "bg-[#26b69c]"
                              : "bg-gray-200 dark:bg-gray-600"
                          }`}
                          aria-hidden
                        />
                      ) : null}
                    </div>
                    <div
                      className={`pb-10 min-w-0 ${isLast ? "pb-0" : ""} ${
                        isCurrent
                          ? "opacity-100"
                          : isDone
                            ? "opacity-90"
                            : "opacity-55"
                      }`}
                    >
                     
                      <h2
                        className={`mt-1 capitalize text-base font-bold leading-snug ${
                          isCurrent
                            ? "text-[#26b69c] dark:text-white"
                            : "text-gray-800 dark:text-gray-200"
                        }`}
                      >
                        {s.title}
                      </h2>
                      <p className="mt-2 text-sm capitalize font-semibold leading-relaxed text-gray-500 dark:text-gray-400">
                        {i === 2 ? stepTwoDescription : s.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </aside>

          <section className="flex min-w-[550px] mt-2 max-w-full justify-start items-start md:max-w-[30%]">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              {step === 0 ? (
                <>
                  <h1 className="text-xl font-bold capitalize text-[#26b69c] dark:text-white">
                    Tell us who you are
                  </h1>
                  <p className="mt-1 text-sm capitalize font-semibold text-gray-500 dark:text-gray-400">
                    This information appears on your public profile.
                  </p>
                  <label className="mt-8 block">
                    <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Email
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-semibold outline-none focus:border-[#26b69c] dark:border-gray-600"
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </label>
                  <label className="mt-6 block">
                    <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Full name
                    </span>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-semibold outline-none focus:border-[#26b69c] dark:border-gray-600"
                      placeholder="Jane Doe"
                      autoComplete="name"
                    />
                  </label>
                  <label className="mt-6 block">
                    <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Bio <span className="font-semibold uppercase">(optional)</span>
                    </span>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-medium outline-none focus:border-[#26b69c] dark:border-gray-600"
                      placeholder="One or two sentences about your background."
                    />
                  </label>
                </>
              ) : null}

              {step === 1 ? (
                <>
                  <h1 className="text-xl font-bold capitalize text-[#26b69c] dark:text-white">
                    How will you use Proof Hire?
                  </h1>
                  <p className="mt-1 text-sm font-semibold text-gray-500 dark:text-gray-400 capitalize">
                    Pick the option that best matches your primary goal.
                  </p>
                  <div className="mt-8 flex flex-col gap-3">
                    <ToggleRow
                      selected={role === "FREELANCER"}
                      title="Freelancer"
                      description="sell your skills and apply to gigs"
                      onClick={() => setRole("FREELANCER")}
                      icon={<PiUserDuotone />}
                    />
                    <ToggleRow
                      selected={role === "CLIENT"}
                      title="Client"
                      description="recruit talent and outline what you need"
                      onClick={() => setRole("CLIENT")}
                      icon={<PiUserCheckDuotone />}
                    />
                  </div>
                </>
              ) : null}

              {step === 2 ? (
                role === "FREELANCER" ? (
                  <>
                    <h1 className="text-xl font-bold capitalize text-[#26b69c] dark:text-white">
                      Select your skills
                    </h1>
                    <p className="mt-1 text-sm font-semibold text-gray-500 dark:text-gray-400 capitalize">
                      Select every skill that matches what you deliver—organized by category.
                    </p>
                    <div className="relative mt-6">
                      <PiMagnifyingGlass
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                      <input
                        type="search"
                        value={skillQuery}
                        onChange={(e) => setSkillQuery(e.target.value)}
                        placeholder="Filter skills…"
                        className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm font-medium outline-none focus:border-[#26b69c] dark:border-gray-600 dark:bg-transparent"
                      />
                    </div>
                    <div className="mt-6 max-h-[min(52vh,28rem)] space-y-8 overflow-y-auto pr-1">
                      {filteredSkillCategories.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          No skills match “{skillQuery.trim()}”.
                        </p>
                      ) : (
                        filteredSkillCategories.map((cat) => (
                          <div key={cat.title}>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                              {cat.title}
                            </p>
                            <p className="mt-1 capitalize font-semibold text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                              {cat.description}
                            </p>
                            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                              {cat.skills.map((skill) => {
                                const title = skillKey(skill);
                                const selected = selectedSkills.includes(title);
                                return (
                                  <ToggleRow
                                    key={title}
                                    selected={selected}
                                    title={title}
                                    description={
                                      typeof skill === "string"
                                        ? ""
                                        : skill.description
                                    }
                                    onClick={() => toggleSkill(skill)}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <h1 className="text-xl font-bold capitalize text-[#26b69c] dark:text-white">
                      Hiring focus
                    </h1>
                    <p className="mt-1 text-sm font-semibold text-gray-500 dark:text-gray-400 capitalize">
                      Pick the buckets that match roles you recruit for, then optionally add specifics.
                    </p>
                    <div className="mt-8 grid gap-2 sm:grid-cols-2">
                      {HIRING_FOCUS_OPTIONS.map((item) => (
                        <ToggleRow
                          key={item.title}
                          selected={selectedHiringTags.includes(item.title)}
                          title={item.title}
                          description={item.description}
                          onClick={() => toggleHiringTag(item.title)}
                        />
                      ))}
                    </div>
                    <label className="mt-8 block">
                      <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Additional context <span className="font-semibold uppercase">(optional)</span>
                      </span>
                      <textarea
                        value={servicesNotes}
                        onChange={(e) => setServicesNotes(e.target.value)}
                        rows={4}
                        className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-medium outline-none focus:border-[#26b69c] dark:border-gray-600"
                        placeholder="e.g. Senior Solidity for a new marketplace, 6+ month contract…"
                      />
                    </label>
                   
                  </>
                )
              ) : null}

              {error ? (
                <p className="mt-6 text-sm capitalize font-semibold text-red-600 dark:text-red-400">
                  {error}
                </p>
              ) : null}

              <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={back}
                    className="flex flex-1 w-full items-center justify-center gap-2 rounded-full border border-gray-300 py-3 text-sm font-bold text-gray-800 dark:border-gray-600 dark:text-gray-100"
                  >
                    <PiArrowLeft />
                    Back
                  </button>
                ) : (
                  <div className="hidden flex-1 sm:block" />
                )}
                {step < steps.length - 1 ? (
                  <motion.button
                    type="button"
                    onClick={next}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#26b69c] py-3 text-sm font-bold text-white shadow-sm"
                    whileTap={{ scale: 0.98 }}
                  >
                    Continue
                    <PiArrowRight />
                  </motion.button>
                ) : (
                  <motion.button
                    type="button"
                    onClick={submit}
                    disabled={submitting}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#26b69c] py-3 text-sm font-bold text-white shadow-sm disabled:opacity-60"
                    whileTap={{ scale: submitting ? 1 : 0.98 }}
                  >
                    {submitting ? "Saving…" : "Create profile"}
                    <PiCheck />
                  </motion.button>
                )}
              </div>
            </motion.div>
          </section>
        </div>
      </div>
      <AnimatePresence>
        {step === 2 ? (
          <motion.div
            key={`${role}-${selectedBucket.count}-${selectedBucket.helper}`}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-none fixed bottom-6 left-6 z-50"
          >
            <div className="pointer-events-auto flex pr-5 max-w-[90vw] items-center justify-start gap-3 rounded-full border border-[#26b69c]/40 bg-white/95 p-2 shadow-lg backdrop-blur dark:bg-gray-900/95">
              <motion.span
                key={`${role}-${selectedBucket.count}`}
                initial={{ scale: 0.85, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 360, damping: 22 }}
                className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-[#26b69c] px-2 text-xs font-bold text-white"
              >
                {selectedBucket.count}
              </motion.span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#26b69c]">
                  {selectedBucket.label}
                </p>
                {/* <p className="truncate text-xs font-semibold text-gray-600 dark:text-gray-300">
                  {selectedBucket.helper}
                </p> */}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
