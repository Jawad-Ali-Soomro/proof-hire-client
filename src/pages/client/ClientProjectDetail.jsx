import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PiCaretLeft } from "react-icons/pi";
import { apiRequest, getStoredToken } from "../../lib/api.js";
import ClientOnly from "./ClientOnly.jsx";

export default function ClientProjectDetail() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyBidId, setBusyBidId] = useState(null);

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

  const milestones = Array.isArray(job?.milestones) ? job.milestones : [];

  return (
    <ClientOnly>
      <div className="mx-auto max-w-4xl">
        <Link
          to="/dashboard/client/projects"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#26b69c]"
        >
          <PiCaretLeft size={18} aria-hidden />
          Back to projects
        </Link>

        {loading ? (
          <p className="mt-10 text-center text-sm font-semibold text-gray-500 dark:text-gray-400">
            Loading…
          </p>
        ) : !job ? (
          <p className="mt-10 text-sm font-semibold text-red-600 dark:text-red-400">{error || "Not found"}</p>
        ) : (
          <>
            <p className="mt-6 text-xs font-bold uppercase tracking-wider text-[#26b69c]">Project</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{job.title}</h1>
            <p className="mt-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
              Budget ${Number(job.budget).toLocaleString()} · {String(job.status).replace("_", " ")}
            </p>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
                <h2 className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Description
                </h2>
                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">
                  {job.description}
                </p>
              </div>
              <div className="space-y-4">
                {job.requirements ? (
                  <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
                    <h2 className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Requirements
                    </h2>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">
                      {job.requirements}
                    </p>
                  </div>
                ) : null}
                {job.paymentNotes ? (
                  <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
                    <h2 className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Payment
                    </h2>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">
                      {job.paymentNotes}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            {milestones.length ? (
              <div className="mt-8 rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
                <h2 className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Milestones
                </h2>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-800 dark:text-gray-200">
                  {milestones.map((m, i) => (
                    <li key={i}>
                      <span className="font-bold">{m.title || "Untitled"}</span>
                      {m.description ? <span className="block text-gray-600 dark:text-gray-400">{m.description}</span> : null}
                      <span className="mt-1 block text-xs text-gray-500">
                        {m.amount != null && m.amount !== "" ? `$${Number(m.amount).toLocaleString()}` : null}
                        {m.dueDate ? ` · ${m.dueDate}` : null}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            <div className="mt-10">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Applicants</h2>
              {error ? <p className="mt-2 text-sm font-semibold text-red-600 dark:text-red-400">{error}</p> : null}
              {!job.bids?.length ? (
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">No bids yet.</p>
              ) : (
                <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-900/80 dark:text-gray-400">
                      <tr>
                        <th className="px-4 py-3">Freelancer</th>
                        <th className="px-4 py-3">Bid</th>
                        <th className="px-4 py-3">Message</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {job.bids.map((bid) => {
                        const name =
                          bid.freelancer?.profile?.fullName || bid.freelancer?.username || "User";
                        const pending = bid.status === "PENDING";
                        return (
                          <tr key={bid.id} className="border-b border-gray-100 dark:border-gray-800">
                            <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                              <div className="flex items-center gap-2">
                                {bid.freelancer?.profile?.avatar ? (
                                  <img
                                    src={bid.freelancer.profile.avatar}
                                    alt=""
                                    className="h-9 w-9 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                                  />
                                ) : null}
                                <span>{name}</span>
                              </div>
                              <span className="text-xs text-gray-500">@{bid.freelancer?.username}</span>
                            </td>
                            <td className="px-4 py-3 font-bold text-[#26b69c]">
                              ${Number(bid.amount).toLocaleString()}
                            </td>
                            <td className="max-w-xs px-4 py-3 text-gray-700 dark:text-gray-300">
                              <span className="line-clamp-3">{bid.message}</span>
                            </td>
                            <td className="px-4 py-3 text-xs font-bold uppercase text-gray-600 dark:text-gray-400">
                              {bid.status}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {pending ? (
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    disabled={busyBidId === bid.id || job.status !== "OPEN"}
                                    onClick={() => setBid(bid.id, "ACCEPTED")}
                                    className="rounded-lg bg-[#26b69c] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    disabled={busyBidId === bid.id}
                                    onClick={() => setBid(bid.id, "REJECTED")}
                                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 dark:border-red-900/60 dark:text-red-400 disabled:opacity-40"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {job.status !== "OPEN" ? (
                <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  This project is no longer open for new approvals.
                </p>
              ) : null}
            </div>
          </>
        )}
      </div>
    </ClientOnly>
  );
}
