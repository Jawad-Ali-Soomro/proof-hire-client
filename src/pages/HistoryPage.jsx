import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  PiCalendarBlankDuotone,
  PiCaretDown,
  PiCheck,
  PiCurrencyCircleDollarDuotone,
  PiFunnelDuotone,
  PiHandshakeDuotone,
  PiListChecksDuotone,
  PiMagnifyingGlassDuotone,
  PiProhibitDuotone,
  PiX,
} from "react-icons/pi";
import {
  buildClosure,
  ContractCard,
  ContractDetailDrawer,
  HistoryListingCard,
  partyName,
} from "../components/contracts/ContractExperience.jsx";
import {
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

function HistoryJobDrawer({ open, onClose, job, loading, error }) {
  const milestones = parseMilestones(job?.milestones);
  const [expandedMilestoneIndex, setExpandedMilestoneIndex] = useState(null);

  useEffect(() => {
    if (!open) setExpandedMilestoneIndex(null);
  }, [open, job?.id]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        aria-label="Close drawer"
        onClick={onClose}
      />
      <div
        className="relative flex h-full w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-gray-800">
          <div className="min-w-0">
            <RichLabel>Cancelled listing</RichLabel>
            <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {job?.title || "Loading…"}
            </h2>
            {job ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge status="CANCELLED" />
                <ProjectImagesButton job={job} title={job.title} />
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-800"
            aria-label="Close"
          >
            <PiX size={22} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {loading && !job ? (
            <div className="h-24 animate-pulse rounded-lg bg-slate-100 dark:bg-gray-800/80" />
          ) : error ? (
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
          ) : job ? (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-6">
                <div>
                  <div className="mb-1 flex items-center gap-1.5">
                    <PiCurrencyCircleDollarDuotone className="text-emerald-600" size={14} aria-hidden />
                    <RichLabel>Budget</RichLabel>
                  </div>
                  <RichPrice value={job.budget} />
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-1.5">
                    <PiCalendarBlankDuotone className="text-fuchsia-500" size={14} aria-hidden />
                    <RichLabel>Cancelled</RichLabel>
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {new Date(job.updatedAt || job.createdAt).toLocaleDateString()}
                  </p>
                </div>
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
              {milestones.length ? (
                <div>
                  <div className="mb-2 flex items-center gap-1.5">
                    <PiListChecksDuotone className="text-indigo-500" size={14} aria-hidden />
                    <RichLabel>Milestones</RichLabel>
                  </div>
                  <ul className="space-y-2">
                    {milestones.map((m, idx) => {
                      const open = expandedMilestoneIndex === idx;
                      return (
                        <li
                          key={m.title || idx}
                          className="overflow-hidden rounded-xl border border-slate-200 dark:border-gray-800"
                        >
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 bg-slate-50/90 px-3 py-3 text-left dark:bg-gray-900/80"
                            onClick={() => setExpandedMilestoneIndex(open ? null : idx)}
                          >
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-slate-300 bg-white dark:border-gray-600 dark:bg-gray-800" />
                            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900 dark:text-white">
                              {m.title}
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
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/50 dark:bg-rose-950/30">
                <p className="flex items-center gap-2 text-sm font-medium text-rose-800 dark:text-rose-300">
                  <PiProhibitDuotone size={18} aria-hidden />
                  This listing was cancelled and is kept here for your records.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const { user } = useAuth();
  const isClient = user?.role === "CLIENT";
  const isFreelancer = user?.role === "FREELANCER";

  const [items, setItems] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("contract");
  const [drawerContractId, setDrawerContractId] = useState(null);
  const [completedAt, setCompletedAt] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [expandedMilestoneIndex, setExpandedMilestoneIndex] = useState(null);

  const [jobDrawerOpen, setJobDrawerOpen] = useState(false);
  const [jobDetail, setJobDetail] = useState(null);
  const [jobDetailLoading, setJobDetailLoading] = useState(false);
  const [jobDetailError, setJobDetailError] = useState("");

  const loadList = useCallback(async () => {
    setListLoading(true);
    setListError("");
    try {
      const data = await apiRequest("/contracts/history/projects", { token: getStoredToken() });
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setItems([]);
      setListError(e instanceof Error ? e.message : "Could not load project history");
    } finally {
      setListLoading(false);
    }
  }, []);

  const loadContractDetail = useCallback(async (contractId) => {
    if (!contractId) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    setDetailError("");
    try {
      const data = await apiRequest(`/contracts/${contractId}`, { token: getStoredToken() });
      setDetail(data);
    } catch (e) {
      setDetail(null);
      setDetailError(e instanceof Error ? e.message : "Could not load contract");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const loadJobDetail = useCallback(async (jobId) => {
    if (!jobId) {
      setJobDetail(null);
      return;
    }
    setJobDetailLoading(true);
    setJobDetailError("");
    try {
      const data = await apiRequest(`/jobs/${jobId}`, { token: getStoredToken() });
      setJobDetail(data);
    } catch (e) {
      setJobDetail(null);
      setJobDetailError(e instanceof Error ? e.message : "Could not load project");
    } finally {
      setJobDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    if (!drawerOpen || drawerMode !== "contract" || !drawerContractId) return;
    loadContractDetail(drawerContractId);
  }, [drawerOpen, drawerMode, drawerContractId, loadContractDetail]);

  useEffect(() => {
    setExpandedMilestoneIndex(null);
  }, [drawerContractId]);

  useEffect(() => {
    if (!drawerOpen && !jobDrawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen, jobDrawerOpen]);

  const filteredItems = useMemo(() => {
    let list = [...items];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((item) => {
        const title = String(item.job?.title || item.title || "").toLowerCase();
        const desc = String(item.job?.description || item.description || "").toLowerCase();
        return title.includes(q) || desc.includes(q);
      });
    }
    if (kindFilter !== "ALL") {
      list = list.filter((item) => item.historyKind === kindFilter);
    }
    if (sortBy === "budget-desc") {
      list.sort(
        (a, b) =>
          Number(b.acceptedBidAmount ?? b.job?.budget ?? 0) -
          Number(a.acceptedBidAmount ?? a.job?.budget ?? 0),
      );
    } else if (sortBy === "budget-asc") {
      list.sort(
        (a, b) =>
          Number(a.acceptedBidAmount ?? a.job?.budget ?? 0) -
          Number(b.acceptedBidAmount ?? b.job?.budget ?? 0),
      );
    } else {
      list.sort(
        (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
      );
    }
    return list;
  }, [items, search, kindFilter, sortBy]);

  const openContractDrawer = (item) => {
    setDrawerMode("contract");
    setDrawerContractId(item.id);
    setCompletedAt(item.completedAt ?? null);
    setDrawerOpen(true);
    setJobDrawerOpen(false);
  };

  const openCancelledDrawer = (item) => {
    setJobDrawerOpen(true);
    setDrawerOpen(false);
    void loadJobDetail(item.jobId);
  };

  const closeContractDrawer = () => {
    setDrawerOpen(false);
    setDrawerContractId(null);
    setCompletedAt(null);
    setDetail(null);
    setDetailError("");
  };

  const closeJobDrawer = () => {
    setJobDrawerOpen(false);
    setJobDetail(null);
    setJobDetailError("");
  };

  const counterparty = detail
    ? isClient
      ? detail.freelancer
      : detail.client
    : null;
  const counterpartyName = partyName(counterparty);
  const milestones = Array.isArray(detail?.milestones) ? detail.milestones : [];
  const progress = detail?.progress ?? { completed: 0, total: 0, allDone: true };
  const closure = buildClosure(detail);

  const itemSubtitle = (item) => {
    const when = item.completedAt
      ? new Date(item.completedAt).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "";
    if (item.historyKind === "CANCELLED") {
      return when ? `Cancelled ${when}` : "Cancelled listing";
    }
    return when
      ? `Completed ${when} · ${partyName(item.client)} & ${partyName(item.freelancer)}`
      : undefined;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Project history</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          {isClient
            ? "Completed contracts and cancelled listings from Track projects."
            : "Finished contracts after payment was confirmed by both sides."}
        </p>
      </div>

      {!listLoading && !listError && items.length > 0 ? (
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
              placeholder="Search by title or description…"
              className="w-full min-w-[400px] rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#26b69c] dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-[#26b69c]"
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
                value={kindFilter}
                onChange={setKindFilter}
                options={[
                  { value: "ALL", label: "All history" },
                  { value: "COMPLETED", label: "Completed" },
                  ...(isClient ? [{ value: "CANCELLED", label: "Cancelled" }] : []),
                ]}
                placeholder="Type"
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
                  { value: "budget-desc", label: "Budget: high → low" },
                  { value: "budget-asc", label: "Budget: low → high" },
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
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-6 py-12 text-center dark:border-gray-700 dark:bg-gray-900/40">
          <PiHandshakeDuotone className="mx-auto text-slate-400" size={40} aria-hidden />
          <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">No history yet.</p>
          <Link
            to="/dashboard/contracts"
            className="mt-4 inline-block text-sm font-medium text-[#26b69c] underline"
          >
            View active contracts
          </Link>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-6 py-10 text-center dark:border-gray-700 dark:bg-gray-900/40">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No items match your filters.</p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setKindFilter("ALL");
              setSortBy("newest");
            }}
            className="mt-3 text-sm font-medium text-[#26b69c] underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) =>
            item.historyKind === "CANCELLED" ? (
              <HistoryListingCard
                key={`cancelled-${item.jobId}`}
                item={item}
                onOpenDetails={() => openCancelledDrawer(item)}
                subtitle={itemSubtitle(item)}
              />
            ) : (
              <ContractCard
                key={`contract-${item.id}`}
                contract={item}
                isClient={isClient}
                onOpenDetails={() => openContractDrawer(item)}
                subtitle={itemSubtitle(item)}
              />
            ),
          )}
        </ul>
      )}

      <ContractDetailDrawer
        open={drawerOpen}
        onClose={closeContractDrawer}
        sectionLabel="Project details"
        detail={detail}
        detailLoading={detailLoading}
        detailError={detailError}
        actionError=""
        isClient={isClient}
        isFreelancer={isFreelancer}
        counterparty={counterparty}
        counterpartyName={counterpartyName}
        milestones={milestones}
        progress={progress}
        closure={closure}
        expandedMilestoneIndex={expandedMilestoneIndex}
        setExpandedMilestoneIndex={setExpandedMilestoneIndex}
        busyMilestoneIndex={null}
        canStart={false}
        startBusy={false}
        onStartContract={() => {}}
        contractActive={false}
        notStarted={false}
        showMarkCompleteButton={false}
        markCompleteDisabled
        closureBusy={false}
        onMarkComplete={() => {}}
        myMarkedComplete={true}
        milestonesReady={true}
        canSendPayment={false}
        canReceivePayment={false}
        showPaymentActions={false}
        onPaymentSent={() => {}}
        onPaymentReceived={() => {}}
        readOnlyHistory
        completedAt={completedAt}
      />

      <HistoryJobDrawer
        open={jobDrawerOpen}
        onClose={closeJobDrawer}
        job={jobDetail}
        loading={jobDetailLoading}
        error={jobDetailError}
      />
    </div>
  );
}
