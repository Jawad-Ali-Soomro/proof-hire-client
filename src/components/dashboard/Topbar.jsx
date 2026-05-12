import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PiBellDuotone, PiMoonDuotone, PiSignOut, PiSunDuotone, PiUserDuotone } from "react-icons/pi";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext";

export default function Topbar({
  onToggleSidebar,
  onOpenProfile,
  onLogout,
  profileLabel,
}) {
  const { user } = useAuth();
  const avatarUrl = user?.profile?.avatar?.trim() || "";
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
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-700 dark:bg-gray-900/85">
      <div className="flex h-16 items-center justify-end px-4 sm:px-6">

        <div className="flex items-center gap-2">
        <motion.button
            type="button"
            className="flex items-center gap-2 w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold border border-gray-200 dark:border-gray-700"
            whileTap={{ scale: 0.98 }}
          >
            <PiBellDuotone size={20} />
          </motion.button>
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
            className={`flex h-11 w-11 items-center overflow-hidden justify-center overflow-hidden rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 ${avatarUrl && !avatarFailed ? "border-none" : ""}`}
            whileTap={{ scale: 0.98 }}
          >
            {avatarUrl && !avatarFailed ? (
              <img
                src={avatarUrl}
                alt=""
                className="h-11 w-11 rounded-xl object-contain"
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

