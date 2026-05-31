import { Link } from "react-router-dom";
import {
  PiArrowRight,
  PiBellDuotone,
  PiChatCircleDotsDuotone,
  PiListChecksDuotone,
} from "react-icons/pi";
import { IoChatboxEllipsesOutline } from "react-icons/io5";

function formatRelative(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function DashboardEngagementKpis({ summary, loading }) {
  if (loading || !summary) return null;

  const tiles = [
    {
      label: "Open tasks",
      value: summary.openTasks ?? 0,
      hint: "Across active projects",
      to: "/dashboard/tasks",
    },
    {
      label: "Conversations",
      value: summary.activeConversations ?? 0,
      hint: "Direct messages",
      to: "/dashboard/messages",
    },
    {
      label: "Notifications",
      value: summary.unreadNotifications ?? 0,
      hint: "Unread updates",
      to: "/dashboard",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3 mt-5">
      {tiles.map((t) => (
        <Link
          key={t.label}
          to={t.to}
          className="group rounded-2xl border border-slate-200/80 bg-white/90 p-4 transition hover:-translate-y-0.5 hover:border-[#26b69c]/30 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/90"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            {t.label}
          </p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
            {t.value}
          </p>
          <p className="mt-1 text-xs text-slate-500">{t.hint}</p>
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#26b69c] opacity-0 transition group-hover:opacity-100">
            View
            <PiArrowRight size={14} />
          </span>
        </Link>
      ))}
    </div>
  );
}

export function DashboardActivityPanels({ activity, loading }) {
  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-slate-100 dark:border-gray-800 dark:bg-gray-800/50"
          />
        ))}
      </div>
    );
  }

  const tasks = activity?.recentTasks ?? [];
  const threads = activity?.recentThreads ?? [];

  return (
    <section>
      <h2 className="mb-3 mt-5 text-sm font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        Workspace activity
      </h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 dark:border-gray-800 dark:bg-gray-900/90">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <PiListChecksDuotone className="text-violet-500" size={22} aria-hidden />
              <h3 className="font-semibold text-slate-900 dark:text-white">Recent tasks</h3>
            </div>
            <Link
              to="/dashboard/tasks"
              className="text-xs font-bold text-[#26b69c] hover:underline"
            >
              All tasks
            </Link>
          </div>
          {tasks.length ? (
            <ul className="space-y-2">
              {tasks.map((task) => (
                <li key={task.id}>
                  <Link
                    to="/dashboard/tasks"
                    className="flex items-start gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-violet-200 hover:bg-violet-500/5 dark:border-gray-800 dark:hover:border-violet-900/50"
                  >
                    <span
                      className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        task.status === "DONE"
                          ? "bg-slate-100 text-slate-500"
                          : "bg-violet-500/15 text-violet-800 dark:text-violet-300"
                      }`}
                    >
                      {task.status === "DONE" ? "Done" : "Open"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {task.title}
                      </p>
                      <p className="truncate text-xs text-slate-500">{task.jobTitle}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">
              No tasks yet. Create one in chat with # at the start of a message.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 dark:border-gray-800 dark:bg-gray-900/90">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <IoChatboxEllipsesOutline className="text-[#26b69c]" size={22} aria-hidden />
              <h3 className="font-semibold text-slate-900 dark:text-white">Recent messages</h3>
            </div>
            <Link
              to="/dashboard/messages"
              className="text-xs font-bold text-[#26b69c] hover:underline"
            >
              All messages
            </Link>
          </div>
          {threads.length ? (
            <ul className="space-y-2">
              {threads.map((thread) => (
                <li key={thread.conversationId}>
                  <Link
                    to={`/dashboard/messages/${thread.counterpartyId}`}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-[#26b69c]/30 hover:bg-[#26b69c]/5 dark:border-gray-800"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#26b69c] to-emerald-600 text-sm font-bold text-white">
                      {thread.counterpartyAvatar ? (
                        <img
                          src={thread.counterpartyAvatar}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>{(thread.counterpartyName || "?")[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                          {thread.counterpartyName}
                        </p>
                        {thread.lastMessageAt ? (
                          <span className="text-[10px] text-slate-400">
                            {formatRelative(thread.lastMessageAt)}
                          </span>
                        ) : null}
                      </div>
                      <p className="truncate text-xs text-slate-500">
                        {thread.lastMessage || "No messages yet"}
                      </p>
                    </div>
                
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">
              No conversations yet. Message someone after you start a project together.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export function DashboardNotificationsBanner({ count }) {
  if (!count || count <= 0) return null;
  return (
    <div className="rounded-2xl mt-5 border border-amber-200/80 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-5 dark:border-amber-900/50">
      <div className="flex flex-wrap items-center gap-3">
        <PiBellDuotone className="text-amber-600 dark:text-amber-400" size={28} aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900 dark:text-white">
            {count} unread notification{count === 1 ? "" : "s"}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Check the bell in the top bar for bid updates, contracts, and more.
          </p>
        </div>
      </div>
    </div>
  );
}
