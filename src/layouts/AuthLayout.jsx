import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/dashboard/Sidebar.jsx";
import Topbar from "../components/dashboard/Topbar.jsx";
import Header from "../components/Header.jsx";
import ConnectWalletModal from "../components/wallet/ConnectWalletModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useWallet } from "../context/WalletContext.jsx";
import { SidebarProvider, useSidebar } from "../context/SidebarContext.jsx";
import { NotificationsProvider } from "../context/NotificationsContext.jsx";
import { ChatSocketProvider } from "../context/ChatSocketContext.jsx";

export default function AuthLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { disconnectWallet } = useWallet();
  const { loading, isAuthenticated, profileComplete, logoutSession } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (loading || !isAuthenticated) return;
    if (!profileComplete && location.pathname !== "/dashboard/onboarding") {
      navigate("/dashboard/onboarding", { replace: true });
    }
  }, [loading, isAuthenticated, profileComplete, location.pathname, navigate]);

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
    navigate("/login", { replace: true });
  };

  if (loading) return null;

  if (isAuthenticated && !profileComplete) {
    return (
      <>
        <Header />
        <Outlet />
      </>
    );
  }

  return (
    <NotificationsProvider>
      <ChatSocketProvider>
        <SidebarProvider>
          <DashboardShell
            onOpenProfile={onOpenProfile}
            onLogout={onLogout}
            profileLabel={profileLabel}
          />
        </SidebarProvider>
      </ChatSocketProvider>
    </NotificationsProvider>
  );
}

function DashboardShell({ onOpenProfile, onLogout, profileLabel }) {
  const { toggle } = useSidebar();
  const { isWalletLinked } = useAuth();
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  useEffect(() => {
    if (!isWalletLinked) setWalletModalOpen(true);
  }, [isWalletLinked]);

  return (
    <div className="min-h-screen">
      <ConnectWalletModal
        open={walletModalOpen && !isWalletLinked}
        onDismiss={() => setWalletModalOpen(false)}
      />
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Topbar
            onToggleSidebar={toggle}
            onOpenProfile={onOpenProfile}
            onLogout={onLogout}
            profileLabel={profileLabel}
            onConnectWallet={() => setWalletModalOpen(true)}
            walletConnected={isWalletLinked}
          />

          <main className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

