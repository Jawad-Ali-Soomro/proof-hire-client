import { Link } from "react-router-dom";
import {
  PiCalendarBlankDuotone,
  PiCaretDown,
  PiCheck,
  PiCurrencyCircleDollarDuotone,
  PiHandshakeDuotone,
  PiListChecksDuotone,
  PiPlayDuotone,
  PiSealCheckDuotone,
  PiUserDuotone,
  PiWalletDuotone,
  PiX,
} from "react-icons/pi";
import {
  ContractStatusBadge,
  MilestoneStatusBadge,
  RichLabel,
  RichPrice,
  BulletRichText,
  ProseRichText,
  StatusBadge,
  statusLabel,
} from "../jobs/JobShellUi.jsx";
import { MilestoneDetailPanel, ProjectImagesButton } from "../jobs/ProjectMedia.jsx";

export function partyName(user) {
  return user?.profile?.fullName?.trim() || user?.username || "User";
}

/** Role-specific copy when milestones block marking the contract complete. */
export function milestoneCompleteGateHint({ isClient, isFreelancer, progress }) {
  const total = progress?.total ?? 0;
  const completed = progress?.completed ?? 0;
  if (total <= 0) return null;
  if (isFreelancer) {
    return `Complete every milestone in this contract before you can mark work done (${completed}/${total} finished).`;
  }
  if (isClient) {
    return `You can mark the contract complete after the freelancer finishes all milestones (${completed}/${total} done).`;
  }
  return null;
}

