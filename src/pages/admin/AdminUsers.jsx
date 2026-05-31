import { useCallback, useEffect, useState } from "react";
import { apiRequest, getStoredToken } from "../../lib/api.js";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (search) params.set("search", search);
      const data = await apiRequest(`/admin/users?${params}`, {
        token: getStoredToken(),
      });
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Users
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {total} total users
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          Create User
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search by email or username..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-64 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="">All roles</option>
          <option value="ADMIN">Admin</option>
          <option value="CLIENT">Client</option>
          <option value="FREELANCER">Freelancer</option>
        </select>
      </div>

      <div className="mt-4 overflow-auto rounded-xl border border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-gray-800 dark:bg-gray-900/80">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">ID</th>
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Username</th>
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Email</th>
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Role</th>
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Coins</th>
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Wallet</th>
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <UserRow key={u.id} user={u} onRefresh={loadUsers} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {total > 20 && (
        <div className="mt-4 flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium disabled:opacity-40 dark:border-gray-700 dark:text-white"
          >
            Prev
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Page {page}
          </span>
          <button
            disabled={page * 20 >= total}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium disabled:opacity-40 dark:border-gray-700 dark:text-white"
          >
            Next
          </button>
        </div>
      )}

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            loadUsers();
          }}
        />
      )}
    </div>
  );
}

function UserRow({ user: u, onRefresh }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete user ${u.username}?`)) return;
    setDeleting(true);
    try {
      await apiRequest(`/admin/users/${u.id}`, {
        method: "DELETE",
        token: getStoredToken(),
      });
      onRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-gray-800/50">
      <td className="px-4 py-3 tabular-nums text-slate-900 dark:text-white">{u.id}</td>
      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{u.username}</td>
      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{u.email}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
            u.role === "ADMIN"
              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
              : u.role === "CLIENT"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
          }`}
        >
          {u.role}
        </span>
      </td>
      <td className="px-4 py-3 tabular-nums text-slate-900 dark:text-white">{u.coinBalance}</td>
      <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
        {u.wallet?.address
          ? `${u.wallet.address.slice(0, 6)}...${u.wallet.address.slice(-4)}`
          : "—"}
      </td>
      <td className="px-4 py-3">
        <button
          onClick={handleDelete}
          disabled={deleting || u.role === "ADMIN"}
          className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-40 dark:text-red-400"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

function CreateUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    role: "FREELANCER",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await apiRequest("/admin/users", {
        method: "POST",
        body: form,
        token: getStoredToken(),
      });
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Create User
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <input
            type="text"
            required
            placeholder="Username"
            value={form.username}
            onChange={(e) => update("username", e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <select
            value={form.role}
            onChange={(e) => update("role", e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="FREELANCER">Freelancer</option>
            <option value="CLIENT">Client</option>
            <option value="ADMIN">Admin</option>
          </select>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 dark:border-gray-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
