import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  PiBriefcaseDuotone,
  PiCalendarBlankDuotone,
  PiCaretDown,
  PiCurrencyCircleDollarDuotone,
  PiFunnelDuotone,
  PiHandshakeDuotone,
  PiListChecksDuotone,
  PiMagnifyingGlassDuotone,
  PiUserDuotone,
  PiX,
} from "react-icons/pi";
import {
  BidStatusBadge,
  BulletRichText,
  ProseRichText,
  parseMilestones,
  RichLabel,
  RichPrice,
  StatusBadge,
} from "../../components/jobs/JobShellUi.jsx";
import { MilestoneDetailPanel, ProjectImagesButton } from "../../components/jobs/ProjectMedia.jsx";
import { apiRequest, getStoredToken } from "../../lib/api.js";
import DropdownSelect from "../../components/ui/DropdownSelect.jsx";
import FreelancerOnly from "./FreelancerOnly.jsx";

export default function FreelancerBidsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [bids, setBids] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [sortBy, setSortBy] = useState("newest");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerBidId, setDrawerBidId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [expandedMilestoneIndex, setExpandedMilestoneIndex] = useState(null);

  const loadList = useCallback(async () => {
    setListLoading(true);
    setListError("");
    try {
      const data = await apiRequest("/jobs/bids/mine", { token: getStoredToken() });
      setBids(Array.isArray(data) ? data : []);
    } catch (e) {
      setBids([]);
      setListError(e instanceof Error ? e.message : "Could not load bids");
    } finally {
      setListLoading(false);
    }
  }, []);

  const loadDetail = useCallback(async (bidId) => {
    if (!bidId) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    setDetailError("");
    try {
      const data = await apiRequest(`/jobs/bids/${bidId}`, { token: getStoredToken() });
      setDetail(data);
    } catch (e) {
      setDetail(null);
      setDetailError(e instanceof Error ? e.message : "Could not load bid");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const filteredBids = useMemo(() => {
    let list = [...bids];
    if (statusFilter === "ACTIVE") {
      list = list.filter((b) => b.status === "PENDING");
    } else if (statusFilter !== "ALL") {
      list = list.filter((b) => b.status === statusFilter);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((b) => {
        const job = b.job || {};
        return (
          String(job.title || "")
            .toLowerCase()
            .includes(q) ||
          String(job.description || "")
            .toLowerCase()
            .includes(q) ||
          String(b.message || "")
            .toLowerCase()
            .includes(q)
        );
      });
    }
    if (sortBy === "amount-desc") list.sort((a, b) => Number(b.amount) - Number(a.amount));
    else if (sortBy === "amount-asc") list.sort((a, b) => Number(a.amount) - Number(b.amount));
    else if (sortBy === "budget-desc")
      list.sort((a, b) => Number(b.job?.budget ?? 0) - Number(a.job?.budget ?? 0));
    else list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }, [bids, search, statusFilter, sortBy]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    if (!drawerOpen || !drawerBidId) return;
    loadDetail(drawerBidId);
  }, [drawerOpen, drawerBidId, loadDetail]);

  useEffect(() => {
    setExpandedMilestoneIndex(null);
  }, [drawerBidId]);

  const openDrawer = (bidId) => {
    setDrawerBidId(bidId);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerBidId(null);
    setDetail(null);
    setDetailError("");
  };

  useEffect(() => {
    const openBidId = location.state?.openBidId;
    if (!openBidId) return;
    openDrawer(openBidId);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state?.openBidId, location.pathname, navigate]);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  const job = detail?.job;
  const milestones = parseMilestones(job?.milestones);
  const clientName =
    String(job?.client?.profile?.fullName ?? "").trim() || job?.client?.username || "Client";
  const rawAvatar = job?.client?.profile?.avatar;
  const avatarUrl = rawAvatar == null ? "" : String(rawAvatar).trim();

  return (
    <FreelancerOnly>
      <div className="mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">My bids</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Applications you submitted from{" "}
            <Link to="/dashboard/jobs" className="font-medium text-[#26b69c] underline">
              Open jobs
            </Link>
            . Accepted bids with a contract appear under{" "}
            <Link to="/dashboard/contracts" className="font-medium text-[#26b69c] underline">
              Contracts
            </Link>
            ; rejected ones stay here.
          </p>
        </div>

        {!listLoading && !listError && bids.length > 0 ? (
          <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
            <div className="relative min-w-0">
              <PiMagnifyingGlassDuotone
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
                aria-hidden
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, brief, or message…"
                className="w-full min-w-[400px] rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#26b69c] dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-[#26b69c]"
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
                  onChange={setStatusFilter}
                  options={[
                    { value: "ACTIVE", label: "Active (pending)" },
                    { value: "ALL", label: "All statuses" },
                    { value: "PENDING", label: "Pending" },
                    { value: "REJECTED", label: "Rejected" },
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
                  onChange={setSortBy}
                  options={[
                    { value: "newest", label: "Newest first" },
                    { value: "amount-desc", label: "Your bid: high → low" },
                    { value: "amount-asc", label: "Your bid: low → high" },
                    { value: "budget-desc", label: "Job budget: high → low" },
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
        ) : bids.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-6 py-12 text-center dark:border-gray-700 dark:bg-gray-900/40">
            <PiBriefcaseDuotone className="mx-auto text-slate-400" size={40} aria-hidden />
            <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">No bids yet.</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Browse open jobs and submit a proposal — it will show up here.
            </p>
            <Link
              to="/dashboard/jobs"
              className="mt-4 inline-block text-sm font-medium text-[#26b69c] underline"
            >
              Browse open jobs
            </Link>
          </div>
        ) : filteredBids.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-6 py-10 text-center dark:border-gray-700 dark:bg-gray-900/40">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No bids match your filters.</p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("ACTIVE");
                setSortBy("newest");
              }}
              className="mt-3 text-sm font-medium text-[#26b69c] underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredBids.map((bid) => {
              const j = bid.job || {};
              return (
                <li
                  key={bid.id}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="min-h-0 flex-1">
                    <h2 className="line-clamp-2 text-base font-semibold text-slate-900 dark:text-white">
                      {j.title || "Untitled project"}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {bid.message}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-gray-800">
                    <div className="flex flex-col gap-0.5">
                      <RichLabel>Your bid</RichLabel>
                      <RichPrice value={bid.amount} />
                    </div>
                    <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
                      <BidStatusBadge status={bid.status} />
                      {j.status ? <StatusBadge status={j.status} /> : null}
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => openDrawer(bid.id)}
                      className="w-full rounded-xl border border-slate-300 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50 dark:border-gray-600 dark:text-slate-200 dark:hover:bg-gray-900"
                    >
                      Details
                    </button>
                  </div>
                </li>
              );
            })}
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
            aria-labelledby="bid-drawer-title"
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-gray-800">
              <div className="min-w-0">
                <RichLabel>Bid details</RichLabel>
                <h2 id="bid-drawer-title" className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                  {job?.title || "Loading…"}
                </h2>
                {detail ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <BidStatusBadge status={detail.status} />
                    {job?.status ? <StatusBadge status={job.status} /> : null}
                    <ProjectImagesButton job={job} />
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
              ) : detail && job ? (
                <div className="space-y-6">
                  <div className="rounded-xl border border-[#26b69c]/25 bg-[#26b69c]/[0.06] p-4 dark:bg-[#26b69c]/10">
                    <RichLabel>Your proposal</RichLabel>
                    <p className="mt-2 flex flex-wrap items-center gap-2">
                      <RichPrice value={detail.amount} />
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Submitted{" "}
                        {new Date(detail.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      {detail.message}
                    </p>
                    {detail.status === "ACCEPTED" ? (
                      <Link
                        to="/dashboard/contracts"
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#26b69c] hover:underline"
                      >
                        <PiHandshakeDuotone size={18} aria-hidden />
                        View contract
                      </Link>
                    ) : null}
                    {detail.status === "REJECTED" ? (
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        This proposal was not selected. You can apply to other open jobs.
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-start gap-6">
                    <div>
                      <div className="mb-1 flex items-center gap-1.5">
                        <PiCurrencyCircleDollarDuotone className="shrink-0 text-emerald-600" size={14} aria-hidden />
                        <RichLabel>Listed budget</RichLabel>
                      </div>
                      <RichPrice value={job.budget} />
                    </div>
                    <div>
                      <div className="mb-1 flex items-center gap-1.5">
                        <PiCalendarBlankDuotone className="shrink-0 text-fuchsia-500" size={14} aria-hidden />
                        <RichLabel>Posted</RichLabel>
                      </div>
                      <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        {new Date(job.createdAt).toLocaleDateString(undefined, {
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
                        <img
                          src={avatarUrl}
                          alt=""
                          className="h-8 w-8 rounded-full border border-slate-200 object-cover dark:border-gray-700"
                        />
                      ) : (
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-slate-300 bg-slate-100 text-xs font-semibold text-slate-500 dark:border-gray-600 dark:bg-gray-800">
                          {clientName.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                      <span>{clientName}</span>
                    </p>
                  </div>

                  <div>
                    <RichLabel>Overview</RichLabel>
                    <div className="mt-2">
                      <ProseRichText text={job.description} />
                    </div>
                  </div>

                  {job.requirements ? (
                    <div>
                      <RichLabel>Requirements</RichLabel>
                      <div className="mt-2">
                        <BulletRichText text={job.requirements} />
                      </div>
                    </div>
                  ) : null}

                  {job.paymentNotes ? (
                    <div>
                      <RichLabel>Payment</RichLabel>
                      <div className="mt-2">
                        <BulletRichText text={job.paymentNotes} />
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
                                onClick={() => setExpandedMilestoneIndex((cur) => (cur === i ? null : i))}
                                className="flex w-full items-center justify-between gap-2 bg-slate-50/90 px-3 py-3 text-left dark:bg-gray-900/80"
                              >
                                <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                                  {m.title || `Milestone ${i + 1}`}
                                </span>
                                <PiCaretDown
                                  className={`shrink-0 transition ${open ? "rotate-180" : ""}`}
                                  size={18}
                                />
                              </button>
                              {open ? (
                                <div className="border-t border-slate-100 px-3 py-3 dark:border-gray-800">
                                  <MilestoneDetailPanel milestone={m} emptyText="No details." />
                                </div>
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </FreelancerOnly>
  );
}
