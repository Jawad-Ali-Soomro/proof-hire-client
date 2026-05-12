import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  PiBinocularsDuotone,
  PiChatCircleDotsDuotone,
  PiClockCounterClockwiseDuotone,
  PiCloudArrowUpDuotone,
  PiFileTextDuotone,
  PiHouseDuotone,
  PiHandshakeDuotone,
  PiBriefcaseDuotone,
} from "react-icons/pi";
import { useAuth } from "../../context/AuthContext.jsx";

function HoverChip({ label }) {
  return (
    <span className="pointer-events-none absolute left-[calc(100%+2rem)] top-1/2 z-[70] -translate-y-1/2 rounded-xl border border-[#26b69c]/30 bg-white w-[100px] py-3 text-center text-xs font-bold text-[#156b59] opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100 dark:bg-gray-900 dark:text-[#56d9c0]">
      {label}
      <div className="w-4 h-4 absolute left-0 top-4 -translate-y-1 -translate-x-1/2 bg-white border-b border-l border-[#26b69c]/30 dark:border-gray-700 dark:bg-gray-900 rotate-45"></div>
    </span>
  );
}

function IconNavLink({ to, icon, label, active }) {
  return (
    <Link
      to={to}
      className={`group relative flex h-13 w-13 items-center justify-center rounded-xl transition-colors ${
        active
          ? "bg-[#26b69c]/10 text-[#156b59] dark:text-[#56d9c0]"
          : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
      }`}
      aria-label={label}
    >
      <span className="text-lg">{icon}</span>
      <HoverChip label={label} />
    </Link>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const isHirer = user?.role === "CLIENT";

  const nav = useMemo(() => {
    const home = { to: "/dashboard", label: "Home", icon: <PiHouseDuotone size={23} /> };
    if (isHirer) {
      return [
        home,
        {
          to: "/dashboard/client/post-project",
          label: "Post project",
          icon: <PiCloudArrowUpDuotone size={23} />,
          matchPrefix: false,
        },
        {
          to: "/dashboard/client/projects",
          label: "Track projects",
          icon: <PiBinocularsDuotone size={23} />,
          matchPrefix: true,
        },
        {
          to: "/dashboard/contracts",
          label: "Contracts",
          icon: <PiHandshakeDuotone size={23} />,
          matchPrefix: false,
        },
        {
          to: "/dashboard/history",
          label: "History",
          icon: <PiClockCounterClockwiseDuotone size={23} />,
          matchPrefix: false,
        },
        {
          to: "/dashboard/messages",
          label: "Messages",
          icon: <PiChatCircleDotsDuotone size={23} />,
          matchPrefix: false,
        },
      ];
    }
    return [
      home,
      {
        to: "/dashboard/jobs",
        label: "Jobs",
        icon: <PiBriefcaseDuotone size={23} />,
        matchPrefix: false,
      },
      {
        to: "/dashboard/bids",
        label: "Bids",
        icon: <PiFileTextDuotone size={23} />,
        matchPrefix: false,
      },
      {
        to: "/dashboard/contracts",
        label: "Contracts",
        icon: <PiHandshakeDuotone size={23} />,
        matchPrefix: false,
      },
      {
        to: "/dashboard/history",
        label: "History",
        icon: <PiClockCounterClockwiseDuotone size={23} />,
        matchPrefix: false,
      },
      {
        to: "/dashboard/messages",
        label: "Messages",
        icon: <PiChatCircleDotsDuotone size={23} />,
        matchPrefix: false,
      },
    ];
  }, [isHirer]);

  const isActive = (item) => {
    if (item.matchPrefix) {
      return (
        location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
      );
    }
    return location.pathname === item.to;
  };

  return (
    <aside className="h-screen sticky top-0 z-50 w-[76px] border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="flex h-16 items-center justify-center border-b border-gray-200 px-3 dark:border-gray-700">
        <div className="flex items-center justify-center">
          <img src="/logo.svg" alt="Proof Hire" className="h-8 w-8" />
        </div>
      </div>

      <nav className="px-3 py-6 space-y-2 flex flex-col items-center">
        {nav.map((item) => (
          <IconNavLink
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            active={isActive(item)}
          />
        ))}
      </nav>
    </aside>
  );
}
