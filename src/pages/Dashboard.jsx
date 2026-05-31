import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useWallet } from "../context/WalletContext.jsx";
import ClientDashboard from "./client/ClientDashboard.jsx";
import FreelancerDashboard from "./freelancer/FreelancerDashboard.jsx";
import { ProfileStrip } from "../components/dashboard/DashboardUI.jsx";
import { DashboardStatsProvider } from "../context/DashboardStatsContext.jsx";
import {
  PiBriefcaseDuotone,
  PiGraduationCapDuotone,
  PiImageDuotone,
  PiLinkDuotone,
} from "react-icons/pi";
import AdminDashboard from "./admin/AdminDashboard.jsx";

function parseProfileProjects(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return [];
}

function hasMeaningfulProject(profile) {
  return parseProfileProjects(profile?.projects).some((proj) => {
    const title = String(proj?.title || "").trim();
    const gh = String(proj?.github || "").trim();
    const blog = String(proj?.blog || "").trim();
    const imgs = Array.isArray(proj?.images) ? proj.images : [];
    return title.length > 0 || gh.length > 0 || blog.length > 0 || imgs.length > 0;
  });
}

function hasMeaningfulEducation(profile) {
  const raw = profile?.educationEntries;
  if (!Array.isArray(raw) || raw.length === 0) return false;
  return raw.some((e) => {
    const title = String(e?.title || "").trim();
    const school = String(e?.school || "").trim();
    const desc = String(e?.description || "").trim();
    return title.length > 0 || school.length > 0 || desc.length > 0;
  });
}

function hasPortfolioLinks(profile) {
  const gh = String(profile?.github || "").trim();
  const li = String(profile?.linkedin || "").trim();
  return gh.length > 0 || li.length > 0;
}

function hasAvatar(profile) {
  return Boolean(String(profile?.avatar || "").trim());
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { isConnected } = useWallet();
  const { user, loading, profileComplete, refreshUser } = useAuth();

  useEffect(() => {
    // if (!isConnected && !loading) {
    //   navigate("/", { replace: true });
    //   return;
    // }
    if (!loading && user && profileComplete === false) {
      navigate("/dashboard/profile", { replace: true });
    }
  }, [isConnected, loading, user, profileComplete, navigate]);

  useEffect(() => {
    if (!loading && isConnected) {
      void refreshUser();
    }
  }, [loading, isConnected, refreshUser]);

  const profile = user?.profile ?? null;
  const role = user?.role;

  const checklist = useMemo(() => {
    if (!profile || role !== "FREELANCER") {
      return { avatar: true, projects: true, education: true, portfolio: true };
    }
    return {
      avatar: hasAvatar(profile),
      projects: hasMeaningfulProject(profile),
      education: hasMeaningfulEducation(profile),
      portfolio: hasPortfolioLinks(profile),
    };
  }, [profile, role]);

  const incompleteCount = useMemo(() => {
    if (role !== "FREELANCER") return 0;
    return Object.values(checklist).filter((done) => !done).length;
  }, [checklist, role]);

  const freelancerSteps = [
    {
      key: "avatar",
      done: checklist.avatar,
      stepId: "personal",
      icon: PiImageDuotone,
      title: "Add your profile photo",
      subtext: "A clear avatar helps clients recognize you and builds trust.",
    },
    {
      key: "projects",
      done: checklist.projects,
      stepId: "projects",
      icon: PiBriefcaseDuotone,
      title: "Add at least one project",
      subtext: "Show repos, blog links, or screenshots of real work.",
    },
    {
      key: "portfolio",
      done: checklist.portfolio,
      stepId: "portfolio",
      icon: PiLinkDuotone,
      title: "Link GitHub or LinkedIn",
      subtext: "Let clients verify your background in one click.",
    },
    {
      key: "education",
      done: checklist.education,
      stepId: "academic",
      icon: PiGraduationCapDuotone,
      title: "Add your education",
      subtext: "Degrees, bootcamps, or certs add context to your skills.",
    },
  ];

  const pendingSteps = freelancerSteps.filter((s) => !s.done);

  if (loading || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#26b69c] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProfileStrip
        user={user}
        profile={profile}
        role={role}
        checklist={checklist}
        incompleteCount={incompleteCount}
      />

      {role === "FREELANCER" && pendingSteps.length > 0 ? (
        <section className="rounded-2xl border border-amber-200/60 bg-amber-500/[0.06] p-4 dark:border-amber-900/40 dark:bg-amber-950/20 sm:p-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Complete your profile</h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Stronger profiles win more bids — finish these steps when you can.
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {pendingSteps.map((s) => {
              const Icon = s.icon;
              return (
                <li key={s.key}>
                  <Link
                    to={`/dashboard/profile?step=${encodeURIComponent(s.stepId)}`}
                    className="flex gap-3 rounded-xl border border-white/80 bg-white/90 p-3 transition hover:border-[#26b69c]/30 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900/80"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-gray-800 dark:text-slate-200">
                      <Icon size={20} aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{s.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{s.subtext}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {user.role === "CLIENT" ? (
        <DashboardStatsProvider role="CLIENT">
          <ClientDashboard />
        </DashboardStatsProvider>
      ) : user.role === "ADMIN" ? <AdminDashboard /> : (
        <DashboardStatsProvider role="FREELANCER">
          <FreelancerDashboard />
        </DashboardStatsProvider>
      )}
    </div>
  );
}
