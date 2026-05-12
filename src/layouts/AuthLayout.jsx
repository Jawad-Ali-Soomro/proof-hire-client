import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
import Sidebar from "../components/dashboard/Sidebar.jsx";
import Topbar from "../components/dashboard/Topbar.jsx";
import Header from "../components/Header.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useWallet } from "../context/WalletContext.jsx";

export default function AuthLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected, disconnectWallet } = useWallet();
  const { loading, profileComplete, logoutSession } = useAuth();

  useEffect(() => {
    if (!loading && !isConnected) {
      navigate("/", { replace: true });
    }
  }, [loading, isConnected, navigate]);

  useEffect(() => {
    if (loading || !isConnected) return;
    if (!profileComplete && location.pathname !== "/dashboard/onboarding") {
      navigate("/dashboard/onboarding", { replace: true });
    }
  }, [loading, isConnected, profileComplete, location.pathname, navigate]);

  const profileLabel = useMemo(
    () => (profileComplete ? "Profile / Dashboard" : "Complete profile"),
    [profileComplete],
  );

  const onOpenProfile = () => {
    navigate(profileComplete ? "/dashboard/profile" : "/dashboard/onboarding");
  };

  const onLogout = () => {
    logoutSession();
    disconnectWallet();
    navigate("/", { replace: true });
  };

  if (!loading && isConnected && !profileComplete) {
    return (
      <>
        <Header />
        <Outlet />
      </>
    );
  }

  return (
    <div className="min-h-screen dark:bg-gray-900">
      <div className="flex">
        <Sidebar />

        <div className="flex-1 min-w-0">
          <Topbar
            onToggleSidebar={() => {}}
            onOpenProfile={onOpenProfile}
            onLogout={onLogout}
            profileLabel={profileLabel}
          />

          <main className="px-4 py-6 sm:px-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

