import { useCallback, useEffect, useState } from "react";
import { apiRequest, getStoredToken } from "../../lib/api.js";

export default function AdminCoins() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("limit", "50");
      const data = await apiRequest(`/admin/users?${params}`, {
        token: getStoredToken(),
      });
      setUsers(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        Coin Management
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Grant coins to users
      </p>

      <div className="mt-4">
        <input
          type="text"
          placeholder="Search user by email or username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-72 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div className="mt-4 overflow-auto rounded-xl border border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-gray-800 dark:bg-gray-900/80">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">User</th>
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Role</th>
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Balance</th>
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Grant Coins</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <CoinRow key={u.id} user={u} onRefresh={load} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CoinRow({ user: u, onRefresh }) {
  const [amount, setAmount] = useState("");
  const [granting, setGranting] = useState(false);

  const handleGrant = async () => {
    const num = parseInt(amount, 10);
    if (!num || num <= 0) return;
    setGranting(true);
    try {
      await apiRequest(`/admin/users/${u.id}/grant-coins`, {
        method: "POST",
        body: { amount: num },
        token: getStoredToken(),
      });
      setAmount("");
      onRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setGranting(false);
    }
  };

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-gray-800/50">
      <td className="px-4 py-3">
        <p className="font-medium text-slate-900 dark:text-white">{u.username}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
      </td>
      <td className="px-4 py-3 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
        {u.role}
      </td>
      <td className="px-4 py-3 tabular-nums font-semibold text-slate-900 dark:text-white">
        {u.coinBalance}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <button
            onClick={handleGrant}
            disabled={granting || !amount}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {granting ? "..." : "Grant"}
          </button>
        </div>
      </td>
    </tr>
  );
}
