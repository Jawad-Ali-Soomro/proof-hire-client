import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ClientOnly({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "CLIENT") {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, user, navigate]);

  if (loading || !user || user.role !== "CLIENT") {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Loading…</p>
      </div>
    );
  }

  return <div className="p-10">{children}</div>;
}
