import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  PiCalendarBlankDuotone,
  PiCaretDown,
  PiCheck,
  PiCurrencyCircleDollarDuotone,
  PiFunnelDuotone,
  PiHandshakeDuotone,
  PiListChecksDuotone,
  PiMagnifyingGlassDuotone,
  PiPlayDuotone,
  PiSealCheckDuotone,
  PiUserDuotone,
  PiWalletDuotone,
  PiX,
} from "react-icons/pi";
import {
  BulletRichText,
  ProseRichText,
  ContractStatusBadge,
  MilestoneStatusBadge,
  RichLabel,
  RichPrice,
  statusLabel,
} from "../components/jobs/JobShellUi.jsx";
import { MilestoneDetailPanel, ProjectImagesButton } from "../components/jobs/ProjectMedia.jsx";
import {
  ContractCard,
  milestoneCompleteGateHint,
  partyName as contractPartyName,
} from "../components/contracts/ContractExperience.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest, getStoredToken } from "../lib/api.js";
import DropdownSelect from "../components/ui/DropdownSelect.jsx";

function partyName(user) {
  return contractPartyName(user);
}

/** Normalize closure flags from API (nested `closure` or top-level fields). */
function buildClosure(detail) {
  if (!detail) {
    return {
      clientMarkedComplete: false,
      freelancerMarkedComplete: false,
      clientPaymentSent: false,
      freelancerPaymentReceived: false,
      bothMarkedComplete: false,
      awaitingPayment: false,
      bothPaymentConfirmed: false,
      finalized: false,
    };
  }
  const nested = detail.closure ?? {};
  const clientMarkedComplete = Boolean(
    nested.clientMarkedComplete ?? detail.clientMarkedComplete,
  );
  const freelancerMarkedComplete = Boolean(
    nested.freelancerMarkedComplete ?? detail.freelancerMarkedComplete,
  );
  const clientPaymentSent = Boolean(nested.clientPaymentSent ?? detail.clientPaymentSent);
  const freelancerPaymentReceived = Boolean(
    nested.freelancerPaymentReceived ?? detail.freelancerPaymentReceived,
  );
  const bothMarkedComplete =
    nested.bothMarkedComplete ?? (clientMarkedComplete && freelancerMarkedComplete);
  const bothPaymentConfirmed =
    nested.bothPaymentConfirmed ?? (clientPaymentSent && freelancerPaymentReceived);
  const finalized = Boolean(nested.finalized ?? detail.completedProject?.id);
  return {
    clientMarkedComplete,
    freelancerMarkedComplete,
    clientPaymentSent,
    freelancerPaymentReceived,
    bothMarkedComplete,
    awaitingPayment: bothMarkedComplete && !bothPaymentConfirmed,
    bothPaymentConfirmed,
    finalized,
  };
}

