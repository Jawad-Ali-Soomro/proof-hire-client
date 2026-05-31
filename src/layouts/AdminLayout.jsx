import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  IoGridOutline,
  IoPeopleOutline,
  IoWalletOutline,
  IoArrowBackOutline,
} from "react-icons/io5";

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== "ADMIN")) {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, isAuthenticated, user, navigate]);

  if (loading || !isAuthenticated || user?.role !== "ADMIN") return null;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-gray-950">
      <aside className="flex w-60 flex-col border-r border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex h-14 items-center gap-2 border-b border-slate-200 px-5 dark:border-gray-800">
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            Admin Panel
          </span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          <AdminNavLink to="/admin" end icon={IoGridOutline}>
            Dashboard
          </AdminNavLink>
          <AdminNavLink to="/admin/users" icon={IoPeopleOutline}>
            Users
          </AdminNavLink>
          <AdminNavLink to="/admin/coins" icon={IoWalletOutline}>
            Coins
          </AdminNavLink>
        </nav>
        <div className="border-t border-slate-200 p-3 dark:border-gray-800">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-gray-800"
          >
            <IoArrowBackOutline size={16} />
            Back to App
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}

function AdminNavLink({ to, end, icon: Icon, children }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
          isActive
            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
            : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-gray-800"
        }`
      }
    >
      <Icon size={18} />
      {children}
    </NavLink>
  );
}