export function buildClosure(detail) {
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

export function MilestoneProgressBar({ completed, total }) {
  if (!total || total <= 0) return null;
  const safeCompleted = Math.min(Math.max(0, completed), total);
  const pct = Math.round((safeCompleted / total) * 100);

  return (
    <div className="mt-3">
      <div className="mb-1.5 flex items-center justify-end gap-2">
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

export function ContractPartyAvatar({ user }) {
  const name = partyName(user);
  const rawAvatar = user?.profile?.avatar;
  const avatarUrl = rawAvatar == null ? "" : String(rawAvatar).trim();
  return (
    <div className="flex min-w-0 flex-col items-center gap-1 text-center">
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

/** Cancelled client listing in history (no active contract flow). */
export function HistoryListingCard({ item, onOpenDetails, subtitle }) {
  const title = item.job?.title || item.title || "Project";
  const description = item.job?.description || item.description || "";

  return (
    <li className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="min-h-0 flex-1">
        <h2 className="line-clamp-2 text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
        {description ? (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {description}
          </p>
        ) : null}
        <p className="mt-3 text-[12px] font-medium text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-gray-800">
        <div className="flex flex-col gap-0.5">
          <RichLabel>Budget</RichLabel>
          <RichPrice value={item.job?.budget ?? item.acceptedBidAmount} />
        </div>
        <div className="ml-auto">
          <StatusBadge status="CANCELLED" />
        </div>
      </div>
      <div className="mt-4">
        <button
          type="button"
          onClick={() => onOpenDetails(item)}
          className="w-full rounded-xl border border-slate-300 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50 dark:border-gray-600 dark:text-slate-200 dark:hover:bg-gray-900"
        >
          Details
        </button>
      </div>
    </li>
  );
}

export function ContractCard({ contract, isClient, onOpenDetails, subtitle, viewProjectHref = null }) {
  const cardProgress = contract.progress ?? { completed: 0, total: 0 };
  const clientName = partyName(contract.client);
  const freelancerName = partyName(contract.freelancer);
  const messageUserId = isClient
    ? contract.freelancer?.id
    : contract.client?.id;

  return (
    <li className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-start justify-start gap-4">
        <ContractPartyAvatar user={contract.client} />
        <div className="flex h-full shrink-0 items-center justify-center rounded-full" aria-hidden>
          <PiHandshakeDuotone size={24} />
        </div>
        <ContractPartyAvatar user={contract.freelancer} />
      </div>
      <div className="min-h-0 flex-1">
        <h2 className="line-clamp-2 text-base font-semibold text-slate-900 dark:text-white">
          {contract.job?.title || contract.title || "Contract"}
        </h2>
        {cardProgress.total > 0 ? (
          <MilestoneProgressBar completed={cardProgress.completed} total={cardProgress.total} />
        ) : null}
        <p className="mt-3 text-[12px] font-medium capitalize text-slate-500 dark:text-slate-400">
          {subtitle || `Contract between ${clientName} and ${freelancerName}`}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-gray-800">
        <div className="flex flex-col gap-0.5">
          <RichLabel>{isClient ? "Agreed bid" : "Your bid"}</RichLabel>
          <RichPrice value={contract.acceptedBidAmount ?? contract.job?.budget ?? contract.amount} />
        </div>
        <div className="ml-auto">
          <ContractStatusBadge status={contract.status || "COMPLETED"} />
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={() => onOpenDetails(contract.id)}
          className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50 dark:border-gray-600 dark:text-slate-200 dark:hover:bg-gray-900"
        >
          Contract details
        </button>
        {messageUserId ? (
          <Link
            to={`/dashboard/messages/${messageUserId}`}
            className="flex-1 rounded-xl border border-[#26b69c]/40 bg-[#26b69c]/10 py-2.5 text-center text-sm font-semibold text-[#156b59] transition hover:bg-[#26b69c]/15 dark:text-[#56d9c0]"
          >
            Message
          </Link>
        ) : null}
        {viewProjectHref ? (
          <Link
            to={viewProjectHref}
            className="flex flex-1 items-center justify-center rounded-xl bg-slate-900 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-gray-900 dark:hover:bg-slate-200"
          >
            View project
          </Link>
        ) : null}
      </div>
    </li>
  );
}

export function ContractDetailDrawer({
  open,
  onClose,
  sectionLabel = "Contract details",
  detail,
  detailLoading,
  detailError,
  actionError,
  isClient,
  isFreelancer,
  counterparty,
  counterpartyName,
  milestones,
  progress,
  closure,
  expandedMilestoneIndex,
  setExpandedMilestoneIndex,
  busyMilestoneIndex,
  canStart,
  startBusy,
  onStartContract,
  contractActive,
  notStarted,
  showMarkCompleteButton,
  markCompleteDisabled,
  closureBusy,
  onMarkComplete,
  myMarkedComplete,
  milestonesReady,
  canSendPayment,
  canReceivePayment,
  showPaymentActions,
  onPaymentSent,
  onPaymentReceived,
  onToggleMilestone,
  readOnlyHistory = false,
  completedAt,
}) {
  if (!open) return null;

  const showClosure = !readOnlyHistory && !closure.finalized;

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
        aria-labelledby="contract-drawer-title"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-gray-800">
          <div className="min-w-0">
            <div className="mb-1">
              <RichLabel>{sectionLabel}</RichLabel>
            </div>
            <h2 id="contract-drawer-title" className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {detail?.job?.title || detail?.title || "Loading…"}
            </h2>
            {detail ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <ContractStatusBadge status={detail.status || "COMPLETED"} />
                {progress.total > 0 ? (
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {progress.completed}/{progress.total} milestones
                  </span>
                ) : null}
                {completedAt ? (
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Completed{" "}
                    {new Date(completedAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                ) : null}
                <ProjectImagesButton job={detail.job} />
              </div>
            ) : null}
            {isClient && detail?.jobId != null ? (
              <Link
                to={`/dashboard/client/projects/${detail.jobId}`}
                className="mt-3 inline-flex text-sm font-semibold text-[#26b69c] hover:underline"
              >
                View full project page
              </Link>
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
                  <RichPrice value={detail.acceptedBidAmount ?? detail.job?.budget ?? detail.amount} />
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-1.5">
                    <PiCalendarBlankDuotone className="shrink-0 text-fuchsia-500" size={14} aria-hidden />
                    <RichLabel>{readOnlyHistory ? "Completed" : "Started"}</RichLabel>
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {new Date(completedAt || detail.createdAt).toLocaleDateString(undefined, {
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
                <div className="mb-2">
                  <RichLabel>Overview</RichLabel>
                </div>
                <ProseRichText text={detail.job?.description || detail.description} />
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

              {!readOnlyHistory && canStart ? (
                <button
                  type="button"
                  disabled={startBusy}
                  onClick={() => void onStartContract()}
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
                    {readOnlyHistory || !isFreelancer ? (
                      <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Read only
                      </span>
                    ) : null}
                  </div>
                  <ul className="space-y-2" role="list">
                    {milestones.map((m) => {
                      const open = expandedMilestoneIndex === m.index;
                      const done = readOnlyHistory || m.status === "COMPLETED";
                      const busy = busyMilestoneIndex === m.index;
                      return (
                        <li
                          key={m.index}
                          className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900/40"
                        >
                          <div className="flex w-full items-center gap-2 bg-slate-50/90 px-3 py-3 dark:bg-gray-900/80">
                            {!readOnlyHistory && isFreelancer && contractActive && detail.status !== "COMPLETED" ? (
                              <label className="flex shrink-0 cursor-pointer items-center">
                                <input
                                  type="checkbox"
                                  checked={done}
                                  disabled={busy || !contractActive}
                                  onChange={(e) => void onToggleMilestone?.(m.index, e.target.checked)}
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
                                <MilestoneStatusBadge status={readOnlyHistory ? "COMPLETED" : m.status} />
                                <PiCaretDown
                                  className={`text-slate-500 transition-transform dark:text-slate-400 ${open ? "rotate-180" : ""}`}
                                  size={18}
                                  aria-hidden
                                />
                              </span>
                            </button>
                          </div>
                          {open ? (
                            <div className="space-y-2 border-t border-slate-100 px-3 py-3 text-sm leading-relaxed text-slate-600 dark:border-gray-800 dark:text-slate-400">
                              <MilestoneDetailPanel milestone={m} emptyText="No details." />
                              {m.amount != null ? (
                                <p>
                                  <span className="font-medium text-slate-700 dark:text-slate-300">Amount: </span>$
                                  {Number(m.amount).toLocaleString()}
                                </p>
                              ) : null}
                              {m.dueDate ? (
                                <p>
                                  <span className="font-medium text-slate-700 dark:text-slate-300">Due: </span>
                                  {m.dueDate}
                                </p>
                              ) : null}
                            
                            </div>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}

              {showClosure ? (
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
                  </ul>

                  {!readOnlyHistory && notStarted ? (
                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                      {isFreelancer
                        ? "Start the contract above before marking work complete."
                        : "Waiting for the freelancer to start the contract."}
                    </p>
                  ) : null}

                  {!readOnlyHistory && showMarkCompleteButton ? (
                    <button
                      type="button"
                      disabled={markCompleteDisabled}
                      onClick={() => void onMarkComplete()}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#26b69c] bg-[#26b69c]/10 py-2.5 text-sm font-semibold text-[#156b59] transition hover:bg-[#26b69c]/20 disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#56d9c0]"
                    >
                      <PiSealCheckDuotone size={18} aria-hidden />
                      {closureBusy ? "Saving…" : "Mark as complete"}
                    </button>
                  ) : null}

                  {!readOnlyHistory && myMarkedComplete && !closure.bothMarkedComplete ? (
                    <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                      You marked this complete. Waiting for the {isClient ? "freelancer" : "client"} to confirm.
                    </p>
                  ) : null}

                  {!readOnlyHistory && showMarkCompleteButton && !milestonesReady ? (
                    <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                      {milestoneCompleteGateHint({ isClient, isFreelancer, progress })}
                    </p>
                  ) : null}

                  {canSendPayment ? (
                    <button
                      type="button"
                      disabled={closureBusy}
                      onClick={() => void onPaymentSent?.()}
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
                      onClick={() => void onPaymentReceived?.()}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#26b69c] py-2.5 text-sm font-semibold text-white transition hover:brightness-105 disabled:opacity-50"
                    >
                      <PiWalletDuotone size={18} aria-hidden />
                      {closureBusy ? "Saving…" : "Received payment"}
                    </button>
                  ) : null}

                  {!readOnlyHistory && closure.finalized ? (
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
  );
}
