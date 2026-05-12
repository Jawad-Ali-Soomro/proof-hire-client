import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PiPlus, PiTrashDuotone } from "react-icons/pi";
import { apiRequest, getStoredToken } from "../../lib/api.js";
import ClientOnly from "./ClientOnly.jsx";

const emptyMilestone = () => ({
  title: "",
  description: "",
  amount: "",
  dueDate: "",
});

export default function ClientPostProject() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [requirements, setRequirements] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [milestones, setMilestones] = useState([emptyMilestone()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const addMilestone = () => setMilestones((prev) => [...prev, emptyMilestone()]);
  const removeMilestone = (idx) =>
    setMilestones((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));

  const updateMilestone = (idx, field, value) => {
    setMilestones((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)),
    );
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const milestonePayload = milestones
        .map((m) => ({
          title: m.title.trim(),
          description: m.description.trim(),
          dueDate: m.dueDate.trim(),
          amount: m.amount === "" ? undefined : Number(m.amount),
        }))
        .filter((m) => m.title);
      const body = {
        title: title.trim(),
        description: description.trim(),
        budget: Number(budget),
        requirements: requirements.trim() || undefined,
        paymentNotes: paymentNotes.trim() || undefined,
        milestones: milestonePayload.length ? milestonePayload : undefined,
      };
      await apiRequest("/jobs", {
        method: "POST",
        token: getStoredToken(),
        body,
      });
      navigate("/dashboard/client/projects", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post project");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ClientOnly>
      <div className="mx-auto">
        <p className="text-xs font-bold uppercase tracking-wider text-[#26b69c]">Client</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">Post a project</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Describe the work, budget, payment expectations, milestones, and requirements. Freelancers
          can bid; you approve or reject applicants from Track projects.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Project title
            </span>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-semibold outline-none focus:border-[#26b69c] dark:border-gray-800 dark:bg-gray-900"
            />
          </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Total budget (USDT)
              </span>
              <input
                required
                type="number"
                min="1"
                step="0.01"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-semibold outline-none focus:border-[#26b69c] dark:border-gray-800 dark:bg-gray-900"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Payment & invoicing notes
              </span>
              <textarea
                rows={3}
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="e.g. 50% upfront, net-15, milestone releases…"
                className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-medium outline-none focus:border-[#26b69c] dark:border-gray-800 dark:bg-gray-900"
              />
            </label>
          </div>

          
         <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
         <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Overview & deliverables
            </span>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-medium outline-none focus:border-[#26b69c] dark:border-gray-800 dark:bg-gray-900"
            />
          </label>

          

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Requirements & constraints
            </span>
            <textarea
              rows={4}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Tech stack, compliance, deadlines, must-haves…"
              className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-medium outline-none focus:border-[#26b69c] dark:border-gray-800 dark:bg-gray-900"
            />
          </label>
         </div>

          <div className="rounded-2xl dark:border-gray-800">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Milestones
              </span>
              <button
                type="button"
                onClick={addMilestone}
                className="inline-flex items-center gap-1 rounded-lg border border-[#26b69c]/40 bg-[#26b69c]/10 px-3 py-1.5 text-xs font-bold text-[#156b59] dark:text-[#56d9c0]"
              >
                <PiPlus size={16} aria-hidden />
                Add Milestone
              </button>
            </div>
            <div className="mt-4 space-y-4">
              {milestones.map((m, idx) => (
                <div
                  key={idx}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                      Milestone {idx + 1}
                    </span>
                    {milestones.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeMilestone(idx)}
                        className="text-red-600 dark:text-red-400"
                        aria-label="Remove milestone"
                      >
                        <PiTrashDuotone size={18} />
                      </button>
                    ) : null}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block sm:col-span-2">
                      <span className="text-[11px] font-bold uppercase text-gray-500">Title</span>
                      <input
                        value={m.title}
                        onChange={(e) => updateMilestone(idx, "title", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-medium outline-none focus:border-[#26b69c] dark:border-gray-800 dark:bg-gray-900"
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="text-[11px] font-bold uppercase text-gray-500">Description</span>
                      <textarea
                        rows={2}
                        value={m.description}
                        onChange={(e) => updateMilestone(idx, "description", e.target.value)}
                        className="mt-1 w-full resize-none rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-medium outline-none focus:border-[#26b69c] dark:border-gray-800 dark:bg-gray-900"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[11px] font-bold uppercase text-gray-500">Amount (optional)</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={m.amount}
                        onChange={(e) => updateMilestone(idx, "amount", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-medium outline-none focus:border-[#26b69c] dark:border-gray-800 dark:bg-gray-900"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[11px] font-bold uppercase text-gray-500">Target date</span>
                      <input
                        type="text"
                        value={m.dueDate}
                        onChange={(e) => updateMilestone(idx, "dueDate", e.target.value)}
                        placeholder="e.g. 2026-07-01"
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm font-medium outline-none focus:border-[#26b69c] dark:border-gray-800 dark:bg-gray-900"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error ? (
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#26b69c] py-3 text-sm font-bold text-white transition hover:brightness-105 disabled:opacity-60"
          >
            {submitting ? "Publishing…" : "Publish project"}
          </button>
        </form>
      </div>
    </ClientOnly>
  );
}