function MilestoneProgressBar({ completed, total }) {
  if (!total || total <= 0) return null;
  const safeCompleted = Math.min(Math.max(0, completed), total);
  const pct = Math.round((safeCompleted / total) * 100);

  return (
    <div className="mt-3">
      <div className="mb-1.5 flex items-center justify-end gap-2">
        {/* <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Milestone progress</span> */}
        <span className="text-xs font-bold tabular-nums text-[#26b69c] dark:text-[#56d9c0]">
          {safeCompleted}/{total} · {pct}%
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-gray-800"
        role="progressbar"
        aria-valuenow={safeCompleted}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${safeCompleted} of ${total} milestones completed`}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#26b69c] to-teal-400 transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ContractPartyAvatar({ user, roleLabel }) {
  const name = partyName(user);
  const rawAvatar = user?.profile?.avatar;
  const avatarUrl = rawAvatar == null ? "" : String(rawAvatar).trim();
  return (
    <div className="flex min-w-0 flex flex-col items-center gap-1 text-center">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          className="h-12 w-12 rounded-full border-2 border-white object-cover shadow-sm ring-1 ring-slate-200 dark:border-gray-900 dark:ring-gray-700"
        />
      ) : (
        <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-sm font-bold text-slate-600 shadow-sm ring-1 ring-slate-200 dark:border-gray-900 dark:bg-gray-800 dark:text-slate-300 dark:ring-gray-700">
          {name.slice(0, 1).toUpperCase()}
        </span>
      )}
    </div>
  );
}

export default function ContractsPage() {
  const { user } = useAuth();
  const isClient = user?.role === "CLIENT";
  const isFreelancer = user?.role === "FREELANCER";

  const [contracts, setContracts] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerContractId, setDrawerContractId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyMilestoneIndex, setBusyMilestoneIndex] = useState(null);
  const [startBusy, setStartBusy] = useState(false);
  const [closureBusy, setClosureBusy] = useState(false);
  const [expandedMilestoneIndex, setExpandedMilestoneIndex] = useState(null);

  const loadList = useCallback(async () => {
    setListLoading(true);
    setListError("");
    try {
      const data = await apiRequest("/contracts", { token: getStoredToken() });
      const list = Array.isArray(data) ? data : [];
      setContracts(
        list.filter((c) => !c?.closure?.finalized && !c?.completedProject?.id),
      );
    } catch (e) {
      setContracts([]);
      setListError(e instanceof Error ? e.message : "Could not load contracts");
    } finally {
      setListLoading(false);
    }
  }, []);

  const loadDetail = useCallback(async (contractId) => {
    if (!contractId) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    setDetailError("");
    setActionError("");
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

  useEffect(() => {
    loadList();
  }, [loadList]);

  const location = useLocation();
  useEffect(() => {
    const openId = location.state?.openContractId;
    if (openId) {
      setDrawerContractId(openId);
      setDrawerOpen(true);
    }
  }, [location.state?.openContractId]);

  useEffect(() => {
    if (!drawerOpen || !drawerContractId) return;
    loadDetail(drawerContractId);
  }, [drawerOpen, drawerContractId, loadDetail]);

  useEffect(() => {
    setExpandedMilestoneIndex(null);
  }, [drawerContractId]);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  const filteredContracts = useMemo(() => {
    let list = [...contracts];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          String(c.job?.title || "")
            .toLowerCase()
            .includes(q) ||
          String(c.job?.description || "")
            .toLowerCase()
            .includes(q),
      );
    }
    if (statusFilter !== "ALL") {
      list = list.filter((c) => c.status === statusFilter);
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
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  }, [contracts, search, statusFilter, sortBy]);

  const openDrawer = (contractId) => {
    setDrawerContractId(contractId);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerContractId(null);
    setDetail(null);
    setDetailError("");
    setActionError("");
  };

  const startContract = async () => {
    if (!detail?.id) return;
    setStartBusy(true);
    setActionError("");
    try {
      const data = await apiRequest(`/contracts/${detail.id}/start`, {
        method: "POST",
        token: getStoredToken(),
      });
      setDetail(data);
      await loadList();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not start contract");
    } finally {
      setStartBusy(false);
    }
  };

  const refreshContract = async (contractId) => {
    const data = await apiRequest(`/contracts/${contractId}`, { token: getStoredToken() });
    const finalized = Boolean(data?.closure?.finalized || data?.completedProject?.id);
    if (finalized) {
      closeDrawer();
      setDetail(null);
    } else {
      setDetail(data);
    }
    await loadList();
    return data;
  };

  const markWorkComplete = async () => {
    if (!detail?.id) return;
    setClosureBusy(true);
    setActionError("");
    try {
      await apiRequest(`/contracts/${detail.id}/mark-complete`, {
        method: "POST",
        token: getStoredToken(),
      });
      await refreshContract(detail.id);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not mark complete");
    } finally {
      setClosureBusy(false);
    }
  };

  const confirmPaymentSent = async () => {
    if (!detail?.id) return;
    setClosureBusy(true);
    setActionError("");
    try {
      await apiRequest(`/contracts/${detail.id}/payment/sent`, {
        method: "POST",
        token: getStoredToken(),
      });
      await refreshContract(detail.id);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not confirm payment");
    } finally {
      setClosureBusy(false);
    }
  };

  const confirmPaymentReceived = async () => {
    if (!detail?.id) return;
    setClosureBusy(true);
    setActionError("");
    try {
      await apiRequest(`/contracts/${detail.id}/payment/received`, {
        method: "POST",
        token: getStoredToken(),
      });
      await refreshContract(detail.id);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not confirm payment");
    } finally {
      setClosureBusy(false);
    }
  };

  const toggleMilestone = async (milestoneIndex, completed) => {
    if (!detail?.id) return;
    setBusyMilestoneIndex(milestoneIndex);
    setActionError("");
    try {
      const data = await apiRequest(`/contracts/${detail.id}/milestones/${milestoneIndex}`, {
        method: "PATCH",
        token: getStoredToken(),
        body: { completed },
      });
      setDetail(data);
      await loadList();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not update milestone");
    } finally {
      setBusyMilestoneIndex(null);
    }
  };

  const counterparty = detail
    ? isClient
      ? detail.freelancer
      : detail.client
    : null;
  const counterpartyName = partyName(counterparty);
  const milestones = Array.isArray(detail?.milestones) ? detail.milestones : [];
  const progress = detail?.progress ?? { completed: 0, total: 0, allDone: false };
  const canStart =
    isFreelancer && detail?.status === "PENDING_START" && !startBusy;
  const contractActive =
    detail?.status === "ACTIVE" || detail?.status === "COMPLETED";
  const closure = buildClosure(detail);
  const myMarkedComplete = isClient
    ? closure.clientMarkedComplete
    : isFreelancer
      ? closure.freelancerMarkedComplete
      : false;
  const milestonesReady = progress.total === 0 || progress.allDone;
  const notStarted = detail?.status === "PENDING_START";
  const inClosureWorkflow =
    Boolean(detail) && !closure.finalized && !notStarted && detail?.status !== "TERMINATED";
  const showMarkCompleteButton =
    inClosureWorkflow && (isClient || isFreelancer) && !myMarkedComplete;
  const markCompleteDisabled = !milestonesReady || closureBusy;
  const showPaymentActions = inClosureWorkflow && closure.bothMarkedComplete;
  const canSendPayment = isClient && showPaymentActions && !closure.clientPaymentSent;
  const canReceivePayment =
    isFreelancer && showPaymentActions && !closure.freelancerPaymentReceived;

  return (
    <div className="">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Contracts</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          {isClient
            ? "Active agreements with freelancers. Finished projects move to History after payment is confirmed."
            : isFreelancer
              ? "Open work only. After both sides confirm payment, the project appears under History."
              : "Your active contracts."}
        </p>
      </div>

      {!listLoading && !listError && contracts.length > 0 ? (
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
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
                options={[
                  { value: "ALL", label: "All statuses" },
                  { value: "PENDING_START", label: "Pending start" },
                  { value: "ACTIVE", label: "Active" },
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
      ) : contracts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-6 py-12 text-center dark:border-gray-700 dark:bg-gray-900/40">
          <PiHandshakeDuotone className="mx-auto text-slate-400" size={40} aria-hidden />
          <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">No contracts yet.</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {isClient
              ? "Approve a bid on one of your projects to create a contract."
              : "When a client accepts your bid, the contract will appear here."}{" "}
            <Link to="/dashboard/history" className="font-medium text-[#26b69c] underline">
              View history
            </Link>
          </p>
          {isClient ? (
            <Link
              to="/dashboard/client/projects"
              className="mt-4 inline-block text-sm font-medium text-violet-600 underline dark:text-violet-400"
            >
              Track projects
            </Link>
          ) : (
            <Link
              to="/dashboard/jobs"
              className="mt-4 inline-block text-sm font-medium text-violet-600 underline dark:text-violet-400"
            >
              Browse jobs
            </Link>
          )}
        </div>
      ) : filteredContracts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-6 py-10 text-center dark:border-gray-700 dark:bg-gray-900/40">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No contracts match your filters.</p>
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
          {filteredContracts.map((contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              isClient={isClient}
              onOpenDetails={openDrawer}
              subtitle={`${partyName(contract.client)} · ${partyName(contract.freelancer)}`}
              viewProjectHref={
                isClient && contract.jobId
                  ? `/dashboard/client/projects/${contract.jobId}`
                  : null
              }
            />
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
            className="relative flex icon h-full w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contract-drawer-title"
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-gray-800">
              <div className="min-w-0">
                <div className="mb-1">
                  <RichLabel>Contract details</RichLabel>
                </div>
                <h2 id="contract-drawer-title" className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                  {detail?.job?.title || "Loading…"}
                </h2>
                {detail ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <ContractStatusBadge status={detail.status} />
                    {progress.total > 0 ? (
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {progress.completed}/{progress.total} milestones
                      </span>
                    ) : null}
                    <ProjectImagesButton job={detail.job} />
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
                        <RichLabel>Agreed bid</RichLabel>
                      </div>
                      <RichPrice value={detail.acceptedBidAmount ?? detail.job?.budget} />
                    </div>
                    <div>
                      <div className="mb-1 flex items-center gap-1.5">
                        <PiCalendarBlankDuotone className="shrink-0 text-fuchsia-500" size={14} aria-hidden />
                        <RichLabel>Started</RichLabel>
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
                    <div className="mb-2 flex items-start gap-1.5">
                      <PiUserDuotone className="shrink-0 text-teal-600" size={14} aria-hidden />
                      <RichLabel>{isClient ? "Freelancer" : "Client"}</RichLabel>
                    </div>
                    <p className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
                      {counterparty?.profile?.avatar ? (
                        <img
                          src={counterparty.profile.avatar}
                          alt=""
                          className="h-8 w-8 rounded-full border border-slate-200 object-cover dark:border-gray-700"
                        />
                      ) : (
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-slate-300 bg-slate-100 text-xs font-semibold text-slate-500 dark:border-gray-600 dark:bg-gray-800">
                          {counterpartyName.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                      <span>{counterpartyName}</span>
                    </p>
                    {counterparty?.id ? (
                      <Link
                        to={`/dashboard/freelancers/${counterparty.id}`}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#26b69c] hover:underline"
                      >
                        View profile
                      </Link>
                    ) : null}
                  </div>

                  <div>
                    <RichLabel>Overview</RichLabel>
                    <div className="mt-2">
                      <ProseRichText text={detail.job?.description} />
                    </div>
                  </div>

                  {detail.job?.requirements ? (
                    <div>
                      <RichLabel>Requirements</RichLabel>
                      <div className="mt-2">
                        <BulletRichText text={detail.job.requirements} />
                      </div>
                    </div>
                  ) : null}

                  {detail.job?.paymentNotes ? (
                    <div>
                      <RichLabel>Payment</RichLabel>
                      <div className="mt-2">
                        <BulletRichText text={detail.job.paymentNotes} />
                      </div>
                    </div>
                  ) : null}

                  {canStart ? (
                    <button
                      type="button"
                      disabled={startBusy}
                      onClick={() => void startContract()}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-slate-200"
                    >
                      <PiPlayDuotone size={18} aria-hidden />
                      {startBusy ? "Starting…" : "Start contract"}
                    </button>
                  ) : null}

                  {milestones.length ? (
                    <div>
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <PiListChecksDuotone className="shrink-0 text-indigo-500" size={14} aria-hidden />
                          <RichLabel>Milestones</RichLabel>
                        </div>
                        {!isFreelancer ? (
                          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Read only
                          </span>
                        ) : null}
                      </div>
                      <ul className="space-y-2" role="list">
                        {milestones.map((m) => {
                          const open = expandedMilestoneIndex === m.index;
                          const done = m.status === "COMPLETED";
                          const busy = busyMilestoneIndex === m.index;
                          return (
                            <li
                              key={m.index}
                              className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900/40"
                            >
                              <div className="flex w-full items-center gap-2 bg-slate-50/90 px-3 py-3 dark:bg-gray-900/80">
                                {isFreelancer && contractActive && detail.status !== "COMPLETED" ? (
                                  <label className="flex shrink-0 cursor-pointer items-center">
                                    <input
                                      type="checkbox"
                                      checked={done}
                                      disabled={busy || !contractActive}
                                      onChange={(e) => void toggleMilestone(m.index, e.target.checked)}
                                      className="h-4 w-4 rounded border-slate-300 text-[#26b69c] focus:ring-[#26b69c] dark:border-gray-600"
                                      aria-label={`Mark ${m.title} as ${done ? "incomplete" : "complete"}`}
                                    />
                                  </label>
                                ) : (
                                  <span
                                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                                      done
                                        ? "border-emerald-500 bg-emerald-500 text-white"
                                        : "border-slate-300 bg-white dark:border-gray-600 dark:bg-gray-800"
                                    }`}
                                    aria-hidden
                                  >
                                    {done ? <PiCheck size={12} /> : null}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  aria-expanded={open}
                                  onClick={() =>
                                    setExpandedMilestoneIndex((cur) => (cur === m.index ? null : m.index))
                                  }
                                  className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left"
                                >
                                  <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                                    {m.title}
                                  </span>
                                  <span className="flex shrink-0 items-center gap-2">
                                    <MilestoneStatusBadge status={m.status} />
                                    <PiCaretDown
                                      className={`text-slate-500 transition-transform dark:text-slate-400 ${open ? "rotate-180" : ""}`}
                                      size={18}
                                      aria-hidden
                                    />
                                  </span>
                                </button>
                              </div>
                              {open ? (
                                <div className="space-y-2 border-t border-slate-100 px-3 py-3 dark:border-gray-800">
                                  <MilestoneDetailPanel milestone={m} emptyText="No details." />
                                  <div className="flex gap-2">
                                    {m.amount != null ? (
                                    <p className="flex px-5 items-center justify-center py-2 bg-green-200 text-sm dark:bg-green-800">
                                      USDT - {Number(m.amount).toLocaleString()} /=
                                    </p>
                                  ) : null}
                                  {m.dueDate ? (
                                    <p className="flex px-5 items-center justify-center py-2 bg-gray-100 text-sm dark:bg-gray-800">
                                      {m.dueDate}
                                    </p>
                                  ) : null}
                                  </div>
                                  {/* {isClient ? (
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      Status: {statusLabel(m.status)}
                                    </p>
                                  ) : null} */}
                                </div>
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                      {isFreelancer && detail.status === "PENDING_START" ? (
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          Start the contract before you can mark milestones complete.
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {!closure.finalized ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                      <div className="mb-3 flex items-center gap-1.5">
                        <PiSealCheckDuotone className="text-[#26b69c]" size={16} aria-hidden />
                        <RichLabel>Close contract</RichLabel>
                      </div>
                      <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                        <li className="flex items-center gap-2">
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full text-white ${closure.clientMarkedComplete ? "bg-emerald-500" : "bg-slate-300 dark:bg-gray-600"}`}
                            aria-hidden
                          >
                            {closure.clientMarkedComplete ? <PiCheck size={12} /> : null}
                          </span>
                          Client marked complete
                        </li>
                        <li className="flex items-center gap-2">
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full text-white ${closure.freelancerMarkedComplete ? "bg-emerald-500" : "bg-slate-300 dark:bg-gray-600"}`}
                            aria-hidden
                          >
                            {closure.freelancerMarkedComplete ? <PiCheck size={12} /> : null}
                          </span>
                          Freelancer marked complete
                        </li>
                        {closure.bothMarkedComplete ? (
                          <>
                            <li className="flex items-center gap-2 border-t border-slate-200 pt-2 dark:border-gray-700">
                              <span
                                className={`flex h-5 w-5 items-center justify-center rounded-full text-white ${closure.clientPaymentSent ? "bg-emerald-500" : "bg-slate-300 dark:bg-gray-600"}`}
                                aria-hidden
                              >
                                {closure.clientPaymentSent ? <PiCheck size={12} /> : null}
                              </span>
                              Client sent payment
                            </li>
                            <li className="flex items-center gap-2">
                              <span
                                className={`flex h-5 w-5 items-center justify-center rounded-full text-white ${closure.freelancerPaymentReceived ? "bg-emerald-500" : "bg-slate-300 dark:bg-gray-600"}`}
                                aria-hidden
                              >
                                {closure.freelancerPaymentReceived ? <PiCheck size={12} /> : null}
                              </span>
                              Freelancer received payment
                            </li>
                          </>
                        ) : null}
                      </ul>

                      {notStarted ? (
                        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                          {isFreelancer
                            ? "Start the contract above before marking work complete."
                            : "Waiting for the freelancer to start the contract."}
                        </p>
                      ) : null}

                      {showMarkCompleteButton ? (
                        <button
                          type="button"
                          disabled={markCompleteDisabled}
                          onClick={() => void markWorkComplete()}
                          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#26b69c] bg-[#26b69c]/10 py-2.5 text-sm font-semibold text-[#156b59] transition hover:bg-[#26b69c]/20 disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#56d9c0]"
                        >
                          <PiSealCheckDuotone size={18} aria-hidden />
                          {closureBusy ? "Saving…" : "Mark as complete"}
                        </button>
                      ) : null}

                      {myMarkedComplete && !closure.bothMarkedComplete ? (
                        <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                          You marked this complete. Waiting for the {isClient ? "freelancer" : "client"} to confirm.
                        </p>
                      ) : null}

                      {showMarkCompleteButton && !milestonesReady ? (
                        <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                          {milestoneCompleteGateHint({ isClient, isFreelancer, progress })}
                        </p>
                      ) : null}

                      {canSendPayment ? (
                        <button
                          type="button"
                          disabled={closureBusy}
                          onClick={() => void confirmPaymentSent()}
                          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#26b69c] py-2.5 text-sm font-semibold text-white transition hover:brightness-105 disabled:opacity-50"
                        >
                          <PiWalletDuotone size={18} aria-hidden />
                          {closureBusy ? "Saving…" : "Send payment"}
                        </button>
                      ) : null}

                      {canReceivePayment ? (
                        <button
                          type="button"
                          disabled={closureBusy}
                          onClick={() => void confirmPaymentReceived()}
                          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#26b69c] py-2.5 text-sm font-semibold text-white transition hover:brightness-105 disabled:opacity-50"
                        >
                          <PiWalletDuotone size={18} aria-hidden />
                          {closureBusy ? "Saving…" : "Received payment"}
                        </button>
                      ) : null}

                      {showPaymentActions && isClient && closure.clientPaymentSent && !closure.freelancerPaymentReceived ? (
                        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                          Payment sent. Waiting for freelancer to confirm receipt.
                        </p>
                      ) : null}

                      {showPaymentActions && isFreelancer && closure.freelancerPaymentReceived && !closure.clientPaymentSent ? (
                        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                          Payment received noted. Waiting for client to confirm payment sent.
                        </p>
                      ) : null}

                      {closure.finalized ? (
                        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-900/50 dark:bg-emerald-950/30">
                          <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                            Contract finalized. This project is in your history and profile projects.
                          </p>
                          <Link
                            to="/dashboard/history"
                            className="mt-2 inline-block text-xs font-semibold text-[#26b69c] underline"
                          >
                            View project history
                          </Link>
                        </div>
                      ) : null}
                    </div>
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
