import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  PiArrowSquareOut,
  PiPencilSimpleLineDuotone,
  PiBriefcaseDuotone,
  PiCalendarBlankDuotone,
  PiCaretDown,
  PiCurrencyCircleDollarDuotone,
  PiFunnelDuotone,
  PiListChecksDuotone,
  PiMagnifyingGlassDuotone,
  PiProhibitDuotone,
  PiUsersThreeDuotone,
  PiUserDuotone,
  PiX,
} from "react-icons/pi";
import {
  BidCountBadge,
  BidStatusBadge,
  parseMilestones,
  BulletRichText,
  ProseRichText,
  RichLabel,
  RichPrice,
  StatusBadge,
} from "../../components/jobs/JobShellUi.jsx";
import { MilestoneDetailPanel, ProjectImagesButton } from "../../components/jobs/ProjectMedia.jsx";
import { apiRequest, getStoredToken } from "../../lib/api.js";
import DropdownSelect from "../../components/ui/DropdownSelect.jsx";
import ClientOnly from "./ClientOnly.jsx";

export default function ClientTrackProjects() {
  const [jobs, setJobs] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerJobId, setDrawerJobId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyBidId, setBusyBidId] = useState(null);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [cancelConfirmVariant, setCancelConfirmVariant] = useState(null);
  const [expandedMilestoneIndex, setExpandedMilestoneIndex] = useState(null);
  const [expandedBidId, setExpandedBidId] = useState(null);

  const loadList = useCallback(async () => {
    setListLoading(true);
    setListError("");
    try {
      const data = await apiRequest("/jobs/mine", { token: getStoredToken() });
      const list = Array.isArray(data) ? data : [];
      setJobs(list.filter((j) => j.status !== "COMPLETED" && j.status !== "CANCELLED"));
    } catch (e) {
      setJobs([]);
      setListError(e instanceof Error ? e.message : "Could not load projects");
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
    setActionError("");
    try {
      const data = await apiRequest(`/jobs/${jobId}`, { token: getStoredToken() });
      setDetail(data);
    } catch (e) {
      setDetail(null);
      setDetailError(e instanceof Error ? e.message : "Could not load project");
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
    if (statusFilter !== "ALL") {
      list = list.filter((j) => j.status === statusFilter);
    }
    if (sortBy === "budget-desc") list.sort((a, b) => Number(b.budget) - Number(a.budget));
    else if (sortBy === "budget-asc") list.sort((a, b) => Number(a.budget) - Number(b.budget));
    else if (sortBy === "bids-desc")
      list.sort((a, b) => (b._count?.bids ?? 0) - (a._count?.bids ?? 0));
    else list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }, [jobs, search, statusFilter, sortBy]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    if (!drawerOpen || !drawerJobId) return;
    loadDetail(drawerJobId);
  }, [drawerOpen, drawerJobId, loadDetail]);

  useEffect(() => {
    setExpandedMilestoneIndex(null);
    setExpandedBidId(null);
  }, [drawerJobId]);

  const openDrawer = (jobId) => {
    setDrawerJobId(jobId);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerJobId(null);
    setDetail(null);
    setDetailError("");
    setActionError("");
    setCancelConfirmOpen(false);
    setCancelConfirmVariant(null);
  };

  const setBid = async (bidId, status) => {
    setBusyBidId(bidId);
    setActionError("");
    try {
      await apiRequest(`/jobs/bids/${bidId}`, {
        method: "PATCH",
        token: getStoredToken(),
        body: { status },
      });
      if (drawerJobId) await loadDetail(drawerJobId);
      await loadList();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not update bid");
    } finally {
      setBusyBidId(null);
    }
  };

  const openCancelConfirm = (variant) => {
    setCancelConfirmVariant(variant);
    setCancelConfirmOpen(true);
  };

  const performCancelJob = async () => {
    if (!detail?.id) return;
    setCancelBusy(true);
    setActionError("");
    try {
      await apiRequest(`/jobs/${detail.id}`, {
        method: "PATCH",
        token: getStoredToken(),
        body: { status: "CANCELLED" },
      });
      setCancelConfirmOpen(false);
      setCancelConfirmVariant(null);
      closeDrawer();
      await loadList();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not cancel project");
    } finally {
      setCancelBusy(false);
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
  const canCancel = detail && (detail.status === "OPEN" || detail.status === "IN_PROGRESS");
  const cancelConfirmMessage =
    cancelConfirmVariant === "OPEN"
      ? "Close this listing? It will stop accepting new bids and move to cancelled."
      : cancelConfirmVariant === "IN_PROGRESS"
        ? "Cancel this project? It will be marked as cancelled."
        : "";

  return (
    <ClientOnly>
      <div className="mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Track projects</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Active listings only. Completed or cancelled projects move to{" "}
            <Link to="/dashboard/history" className="font-medium text-[#26b69c] underline">
              History
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
                className="w-full rounded-xl border min-w-[400px] border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-[#26b69c] dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-[#26b69c]"
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
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value)}
                  options={[
                    { value: "ALL", label: "All statuses" },
                    { value: "OPEN", label: "Open" },
                    { value: "IN_PROGRESS", label: "In progress" },
                  ]}
                  placeholder="Status"
                />
              </div>
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
            <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">No active projects.</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              <Link to="/dashboard/history" className="font-medium text-[#26b69c] underline">
                View history
              </Link>{" "}
              for completed or cancelled listings.
            </p>
            <Link
              to="/dashboard/client/post-project"
              className="mt-4 inline-block text-sm font-medium text-violet-600 underline dark:text-violet-400"
            >
              Post a project
            </Link>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-6 py-10 text-center dark:border-gray-700 dark:bg-gray-900/40">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No projects match your filters.</p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
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
                    onClick={() => openDrawer(job.id)}
                    className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50 dark:border-gray-600 dark:text-slate-200 dark:hover:bg-gray-900"
                  >
                    Details
                  </button>
                  <Link
                    to={`/dashboard/client/projects/${job.id}`}
                    className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-slate-900 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-gray-900 dark:hover:bg-slate-200"
                  >
                    Full page
                    <PiArrowSquareOut size={16} aria-hidden />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

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
            aria-labelledby="client-job-drawer-title"
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-gray-800">
              <div className="min-w-0">
                <div className="mb-1">
                  <RichLabel>Project details</RichLabel>
                </div>
                <h2 id="client-job-drawer-title" className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                  {detail?.title || "Loading…"}
                </h2>
                {detail ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusBadge status={detail.status} />
                    <BidCountBadge n={detail._count?.bids ?? detail.bids?.length ?? 0} />
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
              {actionError ? (
                <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                  {actionError}
                </p>
              ) : null}

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
                    <div className="mb-2">
                      <RichLabel>Overview</RichLabel>
                    </div>
                    <ProseRichText text={detail.description} />
                  </div>

                  {detail.requirements ? (
                    <div>
                      <div className="mb-2">
                        <RichLabel>Requirements</RichLabel>
                      </div>
                      <BulletRichText text={detail.requirements} />
                    </div>
                  ) : null}

                  {detail.paymentNotes ? (
                    <div>
                      <div className="mb-2">
                        <RichLabel>Payment</RichLabel>
                      </div>
                      <BulletRichText text={detail.paymentNotes} />
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
                                <div className="border-t border-slate-100 px-3 py-3 text-sm leading-relaxed text-slate-600 dark:border-gray-800 dark:text-slate-400">
                                  <MilestoneDetailPanel milestone={m} />
                                </div>
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : null}

                  <div>
                    <div className="mb-2 flex items-center gap-1.5">
                      <PiUsersThreeDuotone className="shrink-0 text-violet-500" size={18} aria-hidden />
                      <RichLabel>Applicants</RichLabel>
                    </div>
                    {!detail.bids?.length ? (
                      <p className="text-sm text-slate-600 dark:text-slate-400">No bids yet.</p>
                    ) : (
                      <ul className="space-y-2" role="list">
                        {detail.bids.map((bid) => {
                          const name =
                            bid.freelancer?.profile?.fullName || bid.freelancer?.username || "User";
                          const pending = bid.status === "PENDING";
                          const freelancerId = bid.freelancer?.id;
                          const open = expandedBidId === bid.id;
                          return (
                            <li
                              key={bid.id}
                              className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900/40"
                            >
                              <button
                                type="button"
                                aria-expanded={open}
                                aria-label={`${open ? "Hide" : "Show"} details for ${name}`}
                                onClick={() => setExpandedBidId((cur) => (cur === bid.id ? null : bid.id))}
                                className="flex w-full items-center gap-3 bg-slate-50/90 px-3 py-3 text-left transition hover:bg-slate-100/90 dark:bg-gray-900/80 dark:hover:bg-gray-800/80"
                              >
                                {bid.freelancer?.profile?.avatar ? (
                                  <img
                                    src={bid.freelancer.profile.avatar}
                                    alt=""
                                    className="h-11 w-11 shrink-0 rounded-full border border-slate-200 object-cover dark:border-gray-700"
                                  />
                                ) : (
                                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-dashed border-slate-300 bg-slate-100 text-sm font-bold text-slate-500 dark:border-gray-600 dark:bg-gray-800">
                                    {(name || "?").slice(0, 1).toUpperCase()}
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-semibold text-slate-900 dark:text-white">{name}</p>
                                </div>
                                <div className="shrink-0 text-right">
                                  <RichPrice value={bid.amount} size="sm" />
                                </div>
                                <PiCaretDown
                                  className={`shrink-0 text-slate-500 transition-transform dark:text-slate-400 ${open ? "rotate-180" : ""}`}
                                  size={18}
                                  aria-hidden
                                />
                              </button>
                              {open ? (
                                <div className="space-y-3 border-t border-slate-100 px-3 py-3 dark:border-gray-800">
                                  <div>
                                    <BidStatusBadge status={bid.status} />
                                  </div>
                                  <div>
                                    <div className="mb-1">
                                      <RichLabel>Message</RichLabel>
                                    </div>
                                    {bid.message ? (
                                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                                        {bid.message}
                                      </p>
                                    ) : (
                                      <p className="text-sm italic text-slate-500 dark:text-slate-500">No message.</p>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    {freelancerId ? (
                                      <Link
                                        to={`/dashboard/freelancers/${freelancerId}`}
                                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50 dark:border-gray-600 dark:text-slate-200 dark:hover:bg-gray-800"
                                      >
                                        <PiUserDuotone size={18} aria-hidden />
                                        View profile
                                      </Link>
                                    ) : null}
                                    {pending ? (
                                      <>
                                        <button
                                          type="button"
                                          disabled={busyBidId === bid.id || detail.status !== "OPEN"}
                                          onClick={() => setBid(bid.id, "ACCEPTED")}
                                          className="inline-flex flex-1 items-center justify-center rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-40 dark:bg-white dark:text-gray-900 dark:hover:bg-slate-200"
                                        >
                                          Approve
                                        </button>
                                        <button
                                          type="button"
                                          disabled={busyBidId === bid.id}
                                          onClick={() => setBid(bid.id, "REJECTED")}
                                          className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-gray-600 dark:text-slate-300 dark:hover:bg-gray-800"
                                        >
                                          Reject
                                        </button>
                                      </>
                                    ) : null}
                                  </div>
                                </div>
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    {detail.status !== "OPEN" ? (
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">This project is closed to new bid approvals.</p>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>

            {detail && !detailLoading ? (
              <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/dashboard/client/projects/${detail.id}`}
                      className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-800 dark:border-gray-600 dark:text-slate-200"
                    >
                      Open full page
                      <PiArrowSquareOut size={16} aria-hidden />
                    </Link>
                    {detail.status === "OPEN" ? (
                      <Link
                        to={`/dashboard/client/projects/${detail.id}/edit`}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#26b69c]/40 bg-[#26b69c]/10 px-4 py-2.5 text-sm font-semibold text-[#156b59] dark:text-[#56d9c0]"
                      >
                        <PiPencilSimpleLineDuotone size={16} aria-hidden />
                        Edit project
                      </Link>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {canCancel ? (
                      <>
                        {detail.status === "OPEN" ? (
                          <button
                            type="button"
                            disabled={cancelBusy || cancelConfirmOpen}
                            onClick={() => openCancelConfirm("OPEN")}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-500/15 to-orange-500/15 px-4 py-2.5 text-sm font-semibold text-amber-900 hover:from-amber-500/25 hover:to-orange-500/25 disabled:opacity-50 dark:border-amber-700/50 dark:text-amber-100"
                          >
                            <PiProhibitDuotone size={18} aria-hidden />
                            {cancelBusy ? "Closing…" : "Close listing"}
                          </button>
                        ) : null}
                        {detail.status === "IN_PROGRESS" ? (
                          <button
                            type="button"
                            disabled={cancelBusy || cancelConfirmOpen}
                            onClick={() => openCancelConfirm("IN_PROGRESS")}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-300 bg-gradient-to-r from-rose-500/15 to-red-500/15 px-4 py-2.5 text-sm font-semibold text-rose-900 hover:from-rose-500/25 hover:to-red-500/25 disabled:opacity-50 dark:border-rose-800/50 dark:text-rose-100"
                          >
                            <PiProhibitDuotone size={18} aria-hidden />
                            {cancelBusy ? "Cancelling…" : "Cancel project"}
                          </button>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {cancelConfirmOpen ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            aria-label="Close dialog"
            disabled={cancelBusy}
            onClick={() => {
              if (!cancelBusy) {
                setCancelConfirmOpen(false);
                setCancelConfirmVariant(null);
              }
            }}
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="cancel-confirm-title"
            aria-describedby="cancel-confirm-desc"
            className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-950"
          >
            <h2 id="cancel-confirm-title" className="text-lg font-semibold text-slate-900 dark:text-white">
              {cancelConfirmVariant === "OPEN" ? "Close listing" : "Cancel project"}
            </h2>
            <p id="cancel-confirm-desc" className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {cancelConfirmMessage}
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                disabled={cancelBusy}
                onClick={() => {
                  setCancelConfirmOpen(false);
                  setCancelConfirmVariant(null);
                }}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50 disabled:opacity-50 dark:border-gray-600 dark:text-slate-200 dark:hover:bg-gray-900"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={cancelBusy}
                onClick={() => void performCancelJob()}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-slate-200"
              >
                {cancelBusy ? "Working…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ClientOnly>
  );
}
