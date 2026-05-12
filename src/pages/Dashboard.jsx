import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useWallet } from "../context/WalletContext.jsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const { isConnected } = useWallet();
  const { user, loading, profileComplete } = useAuth();

  useEffect(() => {
    if (!isConnected && !loading) {
      navigate("/", { replace: true });
      return;
    }
    if (!loading && user && profileComplete === false) {
      navigate("/dashboard/profile", { replace: true });
    }
  }, [isConnected, loading, user, profileComplete, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-[50vh]">
        <p className="text-center text-gray-500 dark:text-gray-400 font-semibold">
          Loading…
        </p>
      </div>
    );
  }

  const title = user.profile?.fullName || user.username;
  const roleLabel =
    user.role === "CLIENT" ? "Hiring / posting jobs" : "Freelancer";

  return (
    <div className="min-h-[60vh]">
      <div className="mx-auto max-w-3xl rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <p className="text-xs font-bold uppercase tracking-wider text-[#26b69c]">
          Dashboard
        </p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {title}
        </h1>
        <p className="mt-3 text-gray-600 dark:text-gray-300">{roleLabel}</p>
      </div>
    </div>
  );
}
