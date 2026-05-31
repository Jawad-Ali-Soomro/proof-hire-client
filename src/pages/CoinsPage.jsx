import { useCallback, useEffect, useState } from "react";
import { apiRequest, getStoredToken } from "../lib/api.js";
import { PiCoinsDuotone } from "react-icons/pi";

export default function CoinsPage() {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState("50");

  const loadData = useCallback(async () => {
    try {
      const [balData, txData] = await Promise.all([
        apiRequest("/coins/balance", { token: getStoredToken() }),
        apiRequest("/coins/transactions?limit=50", { token: getStoredToken() }),
      ]);
      setBalance(balData.balance);
      setTransactions(txData.transactions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePurchase = async () => {
    const amount = parseInt(purchaseAmount, 10);
    if (!amount || amount <= 0) return;
    setPurchasing(true);
    try {
      const data = await apiRequest("/coins/purchase", {
        method: "POST",
        body: { amount },
        token: getStoredToken(),
      });
      setBalance(data.balance);
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Coins</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Coins are required to bid on projects. Purchase more when you run low.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 dark:border-amber-900/50 dark:bg-amber-950/30">
          <PiCoinsDuotone size={32} className="text-amber-500" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
              Current Balance
            </p>
            <p className="text-3xl font-bold tabular-nums text-amber-900 dark:text-amber-200">
              {balance}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Purchase Coins
            </p>
            <div className="flex items-center gap-2">
              <select
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="25">25 coins</option>
                <option value="50">50 coins</option>
                <option value="100">100 coins</option>
                <option value="250">250 coins</option>
                <option value="500">500 coins</option>
              </select>
              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
              >
                {purchasing ? "Processing..." : "Buy"}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
              Mock purchase — coins are added instantly
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Transaction History
        </h2>
        {transactions.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400 dark:text-slate-500">
            No transactions yet.
          </p>
        ) : (
          <div className="mt-3 overflow-auto rounded-xl border border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 dark:border-gray-800 dark:bg-gray-900/80">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Date</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Reason</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-400">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      {formatReason(tx.reason)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-bold tabular-nums ${
                        tx.amount > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {tx.amount > 0 ? "+" : ""}
                      {tx.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function formatReason(reason) {
  const map = {
    bid_placed: "Bid placed",
    admin_grant: "Admin grant",
    purchase: "Purchase",
    refund: "Refund",
  };
  return map[reason] ?? reason;
}
