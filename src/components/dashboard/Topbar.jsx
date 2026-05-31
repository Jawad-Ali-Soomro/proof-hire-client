import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PiListDuotone, PiMoonDuotone, PiSignOut, PiSunDuotone, PiUserDuotone, PiWalletDuotone } from "react-icons/pi";
import NotificationBell from "./NotificationBell.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext";

export default function Topbar({
  onToggleSidebar,
  onOpenProfile,
  onLogout,
  profileLabel,
  onConnectWallet,
  walletConnected = true,
}) {
  const { user } = useAuth();
  const rawAvatar = user?.profile?.avatar;
  const avatarUrl = rawAvatar == null ? "" : String(rawAvatar).trim();
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    setAvatarFailed(false);
  }, [avatarUrl]);

  const { theme, toggleTheme } = useTheme();
  const iconTransition = {
    type: "spring",
    stiffness: 420,
    damping: 28,
  };
  return (
    <header className="sticky top-0 icon z-40 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-700 dark:bg-gray-900/85">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
      <motion.button
        type="button"
        onClick={onToggleSidebar}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:border-[#26b69c]/35 hover:bg-[#26b69c]/10 hover:text-[#156b59] dark:border-gray-700 dark:text-slate-200 dark:hover:bg-[#26b69c]/15"
        whileTap={{ scale: 0.96 }}
        aria-label="Toggle sidebar"
      >
        <PiListDuotone size={22} aria-hidden />
      </motion.button>
      <div className="min-w-0 hidden sm:block">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#26b69c]">Workspace</p>
        <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
          {user?.profile?.fullName || user?.username || "Dashboard"}
        </p>
      </div>
    </div>
        <div className="flex items-center gap-2">
        <NotificationBell />
          {!walletConnected ? (
            <>
              <motion.button
                type="button"
                onClick={onConnectWallet}
                title="Link wallet"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#26b69c]/40 bg-[#26b69c]/10 text-[#156b59] sm:hidden dark:text-[#56d9c0]"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.94 }}
                aria-label="Link wallet"
              >
                <PiWalletDuotone size={20} aria-hidden />
              </motion.button>
              <motion.button
                type="button"
                onClick={onConnectWallet}
                title="Link wallet"
                className="hidden items-center gap-2 rounded-xl border border-[#26b69c]/40 bg-[#26b69c]/10 px-3 py-2 text-xs font-bold capitalize text-[#156b59] sm:flex dark:text-[#56d9c0]"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.94 }}
              >
                <PiWalletDuotone size={18} aria-hidden />
                Link wallet
              </motion.button>
            </>
          ) : null}
          <motion.button
              onClick={toggleTheme}
              className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.92 }}
              transition={iconTransition}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  className="absolute"
                  initial={{ opacity: 0, rotate: -75, scale: 0.6 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 75, scale: 0.6 }}
                >
                  {theme === "dark" ? (
                    <PiSunDuotone size={20} />
                  ) : (
                    <PiMoonDuotone size={20} />
                  )}
                </motion.span>
              </AnimatePresence>
          </motion.button>
          <motion.button
            type="button"
            onClick={onOpenProfile}
            title={profileLabel || "Profile"}
            className={`flex h-11 w-11 items-center border overflow-hidden justify-center overflow-hidden rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800`}
            whileTap={{ scale: 0.98 }}
          >
            {avatarUrl && !avatarFailed ? (
              <img
                src={avatarUrl}
                alt=""
                className="h-10 w-10 rounded-xl object-contain"
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              <PiUserDuotone size={20} />
            )}
          </motion.button>

          <motion.button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 w-11 h-11 rounded-xl bg-red-500 flex items-center justify-center text-sm font-black text-white hover:bg-red-600"
            whileTap={{ scale: 0.98 }}
          >
            <PiSignOut size={20} />
          </motion.button>
        </div>
      </div>
    </header>
  );
}

