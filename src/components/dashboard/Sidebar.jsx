import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  PiBinocularsDuotone,
  PiCaretDoubleLeft,
  PiCaretDoubleRight,
  PiCoinsDuotone,
  PiHandshake,
  PiListChecksDuotone,
  PiUsersDuotone,
  PiX,
} from "react-icons/pi";
import {
  IoBriefcaseOutline,
  IoChatboxEllipsesOutline,
  IoCloudUploadOutline,
  IoFolderOpenOutline,
  IoHomeOutline,
  IoTimerOutline,
} from "react-icons/io5";
import { useAuth } from "../../context/AuthContext.jsx";
import { useSidebar } from "../../context/SidebarContext.jsx";

function NavTooltip({ label, show }) {
  if (!show) return null;
  return (
    <span className="pointer-events-none absolute left-[calc(100%+0.65rem)] top-1/2 z-[80] -translate-y-1/2 whitespace-nowrap rounded-lg border border-[#26b69c]/25 bg-white px-3 py-2 text-xs font-bold text-[#156b59] opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:border-gray-700 dark:bg-gray-900 dark:text-[#56d9c0]">
      {label}
    </span>
  );
}

function NavItem({ to, icon, label, active, collapsed, onNavigate }) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
        active
          ? "bg-gradient-to-r from-[#26b69c]/18 to-[#26b69c]/6 text-[#156b59] shadow-sm ring-1 ring-[#26b69c]/20 dark:text-[#56d9c0] dark:ring-[#26b69c]/25"
          : "text-slate-600 hover:bg-slate-100/90 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-gray-800/90 dark:hover:text-white"
      } ${collapsed ? "justify-center px-2.5" : ""}`}
      aria-current={active ? "page" : undefined}
    >
      {active ? (
        <span
          className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-[#26b69c]"
          aria-hidden
        />
      ) : null}
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
          active
            ? "bg-[#26b69c]/15 text-[#26b69c]"
            : "bg-slate-100/80 text-slate-600 group-hover:bg-white dark:bg-gray-800 dark:text-slate-300 dark:group-hover:bg-gray-700"
        }`}
      >
        {icon}
      </span>
      <AnimatePresence initial={false}>
        {!collapsed ? (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden whitespace-nowrap text-sm font-semibold capitalize"
          >
            {label}
          </motion.span>
        ) : null}
      </AnimatePresence>
      <NavTooltip label={label} show={collapsed} />
    </Link>
  );
}

