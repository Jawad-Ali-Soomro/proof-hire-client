import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  PiCalendarBlankDuotone,
  PiCaretDown,
  PiCaretLeft,
  PiPencilSimpleLineDuotone,
  PiCheck,
  PiCurrencyCircleDollarDuotone,
  PiHandshakeDuotone,
  PiListChecksDuotone,
  PiSealCheckDuotone,
  PiUsersThreeDuotone,
  PiWalletDuotone,
} from "react-icons/pi";
import {
  buildClosure,
  MilestoneProgressBar,
  milestoneCompleteGateHint,
  partyName,
} from "../../components/contracts/ContractExperience.jsx";
import {
  BidStatusBadge,
  BulletRichText,
  ProseRichText,
  ContractStatusBadge,
  MilestoneStatusBadge,
  parseMilestones,
  RichLabel,
  RichPrice,
  StatusBadge,
} from "../../components/jobs/JobShellUi.jsx";
import { MilestoneDetailPanel, ProjectLinksList, ProjectMediaBar } from "../../components/jobs/ProjectMedia.jsx";
import { apiRequest, getStoredToken } from "../../lib/api.js";
import { collectJobLinkEntries } from "../../lib/jobMedia.js";
import ClientOnly from "./ClientOnly.jsx";

export default function ClientProjectDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyBidId, setBusyBidId] = useState(null);
  const [contractBusy, setContractBusy] = useState(false);
  const [expandedMilestoneIndex, setExpandedMilestoneIndex] = useState(null);
  const [expandedContractMilestoneIndex, setExpandedContractMilestoneIndex] = useState(null);

  const load = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest(`/jobs/${jobId}`, { token: getStoredToken() });
      setJob(data);
    } catch (e) {
      setJob(null);
      setError(e instanceof Error ? e.message : "Could not load project");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setExpandedMilestoneIndex(null);
  }, [jobId]);

  const setBid = async (bidId, status) => {
    setBusyBidId(bidId);
    setError("");
    try {
      await apiRequest(`/jobs/bids/${bidId}`, {
        method: "PATCH",
        token: getStoredToken(),
        body: { status },
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update bid");
    } finally {
      setBusyBidId(null);
    }
  };

  const milestones = parseMilestones(job?.milestones);
  const projectLinkEntries = job ? collectJobLinkEntries(job) : [];
  const pendingCount = job?.bids?.filter((b) => b.status === "PENDING").length ?? 0;
  const contract = job?.contract ?? null;
  const contractClosure = contract ? buildClosure(contract) : null;
  const contractProgress = contract?.progress ?? { completed: 0, total: 0, allDone: false };
  const contractMilestones = Array.isArray(contract?.milestones) ? contract.milestones : [];
  const hiredFreelancer = contract?.freelancer;
  const hiredName = hiredFreelancer ? partyName(hiredFreelancer) : null;
  const canEditProject = job?.status === "OPEN" && !contract;

  const contractNotStarted = contract?.status === "PENDING_START";
  const contractInClosure =
    contract &&
    !contractClosure?.finalized &&
    !contractNotStarted &&
    contract.status !== "TERMINATED";
  const milestonesReady = contractProgress.total === 0 || contractProgress.allDone;
  const showMarkComplete =
    contractInClosure && !contractClosure.clientMarkedComplete;
  const canSendPayment =
    contractInClosure && contractClosure.bothMarkedComplete && !contractClosure.clientPaymentSent;

  const runContractAction = async (path, method = "POST") => {
    if (!contract?.id) return;
    setContractBusy(true);
    setError("");
    try {
      await apiRequest(`/contracts/${contract.id}${path}`, {
        method,
        token: getStoredToken(),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Contract action failed");
    } finally {
      setContractBusy(false);
    }
  };

  return (
    <ClientOnly>
      <div className="mx-auto w-full">
        <Link
          to="/dashboard/client/projects"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#26b69c] transition hover:underline"
        >
          <PiCaretLeft size={18} aria-hidden />
          Back to projects
        </Link>

        {loading ? (
          <div className="mt-8 space-y-4">
            <div className="h-10 w-2/3 max-w-md animate-pulse rounded-lg bg-slate-100 dark:bg-gray-800" />
            <div className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-slate-50 dark:border-gray-800 dark:bg-gray-900/50" />
            <div className="h-64 animate-pulse rounded-2xl bg-slate-100 dark:bg-gray-800/50" />
          </div>
        ) : !job ? (
          <p className="mt-10 text-sm font-medium text-red-600 dark:text-red-400">{error || "Not found"}</p>
        ) : (
          <div className="mt-6 space-y-8">
            <header className="rounded-2xl p-5 sm:p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#26b69c]">Project</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">{job.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusBadge status={job.status} />
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:bg-gray-800 dark:text-slate-400">
                  {job.bids?.length ?? 0} applicant{(job.bids?.length ?? 0) === 1 ? "" : "s"}
                </span>
                {pendingCount > 0 ? (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                    {pendingCount} pending review
                  </span>
                ) : null}
                <ProjectMediaBar job={job} className="w-full sm:w-auto" />
              </div>
              <div className="mt-5 flex flex-wrap gap-8">
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
                    <RichLabel>Posted</RichLabel>
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {new Date(job.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {contract?.freelancer?.id ? (
                  <Link
                    to={`/dashboard/messages/${contract.freelancer.id}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-violet-300/60 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-900 transition hover:bg-violet-500/15 dark:text-violet-200"
                  >
                    Message freelancer
                  </Link>
                ) : null}
                {canEditProject ? (
                  <Link
                    to={`/dashboard/client/projects/${job.id}/edit`}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#26b69c]/40 bg-[#26b69c]/10 px-4 py-2 text-sm font-semibold text-[#156b59] transition hover:bg-[#26b69c]/15 dark:text-[#56d9c0]"
                  >
                    <PiPencilSimpleLineDuotone size={18} aria-hidden />
                    Edit project
                  </Link>
                ) : null}
                {contract ? (
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/dashboard/contracts", { state: { openContractId: contract.id } })
                    }
                    className="rounded-xl capitalize border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50 dark:border-gray-600 dark:text-slate-200 dark:hover:bg-gray-900"
                  >
                    Open contract workspace
                  </button>
                ) : null}
              </div>
            </header>

            {contract ? (
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-gray-800">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <PiHandshakeDuotone className="text-[#26b69c]" size={18} aria-hidden />
                      <RichLabel>Active contract</RichLabel>
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      {hiredName ? (
                        <>
                          Working with{" "}
                          {hiredFreelancer?.id ? (
                            <Link
                              to={`/dashboard/freelancers/${hiredFreelancer.id}`}
                              className="font-semibold text-[#26b69c] hover:underline"
                            >
                              {hiredName}
                            </Link>
                          ) : (
                            <span className="font-semibold text-slate-900 dark:text-white">{hiredName}</span>
                          )}
                        </>
                      ) : (
                        "Freelancer assigned"
                      )}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <ContractStatusBadge status={contract.status} />
                      <RichPrice value={contract.acceptedBidAmount ?? job.budget} size="sm" />
                    </div>
                  </div>
                  {contractProgress.total > 0 ? (
                    <div className="min-w-[200px] flex-1 sm:max-w-xs">
                      <MilestoneProgressBar
                        completed={contractProgress.completed}
                        total={contractProgress.total}
                      />
                    </div>
                  ) : null}
                </div>

                {contractMilestones.length ? (
                  <div className="mt-6">
                    <RichLabel>Contract milestones (freelancer progress)</RichLabel>
                    <ul className="mt-3 space-y-2" role="list">
                      {contractMilestones.map((m) => {
                        const open = expandedContractMilestoneIndex === m.index;
                        return (
                          <li
                            key={m.index}
                            className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50 dark:border-gray-800 dark:bg-gray-900/40"
                          >
                            <button
                              type="button"
                              aria-expanded={open}
                              onClick={() =>
                                setExpandedContractMilestoneIndex((cur) =>
                                  cur === m.index ? null : m.index,
                                )
                              }
                              className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left hover:bg-slate-100/80 dark:hover:bg-gray-800/80"
                            >
                              <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                                {m.title}
                              </span>
                              <span className="flex shrink-0 items-center gap-2">
                                <MilestoneStatusBadge status={m.status} />
                                <PiCaretDown
                                  className={`text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
                                  size={18}
                                />
                              </span>
                            </button>
                            {open ? (
                              <div className="border-t border-slate-200 px-4 py-3 dark:border-gray-800">
                                {m.description ? (
                                  <BulletRichText text={m.description} />
                                ) : (
                                  <p className="text-sm italic text-slate-500">No details.</p>
                                )}
                              </div>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}

                {!contractClosure?.finalized ? (
                  <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                    <div className="mb-3 flex items-center gap-1.5">
                      <PiSealCheckDuotone className="text-[#26b69c]" size={16} aria-hidden />
                      <RichLabel>Close contract (client)</RichLabel>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <li className="flex items-center gap-2">
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full text-white ${contractClosure.clientMarkedComplete ? "bg-emerald-500" : "bg-slate-300 dark:bg-gray-600"}`}
                        >
                          {contractClosure.clientMarkedComplete ? <PiCheck size={12} /> : null}
                        </span>
                        You marked complete
                      </li>
                      <li className="flex items-center gap-2">
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full text-white ${contractClosure.freelancerMarkedComplete ? "bg-emerald-500" : "bg-slate-300 dark:bg-gray-600"}`}
                        >
                          {contractClosure.freelancerMarkedComplete ? <PiCheck size={12} /> : null}
                        </span>
                        Freelancer marked complete
                      </li>
                      <li className="flex items-center gap-2 border-t border-slate-200 pt-2 dark:border-gray-700">
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full text-white ${contractClosure.clientPaymentSent ? "bg-emerald-500" : "bg-slate-300 dark:bg-gray-600"}`}
                        >
                          {contractClosure.clientPaymentSent ? <PiCheck size={12} /> : null}
                        </span>
                        You sent payment
                      </li>
                      <li className="flex items-center gap-2">
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full text-white ${contractClosure.freelancerPaymentReceived ? "bg-emerald-500" : "bg-slate-300 dark:bg-gray-600"}`}
                        >
                          {contractClosure.freelancerPaymentReceived ? <PiCheck size={12} /> : null}
                        </span>
                        Freelancer confirmed payment
                      </li>
                    </ul>

                    {contractNotStarted ? (
                      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                        Waiting for the freelancer to start the contract.
                      </p>
                    ) : null}

                    {showMarkComplete ? (
                      <>
                        <button
                          type="button"
                          disabled={contractBusy || !milestonesReady}
                          onClick={() => void runContractAction("/mark-complete")}
                          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#26b69c] bg-[#26b69c]/10 py-2.5 text-sm font-semibold text-[#156b59] disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#56d9c0]"
                        >
                          <PiSealCheckDuotone size={18} aria-hidden />
                          {contractBusy ? "Saving…" : "Mark contract complete"}
                        </button>
                        {!milestonesReady ? (
                          <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                            {milestoneCompleteGateHint({
                              isClient: true,
                              isFreelancer: false,
                              progress: contractProgress,
                            })}
                          </p>
                        ) : null}
                      </>
                    ) : null}

                    {contractClosure.clientMarkedComplete && !contractClosure.bothMarkedComplete ? (
                      <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                        You marked this complete. Waiting for the freelancer to confirm.
                      </p>
                    ) : null}

                    {canSendPayment ? (
                      <button
                        type="button"
                        disabled={contractBusy}
                        onClick={() => void runContractAction("/payment/sent")}
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#26b69c] py-2.5 text-sm font-semibold text-white hover:brightness-105 disabled:opacity-50"
                      >
                        <PiWalletDuotone size={18} aria-hidden />
                        {contractBusy ? "Saving…" : "Confirm payment sent"}
                      </button>
                    ) : null}

                    {contractClosure.clientPaymentSent && !contractClosure.freelancerPaymentReceived ? (
                      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                        Payment recorded. Waiting for the freelancer to confirm receipt.
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-6 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    Contract finalized — see History for the completed record.
                  </p>
                )}
              </section>
            ) : null}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="border-b border-slate-200 px-5 py-4 dark:border-gray-800 sm:px-6">
                <RichLabel>Project brief</RichLabel>
              </div>
              <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-2 xl:grid-cols-3">
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
                {projectLinkEntries.length ? (
                  <div className="lg:col-span-2 xl:col-span-3">
                    <RichLabel>Reference links</RichLabel>
                    <div className="mt-2">
                      <ProjectLinksList
                        links={projectLinkEntries}
                        showScope={projectLinkEntries.some((l) => l.scope && l.scope !== "Project")}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </section>

            {milestones.length ? (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
                <div className="mb-4 flex items-center gap-1.5">
                  <PiListChecksDuotone className="text-indigo-500" size={18} aria-hidden />
                  <RichLabel>Milestones</RichLabel>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">({milestones.length})</span>
                </div>
                <ul className="space-y-2" role="list">
                  {milestones.map((m, i) => {
                    const open = expandedMilestoneIndex === i;
                    return (
                      <li
                        key={i}
                        className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50 dark:border-gray-800 dark:bg-gray-900/40"
                      >
                        <button
                          type="button"
                          aria-expanded={open}
                          onClick={() => setExpandedMilestoneIndex((cur) => (cur === i ? null : i))}
                          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-100/80 dark:hover:bg-gray-800/80"
                        >
                          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="shrink-0 text-sm font-semibold text-slate-500 dark:text-slate-400">
                              {i + 1}.
                            </span>
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">
                              {m.title || "Untitled"}
                            </span>
                            {m.amount != null && m.amount !== "" ? (
                              <span className="text-xs font-bold tabular-nums text-[#26b69c]">
                                ${Number(m.amount).toLocaleString()}
                              </span>
                            ) : null}
                            {m.dueDate ? (
                              <span className="text-xs text-slate-500 dark:text-slate-400">Due {m.dueDate}</span>
                            ) : null}
                          </span>
                          <PiCaretDown
                            className={`shrink-0 text-slate-500 transition-transform dark:text-slate-400 ${open ? "rotate-180" : ""}`}
                            size={18}
                            aria-hidden
                          />
                        </button>
                        {open ? (
                          <div className="border-t border-slate-200 px-4 py-3 dark:border-gray-800">
                            <MilestoneDetailPanel milestone={m} />
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-gray-800 sm:px-6">
                <div className="flex items-center gap-1.5">
                  <PiUsersThreeDuotone className="text-violet-500" size={18} aria-hidden />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Applicants</h2>
                </div>
                {job.status !== "OPEN" ? (
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Not accepting new approvals
                  </p>
                ) : null}
              </div>

              {error ? (
                <p className="border-b border-slate-100 px-5 py-3 text-sm font-medium text-red-600 dark:border-gray-800 dark:text-red-400 sm:px-6">
                  {error}
                </p>
              ) : null}

              {!job.bids?.length ? (
                <p className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400 sm:px-6">
                  No bids yet. Share your listing to attract freelancers.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:border-gray-800 dark:bg-gray-900/80 dark:text-slate-400">
                      <tr>
                        <th className="px-5 py-3 sm:px-6">Freelancer</th>
                        <th className="px-5 py-3">Bid</th>
                        <th className="px-5 py-3">Message</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3 text-right sm:px-6">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {job.bids.map((bid) => {
                        const name = bid.freelancer?.profile?.fullName || bid.freelancer?.username || "User";
                        const pending = bid.status === "PENDING";
                        const freelancerId = bid.freelancer?.id;
                        return (
                          <tr
                            key={bid.id}
                            className={`border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/80 dark:border-gray-800 dark:hover:bg-gray-900/60 ${
                              bid.status === "ACCEPTED"
                                ? "bg-emerald-50/50 dark:bg-emerald-950/20"
                                : ""
                            }`}
                          >
                            <td className="px-5 py-4 sm:px-6">
                              <div className="flex items-center gap-3">
                                {bid.freelancer?.profile?.avatar ? (
                                  <img
                                    src={bid.freelancer.profile.avatar}
                                    alt=""
                                    className="h-10 w-10 rounded-full border border-slate-200 object-cover dark:border-gray-700"
                                  />
                                ) : (
                                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-slate-300 bg-slate-100 text-sm font-semibold text-slate-500 dark:border-gray-600 dark:bg-gray-800">
                                    {name.slice(0, 1).toUpperCase()}
                                  </span>
                                )}
                                <div className="min-w-0">
                                  {freelancerId ? (
                                    <Link
                                      to={`/dashboard/freelancers/${freelancerId}`}
                                      className="font-semibold text-slate-900 hover:text-[#26b69c] dark:text-white"
                                    >
                                      {name}
                                    </Link>
                                  ) : (
                                    <span className="font-semibold text-slate-900 dark:text-white">{name}</span>
                                  )}
                                  <p className="text-xs text-slate-500 dark:text-slate-400">@{bid.freelancer?.username}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <RichPrice value={bid.amount} size="sm" />
                            </td>
                            <td className="max-w-xs px-5 py-4 text-slate-600 dark:text-slate-400">
                              <p className="line-clamp-4 whitespace-pre-wrap leading-relaxed">{bid.message}</p>
                            </td>
                            <td className="px-5 py-4">
                              <BidStatusBadge status={bid.status} />
                            </td>
                            <td className="px-5 py-4 text-right sm:px-6">
                              {pending ? (
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    disabled={busyBidId === bid.id || job.status !== "OPEN"}
                                    onClick={() => setBid(bid.id, "ACCEPTED")}
                                    className="rounded-xl bg-[#26b69c] px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:opacity-90 disabled:opacity-40"
                                  >
                                    {busyBidId === bid.id ? "…" : "Approve"}
                                  </button>
                                  <button
                                    type="button"
                                    disabled={busyBidId === bid.id}
                                    onClick={() => setBid(bid.id, "REJECTED")}
                                    className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-40 dark:border-red-900/60 dark:bg-gray-900 dark:text-red-400 dark:hover:bg-red-950/30"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </ClientOnly>
  );
}
