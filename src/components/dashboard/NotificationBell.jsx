import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { PiBellDuotone, PiWifiHighDuotone, PiX } from "react-icons/pi";
import { useNotifications } from "../../context/NotificationsContext.jsx";

function timeAgo(iso) {
  const d = new Date(iso);
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return "Just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const { items, unreadCount, loading, socketConnected, markRead, markAllRead, reload } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const onItemClick = async (n) => {
    if (!n.read) await markRead(n.id);
    setOpen(false);
    if (n.link) navigate(n.link.startsWith("/") ? n.link : `/dashboard${n.link}`);
  };

  return (
    <div className="relative" ref={panelRef}>
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`relative flex h-11 w-11 items-center justify-center rounded-xl border text-sm font-bold transition ${
          open
            ? "border-[#26b69c]/40 bg-[#26b69c]/10 text-[#156b59] dark:text-[#56d9c0]"
            : "border-slate-200 text-slate-700 hover:border-[#26b69c]/30 dark:border-gray-700 dark:text-slate-200"
        }`}
        whileTap={{ scale: 0.96 }}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
      >
        <PiBellDuotone size={20} aria-hidden />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#26b69c] px-1 text-[10px] font-bold text-white shadow-md">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
        {socketConnected ? (
          <span
            className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-900"
            title="Live"
          />
        ) : null}
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-[calc(100%+0.5rem)] z-[100] w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-gray-800">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Notifications</p>
                <p className="mt-0.5 flex items-center gap-1 text-[10px] font-medium text-slate-500">
                  <PiWifiHighDuotone
                    size={12}
                    className={socketConnected ? "text-emerald-500" : "text-slate-400"}
                  />
                  {socketConnected ? "Live updates" : "Connecting…"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => void markAllRead()}
                    className="rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#26b69c] hover:bg-[#26b69c]/10"
                  >
                    Mark all read
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-800"
                  aria-label="Close"
                >
                  <PiX size={18} />
                </button>
              </div>
            </div>

            <ul className="max-h-[min(60vh,24rem)] overflow-y-auto">
              {loading && !items.length ? (
                <li className="px-4 py-8 text-center text-sm text-slate-500">Loading…</li>
              ) : null}
              {!loading && !items.length ? (
                <li className="px-4 py-10 text-center">
                  <PiBellDuotone className="mx-auto text-slate-300" size={36} aria-hidden />
                  <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                    No notifications yet
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Bids, contracts, and payments will appear here in real time.
                  </p>
                </li>
              ) : null}
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => void onItemClick(n)}
                    className={`flex w-full gap-3 border-b border-slate-50 px-4 py-3 text-left transition hover:bg-slate-50 dark:border-gray-800/80 dark:hover:bg-gray-800/50 ${
                      !n.read ? "bg-[#26b69c]/[0.04]" : ""
                    }`}
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        n.read ? "bg-transparent" : "bg-[#26b69c]"
                      }`}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {n.title}
                        </span>
                        <span className="shrink-0 text-[10px] text-slate-400">
                          {timeAgo(n.createdAt)}
                        </span>
                      </span>
                      <span className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                        {n.body}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="border-t border-slate-100 px-4 py-2 dark:border-gray-800">
              <button
                type="button"
                onClick={() => void reload()}
                className="w-full rounded-lg py-2 text-xs font-semibold text-slate-500 hover:text-[#26b69c]"
              >
                Refresh list
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
