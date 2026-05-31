import { Link } from "react-router-dom";
import { PiChatCircleDotsDuotone, PiCheck } from "react-icons/pi";

function displayName(user) {
  return user?.fullName?.trim() || user?.username || "User";
}

export default function TaskCard({
  task,
  onToggle,
  busy,
  showProject = false,
  messageUserId = null,
}) {
  const done = task.status === "DONE";

  return (
    <article
      className={`flex h-full flex-col rounded-2xl border bg-white p-5 shadow-sm transition dark:bg-gray-900 ${
        done
          ? "border-slate-200/80 opacity-90 dark:border-gray-800"
          : "border-[#26b69c]/20 dark:border-[#26b69c]/25"
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => onToggle?.(task)}
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-2 transition ${
            done
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-slate-200 hover:border-[#26b69c] dark:border-gray-600"
          }`}
          aria-label={done ? "Mark open" : "Mark done"}
        >
          {done ? <PiCheck size={18} /> : null}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                done
                  ? "bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-400"
                  : "bg-violet-500/15 text-violet-800 dark:text-violet-300"
              }`}
            >
              {done ? "Done" : "Open"}
            </span>
          </div>
          <h3
            className={`mt-2 text-base font-semibold leading-snug ${
              done ? "line-through text-slate-500" : "text-slate-900 dark:text-white"
            }`}
          >
            {task.title}
          </h3>
        </div>
      </div>

      {task.description ? (
        <p className="mt-3 line-clamp-3 flex-1 text-sm text-slate-600 dark:text-slate-400">
          {task.description}
        </p>
      ) : (
        <div className="flex-1" />
      )}

      <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 dark:border-gray-800">
        {showProject && task.jobTitle ? (
          <p className="truncate text-xs font-semibold text-[#156b59] dark:text-[#56d9c0]">
            {task.jobTitle}
          </p>
        ) : null}
        <p className="text-[11px] text-slate-500">
          {displayName(task.createdBy)} ·{" "}
          {new Date(task.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      {messageUserId ? (
        <Link
          to={`/dashboard/messages/${messageUserId}`}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#26b69c]/30 bg-[#26b69c]/5 py-2.5 text-sm font-semibold text-[#156b59] transition hover:bg-[#26b69c]/10 dark:text-[#56d9c0]"
        >
          <PiChatCircleDotsDuotone size={18} aria-hidden />
          Message
        </Link>
      ) : null}
    </article>
  );
}
