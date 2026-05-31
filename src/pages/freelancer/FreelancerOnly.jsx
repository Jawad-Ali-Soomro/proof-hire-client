import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function FreelancerOnly({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "FREELANCER") {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, user, navigate]);

  if (loading || !user || user.role !== "FREELANCER") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Loading…</p>
      </div>
    );
  }

  return <div className="min-w-0">{children}</div>;
}