function SidebarPanel({ className = "" }) {
  const location = useLocation();
  const { user } = useAuth();
  const { collapsed, toggle, closeMobile, mobileOpen } = useSidebar();
  const isHirer = user?.role === "CLIENT";
  const isAdmin = user?.role === "ADMIN";

  const nav = useMemo(() => {
    const home = {
      to: "/dashboard",
      label: "Home",
      icon: <IoHomeOutline size={22} className="icon" />,
    };
    if (isHirer) {
      return [
        home,
        {
          to: "/dashboard/client/post-project",
          label: "Post project",
          icon: <IoCloudUploadOutline size={22} className="icon" />,
          matchPrefix: false,
        },
        {
          to: "/dashboard/client/projects",
          label: "Track projects",
          icon: <PiBinocularsDuotone size={22} className="icon" />,
          matchPrefix: true,
        },
        {
          to: "/dashboard/contracts",
          label: "Contracts",
          icon: <PiHandshake size={22} className="icon" />,
          matchPrefix: false,
        },
        {
          to: "/dashboard/history",
          label: "History",
          icon: <IoTimerOutline size={22} className="icon" />,
          matchPrefix: false,
        },
        {
          to: "/dashboard/tasks",
          label: "Tasks",
          icon: <PiListChecksDuotone size={22} className="icon" />,
          matchPrefix: false,
        },
        {
          to: "/dashboard/messages",
          label: "Messages",
          icon: <IoChatboxEllipsesOutline size={22} className="icon" />,
          matchPrefix: true,
        },
        // {
        //   to: "/dashboard/coins",
        //   label: "Coins",
        //   icon: <PiCoinsDuotone size={22} className="icon" />,
        //   matchPrefix: false,
        // },
      ];
    }
    if (isAdmin) {
      return [
        home,
        {
          to: "/admin/users",
          label: "Users",
          icon: <PiUsersDuotone />,
        },
      ];
    }
    return [
      home,
      {
        to: "/dashboard/jobs",
        label: "Jobs",
        icon: <IoBriefcaseOutline size={22} className="icon" />,
        matchPrefix: false,
      },
      {
        to: "/dashboard/bids",
        label: "Bids",
        icon: <IoFolderOpenOutline size={22} className="icon" />,
        matchPrefix: false,
      },
      {
        to: "/dashboard/contracts",
        label: "Contracts",
        icon: <PiHandshake size={22} className="icon" />,
        matchPrefix: false,
      },
      {
        to: "/dashboard/history",
        label: "History",
        icon: <IoTimerOutline size={22} className="icon" />,
        matchPrefix: false,
      },
      {
        to: "/dashboard/tasks",
        label: "Tasks",
        icon: <PiListChecksDuotone size={22} className="icon" />,
        matchPrefix: false,
      },
      {
        to: "/dashboard/messages",
        label: "Messages",
        icon: <IoChatboxEllipsesOutline size={22} className="icon" />,
        matchPrefix: true,
      },
      // {
      //   to: "/dashboard/coins",
      //   label: "Coins",
      //   icon: <PiCoinsDuotone size={22} className="icon" />,
      //   matchPrefix: false,
      // },
    ];
  }, [isHirer]);

  const isActive = (item) => {
    if (item.to === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    if (item.matchPrefix) {
      return (
        location.pathname === item.to ||
        location.pathname.startsWith(`${item.to}/`)
      );
    }
    return location.pathname === item.to;
  };

  const onNavigate = () => closeMobile();

  return (
    <aside
      className={`sidebar-panel icon flex h-full flex-col border-r border-slate-200/90 dark:border-gray-800 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 ${className}`}
    >
      <div
        className={`flex h-16 shrink-0 items-center icon border-b border-slate-200/80 dark:border-gray-800 ${
          collapsed ? "justify-center px-2" : "justify-between gap-2 px-4"
        }`}
      >
        <Link
          to="/dashboard"
          onClick={onNavigate}
          className={`flex icon min-w-0 items-center gap-2.5 ${collapsed ? "justify-center" : ""}`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl  bg-gradient-to-br from-[#26b69c] to-emerald-600 shadow-md shadow-[#26b69c]/25">
            <img
              src="/logo.svg"
              alt=""
              className="h-5 w-5 brightness-0 invert"
            />
          </span>
          <AnimatePresence initial={false}>
            {!collapsed ? (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                className="truncate text-base font-bold tracking-tight text-[#26b69c]"
              >
                Proof Hire
              </motion.span>
            ) : null}
          </AnimatePresence>
        </Link>

        {!collapsed && mobileOpen ? (
          <button
            type="button"
            onClick={closeMobile}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 md:hidden dark:hover:bg-gray-800"
            aria-label="Close menu"
          >
            <PiX size={20} />
          </button>
        ) : null}
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-3 py-4">
        {!collapsed ? (
          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Menu
          </p>
        ) : null}
        {nav.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            active={isActive(item)}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
    </aside>
  );
}

export default function Sidebar() {
  const { collapsed, mobileOpen, closeMobile } = useSidebar();

  return (
    <>
      <AnimatePresence>
        {mobileOpen ? (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-[2px] md:hidden"
            aria-label="Close menu"
            onClick={closeMobile}
          />
        ) : null}
      </AnimatePresence>

      <div
        className={`sidebar-shell sticky top-0 z-[70] hidden h-screen shrink-0 md:block ${
          collapsed ? "sidebar-shell--collapsed" : "sidebar-shell--expanded"
        }`}
      >
        <SidebarPanel />
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="sidebar-shell sidebar-shell--expanded fixed inset-y-0 left-0 z-[70] md:hidden"
          >
            <SidebarPanel />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
