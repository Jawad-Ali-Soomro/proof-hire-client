import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  PiFunnelDuotone,
  PiListChecksDuotone,
  PiMagnifyingGlassDuotone,
} from "react-icons/pi";
import TaskCard from "../components/tasks/TaskCard.jsx";
import DropdownSelect from "../components/ui/DropdownSelect.jsx";
import { useChatSocket } from "../context/ChatSocketContext.jsx";
import { apiRequest, getStoredToken } from "../lib/api.js";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "OPEN", label: "Open" },
  { value: "DONE", label: "Done" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "project-asc", label: "Project A → Z" },
  { value: "project-desc", label: "Project Z → A" },
];

function creatorLabel(user) {
  return user?.fullName?.trim() || user?.username || "";
}

export default function TasksPage() {
  const { subscribe } = useChatSocket();
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const list = await apiRequest("/chat/tasks", { token: getStoredToken() });
      setTasks(Array.isArray(list) ? list : []);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    return subscribe("task", () => {
      void loadTasks();
    });
  }, [subscribe, loadTasks]);

  const projectOptions = useMemo(() => {
    const byContract = new Map();
    for (const task of tasks) {
      if (!byContract.has(task.contractId)) {
        byContract.set(task.contractId, {
          value: String(task.contractId),
          label: task.jobTitle,
        });
      }
    }
    return [
      { value: "all", label: "All projects" },
      ...[...byContract.values()].sort((a, b) => a.label.localeCompare(b.label)),
    ];
  }, [tasks]);

  const filtered = useMemo(() => {
    let list = [...tasks];

    if (statusFilter !== "all") {
      list = list.filter((t) => t.status === statusFilter);
    }
    if (projectFilter !== "all") {
      list = list.filter((t) => String(t.contractId) === projectFilter);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((t) => {
        const haystack = [
          t.title,
          t.description,
          t.jobTitle,
          creatorLabel(t.createdBy),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
    }

    list.sort((a, b) => {
      if (sortBy === "project-asc" || sortBy === "project-desc") {
        const byProject = a.jobTitle.localeCompare(b.jobTitle);
        if (byProject !== 0) return sortBy === "project-asc" ? byProject : -byProject;
      }
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sortBy === "oldest" ? aTime - bTime : bTime - aTime;
    });

    return list;
  }, [tasks, statusFilter, projectFilter, search, sortBy]);

  const openCount = tasks.filter((t) => t.status === "OPEN").length;
  const hasFilters =
    search.trim() !== "" ||
    statusFilter !== "all" ||
    projectFilter !== "all" ||
    sortBy !== "newest";
  const showToolbar = !loading && (tasks.length > 0 || hasFilters);

  const toggleTask = async (task) => {
    const next = task.status === "DONE" ? "OPEN" : "DONE";
    setBusyId(task.id);
    try {
      const updated = await apiRequest(
        `/chat/contracts/${task.contractId}/tasks/${task.id}`,
        {
          method: "PATCH",
          token: getStoredToken(),
          body: { status: next },
        },
      );
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, ...updated } : t)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update task");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-wrap items-start gap-3">
          <PiListChecksDuotone className="mt-0.5 shrink-0 text-violet-500" size={28} aria-hidden />
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Tasks</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              {openCount} open across your active contracts. Create new tasks in chat with #.
            </p>
          </div>
        </div>
      </div>

      {showToolbar ? (
        <div className="mb-6 flex flex-col gap-3 justify-start lg:flex-row lg:items-center lg:gap-4">
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
              placeholder="Search by task, project, or creator…"
              className="min-w-[400px] rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#26b69c] dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-[#26b69c]"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full min-w-[160px] sm:w-[180px]">
              <PiFunnelDuotone
                className="pointer-events-none absolute left-3 top-3.5 z-10 text-slate-400"
                size={18}
                aria-hidden
              />
              <DropdownSelect
                className="pl-10"
                value={statusFilter}
                onChange={setStatusFilter}
                options={STATUS_OPTIONS}
                placeholder="Status"
              />
            </div>
            <div className="relative w-full min-w-[160px] sm:w-[200px]">
              <PiFunnelDuotone
                className="pointer-events-none absolute left-3 top-3.5 z-10 text-slate-400"
                size={18}
                aria-hidden
              />
              <DropdownSelect
                className="pl-10"
                value={projectFilter}
                onChange={setProjectFilter}
                options={projectOptions}
                placeholder="Project"
              />
            </div>
            <div className="relative w-full min-w-[160px] sm:w-[180px]">
              <PiFunnelDuotone
                className="pointer-events-none absolute left-3 top-3.5 z-10 text-slate-400"
                size={18}
                aria-hidden
              />
              <DropdownSelect
                className="pl-10"
                value={sortBy}
                onChange={setSortBy}
                options={SORT_OPTIONS}
                placeholder="Sort by"
              />
            </div>
          </div>
        </div>
      ) : null}

      {showToolbar && filtered.length !== tasks.length ? (
        <p className="mb-4 text-xs font-medium text-slate-500 dark:text-slate-400">
          Showing {filtered.length} of {tasks.length} tasks
        </p>
      ) : null}

      {error ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      ) : null}

      <div>
        {loading ? (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <li
                key={i}
                className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-slate-100 dark:border-gray-800 dark:bg-gray-800/50"
              />
            ))}
          </ul>
        ) : !tasks.length ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-6 py-12 text-center dark:border-gray-700 dark:bg-gray-900/40">
            <PiListChecksDuotone className="mx-auto text-slate-400" size={40} aria-hidden />
            <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">No tasks yet</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Create tasks in chat by starting a message with #.
            </p>
            <Link
              to="/dashboard/messages"
              className="mt-4 inline-block text-sm font-semibold text-[#26b69c] hover:underline"
            >
              Open messages
            </Link>
          </div>
        ) : !filtered.length ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-6 py-12 text-center dark:border-gray-700 dark:bg-gray-900/40">
            <PiMagnifyingGlassDuotone className="mx-auto text-slate-400" size={40} aria-hidden />
            <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">
              No tasks match your filters
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setProjectFilter("all");
                setSortBy("newest");
              }}
              className="mt-4 text-sm font-semibold text-[#26b69c] hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((task) => (
              <li key={task.id} className="min-h-0">
                <TaskCard
                  task={task}
                  showProject
                  onToggle={toggleTask}
                  busy={busyId === task.id}
                  messageUserId={task.counterpartyId || null}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
