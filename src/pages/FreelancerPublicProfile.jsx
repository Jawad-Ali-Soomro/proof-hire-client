import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  PiCaretLeft,
  PiFilePdfDuotone,
  PiFileTextDuotone,
  PiGithubLogoDuotone,
  PiImagesDuotone,
  PiLinkedinLogoDuotone,
  PiX,
} from "react-icons/pi";
import { RichLabel } from "../components/jobs/JobShellUi.jsx";
import { apiRequest, getStoredToken } from "../lib/api.js";
import { isPdfUrl, normalizePublicProfile, strTrim } from "../lib/profileView.js";

const SCHOOL_LABELS = {
  mit: "Massachusetts Institute of Technology",
  stanford: "Stanford University",
  harvard: "Harvard University",
  oxford: "University of Oxford",
  cambridge: "University of Cambridge",
  other: "Other / Not listed",
};

function schoolLabel(value) {
  const v = strTrim(value);
  return SCHOOL_LABELS[v] || v || "—";
}

function EmptyTab({ message }) {
  return (
    <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-500 dark:border-gray-700 dark:bg-gray-800/40 dark:text-slate-400">
      {message}
    </p>
  );
}

function DocPreviewModal({ doc, onClose }) {
  useEffect(() => {
    if (!doc) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doc, onClose]);

  if (!doc) return null;

  const pdf = isPdfUrl(doc.url);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative z-[101] flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-gray-800">
          <p className="truncate pr-4 text-sm font-bold text-slate-900 dark:text-white">{doc.label}</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-gray-800"
            aria-label="Close preview"
          >
            <PiX size={22} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {pdf ? (
            <div className="flex flex-col items-center gap-4 py-6">
              <PiFilePdfDuotone className="text-[#26b69c]" size={48} aria-hidden />
              <a
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-[#26b69c] px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
              >
                Open PDF
              </a>
            </div>
          ) : (
            <img src={doc.url} alt="" className="mx-auto max-h-[70vh] w-full rounded-xl object-contain" />
          )}
        </div>
        <div className="border-t border-slate-100 px-4 py-3 dark:border-gray-800">
          <a
            href={doc.url}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-[#26b69c] underline"
          >
            Open in new tab
          </a>
        </div>
      </div>
    </div>
  );
}

export default function FreelancerPublicProfile() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [previewDoc, setPreviewDoc] = useState(null);

  const load = useCallback(async () => {
    const id = Number(userId);
    if (!userId || !Number.isInteger(id) || id < 1) {
      setUser(null);
      setError("Invalid profile link");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest(`/users/public/${id}`, { token: getStoredToken() });
      const u = data && typeof data === "object" && "user" in data ? data.user : null;
      setUser(u);
      if (!u) setError("Profile not found");
    } catch (e) {
      setUser(null);
      setError(e instanceof Error ? e.message : "Could not load profile");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const view = useMemo(() => normalizePublicProfile(user?.profile), [user]);

  const tabs = useMemo(
    () => [
      { id: "overview", label: "Overview" },
      { id: "skills", label: "Skills" },
      { id: "education", label: "Education" },
      { id: "projects", label: "Projects" },
      { id: "services", label: "Services" },
      { id: "links", label: "Links" },
      { id: "docs", label: "Docs" },
    ],
    [],
  );

  const p = user?.profile;
  const displayName = String(p?.fullName ?? "").trim() || user?.username || "Freelancer";
  const rawAv = p?.avatar;
  const avatarUrl = rawAv == null ? "" : String(rawAv).trim();

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        to="/dashboard/client/projects"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#26b69c] hover:underline"
      >
        <PiCaretLeft size={18} aria-hidden />
        Back to projects
      </Link>

      {loading ? (
        <p className="mt-10 text-center text-sm font-medium text-slate-500 dark:text-slate-400">Loading…</p>
      ) : error || !user ? (
        <p className="mt-10 text-sm font-medium text-red-600 dark:text-red-400">{error || "Not found"}</p>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-slate-100 p-6 dark:border-gray-800">
            <div className="flex flex-wrap items-start gap-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className="h-20 w-20 shrink-0 rounded-2xl border border-slate-200 object-cover dark:border-gray-700"
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-100 text-2xl font-bold text-slate-500 dark:border-gray-600 dark:bg-gray-800">
                  {(displayName || "?").slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1 text-left">
                <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{displayName}</h1>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">@{user.username}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                  {String(user.role || "").replace("_", " ")}
                </p>
                {view.location ? (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{view.location}</p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="border-b border-slate-100 px-4 dark:border-gray-800 sm:px-6">
            <div
              className="-mb-px flex gap-1 overflow-x-auto pb-px scrollbar-thin"
              role="tablist"
              aria-label="Profile sections"
            >
              {tabs.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveTab(tab.id)}
                    className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? "border-[#26b69c] text-[#156b59] dark:text-[#56d9c0]"
                        : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                  >
                    {tab.label}
                    {tab.id === "docs" && view.docs.length ? (
                      <span className="ml-1.5 rounded-full bg-[#26b69c]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#26b69c]">
                        {view.docs.length}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6 text-left" role="tabpanel">
            {activeTab === "overview" ? (
              <div className="space-y-6">
                {view.summary ? (
                  <div>
                    <RichLabel>Summary</RichLabel>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {view.summary}
                    </p>
                  </div>
                ) : null}
                {view.bio ? (
                  <div>
                    <RichLabel>Bio</RichLabel>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {view.bio}
                    </p>
                  </div>
                ) : null}
                {!view.summary && !view.bio ? (
                  <EmptyTab message="No overview added yet." />
                ) : null}
              </div>
            ) : null}

            {activeTab === "skills" ? (
              <div>
                <RichLabel>Skills</RichLabel>
                {view.skills.length ? (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {view.skills.map((skill) => (
                      <li
                        key={skill}
                        className="rounded-full border border-[#26b69c]/25 bg-[#26b69c]/10 px-3 py-1 text-xs font-bold text-[#156b59] dark:text-[#56d9c0]"
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyTab message="No skills listed." />
                )}
              </div>
            ) : null}

            {activeTab === "education" ? (
              <div className="space-y-4">
                {view.education.length ? (
                  view.education.map((entry, idx) => (
                    <article
                      key={`${entry.title}-${entry.school}-${idx}`}
                      className="rounded-xl border border-slate-200 p-4 dark:border-gray-800"
                    >
                      <h3 className="font-bold text-slate-900 dark:text-white">{entry.title || "Education"}</h3>
                      <p className="mt-1 text-sm font-semibold text-[#26b69c]">{schoolLabel(entry.school)}</p>
                      {(entry.startYear || entry.endYear || entry.year) && (
                        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                          {entry.startYear || entry.endYear
                            ? `${entry.startYear || "—"} – ${entry.endYear || "—"}`
                            : entry.year}
                        </p>
                      )}
                      {entry.description ? (
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                          {entry.description}
                        </p>
                      ) : null}
                      {entry.images.length ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {entry.images.map((url, i) => (
                            <button
                              key={`${url}-${i}`}
                              type="button"
                              onClick={() =>
                                setPreviewDoc({
                                  url,
                                  label: entry.title ? `${entry.title} — document ${i + 1}` : `Education document ${i + 1}`,
                                })
                              }
                              className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-gray-700"
                            >
                              {isPdfUrl(url) ? (
                                <span className="flex h-20 w-20 items-center justify-center bg-slate-100 dark:bg-gray-800">
                                  <PiFilePdfDuotone className="text-[#26b69c]" size={28} aria-hidden />
                                </span>
                              ) : (
                                <img src={url} alt="" className="h-20 w-20 object-cover transition group-hover:opacity-90" />
                              )}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </article>
                  ))
                ) : (
                  <EmptyTab message="No education entries." />
                )}
              </div>
            ) : null}

            {activeTab === "projects" ? (
              <div className="space-y-4">
                {view.projects.length ? (
                  view.projects.map((proj, idx) => (
                    <article
                      key={`${proj.title}-${proj.year}-${idx}`}
                      className="rounded-xl border border-slate-200 p-4 dark:border-gray-800"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-white">{proj.title || "Project"}</h3>
                        {proj.year ? (
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:bg-gray-800 dark:text-slate-300">
                            {proj.year}
                          </span>
                        ) : null}
                      </div>
                      {proj.description ? (
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                          {proj.description}
                        </p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-3">
                        {proj.github ? (
                          <a
                            href={proj.github}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#26b69c] underline"
                          >
                            <PiGithubLogoDuotone size={16} aria-hidden />
                            GitHub
                          </a>
                        ) : null}
                        {proj.blog ? (
                          <a
                            href={proj.blog}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#26b69c] underline"
                          >
                            <PiFileTextDuotone size={16} aria-hidden />
                            Write-up
                          </a>
                        ) : null}
                      </div>
                      {proj.images.length ? (
                        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {proj.images.map((url, i) => (
                            <button
                              key={`${url}-${i}`}
                              type="button"
                              onClick={() =>
                                setPreviewDoc({
                                  url,
                                  label: proj.title ? `${proj.title} — image ${i + 1}` : `Project image ${i + 1}`,
                                })
                              }
                              className="overflow-hidden rounded-xl border border-slate-200 dark:border-gray-700"
                            >
                              <img src={url} alt="" className="aspect-video w-full object-cover transition hover:opacity-90" />
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </article>
                  ))
                ) : (
                  <EmptyTab message="No projects listed." />
                )}
              </div>
            ) : null}

            {activeTab === "services" ? (
              <div>
                <RichLabel>Services</RichLabel>
                {view.services ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {view.services}
                  </p>
                ) : (
                  <EmptyTab message="No services listed." />
                )}
              </div>
            ) : null}

            {activeTab === "links" ? (
              <div className="flex flex-wrap gap-3">
                {view.linkedin ? (
                  <a
                    href={view.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-[#26b69c] transition hover:border-[#26b69c]/40 hover:bg-[#26b69c]/5 dark:border-gray-700"
                  >
                    <PiLinkedinLogoDuotone size={20} aria-hidden />
                    LinkedIn
                  </a>
                ) : null}
                {view.github ? (
                  <a
                    href={view.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-[#26b69c] transition hover:border-[#26b69c]/40 hover:bg-[#26b69c]/5 dark:border-gray-700"
                  >
                    <PiGithubLogoDuotone size={20} aria-hidden />
                    GitHub
                  </a>
                ) : null}
                {!view.linkedin && !view.github ? <EmptyTab message="No links added." /> : null}
              </div>
            ) : null}

            {activeTab === "docs" ? (
              <div>
                <RichLabel>Documents & media</RichLabel>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Certificates, diplomas, and project files from this profile.
                </p>
                {view.docs.length ? (
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {view.docs.map((doc, idx) => (
                      <li key={`${doc.url}-${idx}`}>
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(doc)}
                          className="flex w-full flex-col overflow-hidden rounded-xl border border-slate-200 text-left transition hover:border-[#26b69c]/40 hover:shadow-md dark:border-gray-700"
                        >
                          <div className="relative flex aspect-[4/3] items-center justify-center bg-slate-100 dark:bg-gray-800">
                            {isPdfUrl(doc.url) ? (
                              <PiFilePdfDuotone className="text-[#26b69c]" size={40} aria-hidden />
                            ) : (
                              <img src={doc.url} alt="" className="h-full w-full object-cover" />
                            )}
                            <span className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                              {doc.kind}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 border-t border-slate-100 px-3 py-2.5 dark:border-gray-800">
                            <PiImagesDuotone className="shrink-0 text-[#26b69c]" size={18} aria-hidden />
                            <span className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                              {doc.label}
                            </span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyTab message="No documents uploaded yet." />
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      <DocPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
    </div>
  );
}
