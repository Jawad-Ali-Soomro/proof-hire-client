import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  PiBriefcaseDuotone,
  PiCalendarBlankDuotone,
  PiCaretDown,
  PiCurrencyCircleDollarDuotone,
  PiFunnelDuotone,
  PiListChecksDuotone,
  PiMagnifyingGlassDuotone,
  PiUserDuotone,
  PiX,
} from "react-icons/pi";
import {
  BidCountBadge,
  BidStatusBadge,
  BulletRichText,
  ProseRichText,
  parseMilestones,
  RichLabel,
  RichPrice,
  StatusBadge,
} from "../components/jobs/JobShellUi.jsx";
import { MilestoneDetailPanel, ProjectImagesButton } from "../components/jobs/ProjectMedia.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest, getStoredToken } from "../lib/api.js";
import DropdownSelect from "../components/ui/DropdownSelect.jsx";

export default function JobsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isFreelancer = user?.role === "FREELANCER";

  const [jobs, setJobs] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerJobId, setDrawerJobId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [focusApply, setFocusApply] = useState(false);

  const [bidAmount, setBidAmount] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [bidSubmitting, setBidSubmitting] = useState(false);
  const [bidError, setBidError] = useState("");
  const bidSectionRef = useRef(null);
  const [expandedMilestoneIndex, setExpandedMilestoneIndex] = useState(null);

  const loadList = useCallback(async () => {
    setListLoading(true);
    setListError("");
    try {
      const data = await apiRequest("/jobs/open", { token: getStoredToken() });
      setJobs(Array.isArray(data) ? data : []);
    } catch (e) {
      setJobs([]);
      setListError(e instanceof Error ? e.message : "Could not load jobs");
    } finally {
      setListLoading(false);
    }
  }, []);

  const loadDetail = useCallback(async (jobId) => {
    if (!jobId) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    setDetailError("");
    try {
      const data = await apiRequest(`/jobs/open/${jobId}`, { token: getStoredToken() });
      setDetail(data);
      setBidAmount(String(data?.budget ?? ""));
      setBidMessage("");
      setBidError("");
    } catch (e) {
      setDetail(null);
      setDetailError(e instanceof Error ? e.message : "Could not load job");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const filteredJobs = useMemo(() => {
    let list = [...jobs];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (j) =>
          String(j.title || "")
            .toLowerCase()
            .includes(q) || String(j.description || "")
            .toLowerCase()
            .includes(q),
      );
    }
    if (sortBy === "budget-desc") list.sort((a, b) => Number(b.budget) - Number(a.budget));
    else if (sortBy === "budget-asc") list.sort((a, b) => Number(a.budget) - Number(b.budget));
    else if (sortBy === "bids-desc")
      list.sort((a, b) => (b._count?.bids ?? 0) - (a._count?.bids ?? 0));
    else list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }, [jobs, search, sortBy]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    if (!drawerOpen || !drawerJobId) return;
    loadDetail(drawerJobId);
  }, [drawerOpen, drawerJobId, loadDetail]);

  useEffect(() => {
    setExpandedMilestoneIndex(null);
  }, [drawerJobId]);

  useEffect(() => {
    if (!drawerOpen || !focusApply || detailLoading || !detail || !bidSectionRef.current) return;
    if (!isFreelancer || detail.myBid) return;
    bidSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    const t = window.setTimeout(() => setFocusApply(false), 400);
    return () => window.clearTimeout(t);
  }, [drawerOpen, focusApply, detail, detailLoading, isFreelancer]);

  const openDrawer = (jobId, applyFocus) => {
    setDrawerJobId(jobId);
    setDrawerOpen(true);
    if (applyFocus) setFocusApply(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerJobId(null);
    setDetail(null);
    setDetailError("");
    setBidError("");
    setFocusApply(false);
  };

  const submitBid = async () => {
    if (!detail?.id) return;
    setBidSubmitting(true);
    setBidError("");
    try {
      const created = await apiRequest(`/jobs/${detail.id}/bids`, {
        method: "POST",
        token: getStoredToken(),
        body: {
          amount: Number(bidAmount),
          message: bidMessage.trim(),
        },
      });
      closeDrawer();
      if (isFreelancer && created?.id) {
        navigate("/dashboard/bids", { state: { openBidId: created.id } });
      } else {
        await loadList();
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not submit bid";
      setBidError(msg);
    } finally {
      setBidSubmitting(false);
    }
  };

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  const milestones = parseMilestones(detail?.milestones);
  const rawAvatar = detail?.client?.profile?.avatar;
  const avatarUrl = rawAvatar == null ? "" : String(rawAvatar).trim();

  return (
    <div className="">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Open jobs</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          Browse projects clients have posted. After you apply, the listing moves to{" "}
          <Link to="/dashboard/bids" className="font-medium text-[#26b69c] underline">
            My bids
          </Link>
          .
        </p>
      </div>

      {!listLoading && !listError && jobs.length > 0 ? (
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
          <div className="relative min-w-0 ">
            <PiMagnifyingGlassDuotone
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or description…"
              className="w-full rounded-xl border min-w-[400px] border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-[#26b69c] dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-[#26b69c]"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-[200px]">
              <PiFunnelDuotone
                className="pointer-events-none absolute left-3 top-3.5 text-slate-400"
                size={18}
                aria-hidden
              />
              <DropdownSelect
              className="pl-10"
              value={sortBy}
              onChange={(value) => setSortBy(value)}
              options={[
                { value: "newest", label: "Newest first" },
                { value: "budget-desc", label: "Budget: high → low" },
                { value: "budget-asc", label: "Budget: low → high" },
                { value: "bids-desc", label: "Most bids" },
              ]}
              placeholder="Sort by"
               />
            </div>
          </div>
        </div>
      ) : null}

      {listLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-slate-100 dark:border-gray-800 dark:bg-gray-800/50"
            />
          ))}
        </div>
      ) : listError ? (
        <p className="text-sm font-medium text-red-600 dark:text-red-400">{listError}</p>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-6 py-12 text-center dark:border-gray-700 dark:bg-gray-900/40">
          <PiBriefcaseDuotone className="mx-auto text-slate-400" size={40} aria-hidden />
          <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">No open jobs right now.</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Check back later for new listings.</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-6 py-10 text-center dark:border-gray-700 dark:bg-gray-900/40">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No jobs match your search.</p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSortBy("newest");
            }}
            className="mt-3 text-sm font-medium text-violet-600 underline dark:text-violet-400"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredJobs.map((job) => (
            <li
              key={job.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="min-h-0 flex-1">
                <h2 className="line-clamp-2 text-base font-semibold text-slate-900 dark:text-white">{job.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {job.description}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-gray-800">
                <div className="flex flex-col gap-0.5">
                  <RichLabel>Budget</RichLabel>
                  <RichPrice value={job.budget} />
                </div>
                <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
                  <StatusBadge status={job.status} />
                  <BidCountBadge n={job._count?.bids ?? 0} />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openDrawer(job.id, false)}
                  className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50 dark:border-gray-600 dark:text-slate-200 dark:hover:bg-gray-900"
                >
                  Details
                </button>
                <button
                  type="button"
                  onClick={() => openDrawer(job.id, true)}
                  disabled={!isFreelancer}
                  title={!isFreelancer ? "Only freelancers can apply" : undefined}
                  className="flex-1 rounded-xl bg-slate-900 py-2.5 text-sm font-medium capitalize text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-gray-900 dark:hover:bg-slate-200"
                >
                  Apply for job
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {drawerOpen ? (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            aria-label="Close drawer"
            onClick={closeDrawer}
          />
          <div
            className="relative flex h-full w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
            role="dialog"
            aria-modal="true"
            aria-labelledby="job-drawer-title"
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-gray-800">
              <div className="min-w-0">
                <div className="mb-1">
                  <RichLabel>Job details</RichLabel>
                </div>
                <h2 id="job-drawer-title" className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                  {detail?.title || "Loading…"}
                </h2>
                {detail ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusBadge status={detail.status} />
                    <BidCountBadge n={detail._count?.bids ?? 0} />
                    <ProjectImagesButton job={detail} />
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-800"
                aria-label="Close"
              >
                <PiX size={22} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              {detailLoading && !detail ? (
                <div className="space-y-3">
                  <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-gray-800" />
                  <div className="h-24 animate-pulse rounded-lg bg-slate-100 dark:bg-gray-800/80" />
                </div>
              ) : detailError ? (
                <p className="text-sm font-medium text-red-600 dark:text-red-400">{detailError}</p>
              ) : detail ? (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-start gap-6">
                    <div>
                      <div className="mb-1 flex items-center gap-1.5">
                        <PiCurrencyCircleDollarDuotone className="shrink-0 text-emerald-600" size={14} aria-hidden />
                        <RichLabel>Budget</RichLabel>
                      </div>
                      <RichPrice value={detail.budget} />
                    </div>
                    <div>
                      <div className="mb-1 flex items-center gap-1.5">
                        <PiCalendarBlankDuotone className="shrink-0 text-fuchsia-500" size={14} aria-hidden />
                        <RichLabel>Posted</RichLabel>
                      </div>
                      <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        {new Date(detail.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-1.5">
                      <PiUserDuotone className="shrink-0 text-teal-600" size={14} aria-hidden />
                      <RichLabel>Client</RichLabel>
                    </div>
                    <p className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="" className="h-8 w-8 rounded-full border border-slate-200 object-cover dark:border-gray-700" />
                      ) : (
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-slate-300 bg-slate-100 text-xs font-semibold text-slate-500 dark:border-gray-600 dark:bg-gray-800">
                          {(String(detail?.client?.profile?.fullName ?? "").trim() ||
                            detail?.client?.username ||
                            "?")
                            .slice(0, 1)
                            .toUpperCase()}
                        </span>
                      )}
                      <span>
                        {String(detail?.client?.profile?.fullName ?? "").trim() ||
                          detail?.client?.username ||
                          "—"}
                        </span>
                    </p>
                  </div>

                  <div>
                    <div className="mb-2">
                      <RichLabel>Overview</RichLabel>
                    </div>
                    <div className="mt-2">
                      <ProseRichText text={detail.description} />
                    </div>
                  </div>

                  {detail.requirements ? (
                    <div>
                      <div className="mb-2">
                        <RichLabel>Requirements</RichLabel>
                      </div>
                      <div className="mt-2">
                        <BulletRichText text={detail.requirements} />
                      </div>
                    </div>
                  ) : null}

                  {detail.paymentNotes ? (
                    <div>
                      <div className="mb-2">
                        <RichLabel>Payment</RichLabel>
                      </div>
                      <div className="mt-2">
                        <BulletRichText text={detail.paymentNotes} />
                      </div>
                    </div>
                  ) : null}

                  {milestones.length ? (
                    <div>
                      <div className="mb-2 flex items-center gap-1.5">
                        <PiListChecksDuotone className="shrink-0 text-indigo-500" size={14} aria-hidden />
                        <RichLabel>Milestones</RichLabel>
                      </div>
                      <ul className="space-y-2" role="list">
                        {milestones.map((m, i) => {
                          const open = expandedMilestoneIndex === i;
                          return (
                            <li
                              key={i}
                              className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900/40"
                            >
                              <button
                                type="button"
                                aria-expanded={open}
                                aria-label={`${open ? "Hide" : "Show"} milestone ${i + 1} details`}
                                onClick={() => setExpandedMilestoneIndex((cur) => (cur === i ? null : i))}
                                className="flex w-full items-center justify-between gap-2 bg-slate-50/90 px-3 py-3 text-left transition hover:bg-slate-100/90 dark:bg-gray-900/80 dark:hover:bg-gray-800/80"
                              >
                                <span className="flex min-w-0 items-baseline gap-2">
                                  <span className="shrink-0 text-sm font-semibold text-slate-500 dark:text-slate-400">
                                    {i + 1}.
                                  </span>
                                  <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                                    {m.title || "Untitled"}
                                  </span>
                                </span>
                                <PiCaretDown
                                  className={`shrink-0 text-slate-500 transition-transform dark:text-slate-400 ${open ? "rotate-180" : ""}`}
                                  size={18}
                                  aria-hidden
                                />
                              </button>
                              {open ? (
                                <div className="border-t border-slate-100 px-3 py-3 dark:border-gray-800">
                                  <MilestoneDetailPanel milestone={m} />
                                </div>
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : null}

                  {isFreelancer && detail.myBid ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900/60">
                      <div className="mb-1">
                        <RichLabel>Your bid</RichLabel>
                      </div>
                      <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <RichPrice value={detail.myBid.amount} />
                        <BidStatusBadge status={detail.myBid.status} />
                      </p>
                      <p className="mt-1 line-clamp-3 text-xs text-slate-500 dark:text-slate-400">{detail.myBid.message}</p>
                    </div>
                  ) : null}

                  {isFreelancer && !detail.myBid ? (
                    <div ref={bidSectionRef} className="border-t border-slate-200 pt-4 dark:border-gray-700">
                      <div className="mb-3">
                        <RichLabel>Submit proposal</RichLabel>
                      </div>
                      {!user?.wallet ? (
                        <div className="mb-3 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2.5 dark:border-orange-900/50 dark:bg-orange-950/30">
                          <p className="text-xs font-semibold text-orange-700 dark:text-orange-400">
                            Connect your wallet to bid on projects.
                          </p>
                          <p className="mt-0.5 text-[11px] text-orange-600/80 dark:text-orange-400/70">
                            Go to your profile settings to link a wallet.
                          </p>
                        </div>
                      ) : null}
                      <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-900/50 dark:bg-amber-950/30">
                        <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                          Cost: {detail.bidCost ?? 10} coins to bid
                        </span>
                      </div>
                      <label className="block">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Bid amount (USD)</span>
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-[#26b69c] dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                        />
                      </label>
                      <label className="mt-3 block">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Message</span>
                        <textarea
                          value={bidMessage}
                          onChange={(e) => setBidMessage(e.target.value)}
                          rows={4}
                          placeholder="Why you’re a fit, timeline, and relevant experience…"
                          className="mt-1 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-[#26b69c] dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                        />
                      </label>
                      {bidError ? <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">{bidError}</p> : null}
                      <button
                        type="button"
                        disabled={bidSubmitting || detail.status !== "OPEN"}
                        onClick={submitBid}
                        className="mt-4 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-40 dark:bg-white dark:text-gray-900 dark:hover:bg-slate-200"
                      >
                        {bidSubmitting ? "Submitting…" : "Submit bid"}
                      </button>
                    </div>
                  ) : null}

                  {!isFreelancer ? (
                    <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-gray-800 dark:bg-gray-900/60 dark:text-slate-400">
                      Freelancer accounts can apply to open jobs. Post work from the client dashboard if you are hiring.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
