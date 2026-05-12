import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  PiArrowRight,
  PiArrowUpRightDuotone,
  PiLinkBreakDuotone,
  PiList,
  PiMoonDuotone,
  PiSignOut,
  PiSunDuotone,
  PiUserDuotone,
  PiWalletDuotone,
  PiX,
} from "react-icons/pi";
import { useTheme } from "../context/ThemeContext.jsx";
import {
  formatWeiBalanceHex,
  getAvailableWallets,
  getNativeCurrencyLabel,
  getWalletHomeUrl,
  getWalletIconByName,
  RECOMMENDED_WALLETS,
} from "../utils/wallet.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { useWallet } from "../context/WalletContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const iconTransition = {
  type: "spring",
  stiffness: 420,
  damping: 28,
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { connectWallet, address, isConnected, wallet, disconnectWallet } =
    useWallet();
  const { loading: authLoading, profileComplete } = useAuth();

  const [showWallets, setShowWallets] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [availableWallets, setAvailableWallets] = useState([]);
  const [nativeBalanceHex, setNativeBalanceHex] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  const walletMenuRef = useRef(null);

  const resolveInjectedProvider = useCallback(() => {
    const injectors = getAvailableWallets();
    const matched =
      injectors.find((w) => w.name === wallet?.name) ?? injectors[0];
    return matched?.provider ?? window.ethereum;
  }, [wallet?.name]);

  const openWalletExtension = async () => {
    const provider = resolveInjectedProvider();
    if (!provider?.request) return;
    try {
      await provider.request({ method: "eth_requestAccounts" });
    } catch (error) {
      console.error(error);
    }
  };

  const openConnectModal = () => {
    setAvailableWallets(getAvailableWallets());
    setShowWallets(true);
  };

  const openProfileDestination = () => {
    if (authLoading) return;
    if (profileComplete) navigate("/dashboard");
    else navigate("/dashboard/onboarding");
  };

  const handleUserSection = () => {
    if (!isConnected) {
      openConnectModal();
      return;
    }
    openProfileDestination();
  };

  const connectedWalletIcon =
    getWalletIconByName(wallet?.name) || wallet?.icon || null;
  const walletHomeUrl = getWalletHomeUrl(wallet?.name);

  const refreshWalletBalance = useCallback(async () => {
    if (!address) return;
    setBalanceLoading(true);
    setNativeBalanceHex(null);
    try {
      const provider = resolveInjectedProvider();
      if (!provider?.request) return;
      const hex = await provider.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });
      setNativeBalanceHex(hex);
    } catch {
      setNativeBalanceHex(null);
    } finally {
      setBalanceLoading(false);
    }
  }, [address, resolveInjectedProvider]);

  const toggleWalletMenu = () => {
    setShowWalletMenu((prev) => {
      const next = !prev;
      if (next) void refreshWalletBalance();
      return next;
    });
  };

  useEffect(() => {
    if (!showWalletMenu) return;

    const onPointerDown = (e) => {
      if (walletMenuRef.current && !walletMenuRef.current.contains(e.target)) {
        setShowWalletMenu(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [showWalletMenu]);

  useEffect(() => {
    if (!isConnected || authLoading) return;
    const target = profileComplete ? "/dashboard" : "/dashboard/onboarding";
    if (location.pathname !== target) {
      navigate(target, { replace: true });
    }
  }, [isConnected, authLoading, profileComplete, location.pathname, navigate]);

  return (
    <div>
      <h1 className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-20 py-6">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <img className="w-12" src="/logo.svg" alt="" />
          <h1 className="text-xl font-bold text-[#26b69c]">Proof Hire</h1>
        </div>

        {/* Nav */}
        <div className="flex gap-5">
          

          {/* Actions */}
          <div className="flex items-center gap-5">
            {
              isConnected && profileComplete &&
            <motion.button
              type="button"
              onClick={handleUserSection}
              title={
                !isConnected
                  ? "Connect wallet to manage your profile"
                  : profileComplete
                    ? "Open dashboard"
                    : "Continue profile setup"
              }
              className="flex h-12 w-12 items-center justify-center rounded-full border border-[#26b69c]"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.92 }}
              transition={iconTransition}
            >
              <PiUserDuotone aria-hidden />
            </motion.button>
            }

            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[#26b69c]"
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

            {/* Wallet: brand icon when connected + menu; Connect otherwise */}
            {isConnected ? (
              <div className="relative" ref={walletMenuRef}>
                <motion.button
                  type="button"
                  onClick={toggleWalletMenu}
                  aria-expanded={showWalletMenu}
                  aria-haspopup="menu"
                  aria-label="Wallet menu"
                  title={`${wallet?.name ?? "Wallet"} — ${address ?? ""}`}
                  className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[#26b69c] bg-white dark:bg-gray-900"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.92 }}
                  transition={iconTransition}
                >
                  {connectedWalletIcon ? (
                    <img
                      src={connectedWalletIcon}
                      alt=""
                      className="h-7 w-7 object-contain"
                    />
                  ) : (
                    <PiWalletDuotone className="text-xl text-[#26b69c]" />
                  )}
                </motion.button>

                {showWalletMenu && (
                  <div
                    className="absolute right-0 top-full z-[60] mt-2 w-[min(100vw-2rem,18rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900"
                    role="menu"
                  >
                    <div className="flex items-center gap-2 border-b border-gray-200 px-3 py-2.5 dark:border-gray-700">
                      <PiList
                        className="shrink-0 text-lg text-[#26b69c]"
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">
                          {wallet?.name ?? "Wallet"}
                        </p>
                        <p className="truncate font-mono text-xs text-gray-500 dark:text-gray-400">
                          {address
                            ? `${address.slice(0, 6)}…${address.slice(-4)}`
                            : ""}
                        </p>
                      </div>
                      <img
                        src={connectedWalletIcon}
                        alt=""
                        className="h-8 w-8 shrink-0 object-contain"
                      />
                    </div>

                    <div className="px-3 py-2.5 flex justify-between items-center">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Balance
                      </p>
                      <p className="text-[10px] font-bold text-[#26b69c]">
                        {balanceLoading
                          ? "…"
                          : `${formatWeiBalanceHex(nativeBalanceHex)} ${getNativeCurrencyLabel(wallet?.chainId)}`}
                      </p>
                    </div>

                    <div className="flex flex-col gap-0 border-t border-gray-200 dark:border-gray-700">
                      <button
                        type="button"
                        role="menuitem"
                        className="w-full flex items-center gap-2 h-12 px-3 py-2.5 text-left text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={async () => {
                          await openWalletExtension();
                          setShowWalletMenu(false);
                        }}
                      >
                        <PiArrowUpRightDuotone />
                        Open {wallet?.name ?? "wallet"}
                      </button>
                      {walletHomeUrl ? (
                        <a
                          role="menuitem"
                          href={walletHomeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block flex items-center gap-2 h-12 px-3 py-2.5 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => setShowWalletMenu(false)}
                        >
                          <PiLinkBreakDuotone />
                          Visit wallet
                        </a>
                      ) : null}
                      <button
                        type="button"
                        role="menuitem"
                        className="w-full flex items-center gap-2 h-12 px-3 py-2.5 text-left text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => {
                          openProfileDestination();
                          setShowWalletMenu(false);
                        }}
                      >
                        <PiUserDuotone />
                        {profileComplete ? "Profile / Dashboard" : "Complete profile"}
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="w-full flex items-center gap-2 h-12 border-t border-gray-200 px-3 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-gray-700 dark:hover:bg-red-950/30"
                        onClick={() => {
                          disconnectWallet();
                          setShowWalletMenu(false);
                        }}
                      >
                        <PiSignOut />
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <motion.button
                type="button"
                onClick={openConnectModal}
                className="flex h-12 min-w-[150px] items-center justify-center gap-2 rounded-full bg-[#26b69c] px-5 font-bold text-white"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={iconTransition}
              >
                Connect
              </motion.button>
            )}
          </div>
        </div>
      </h1>

      {/* Wallet Modal */}
      {showWallets && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-[20px] p-5 flex flex-col gap-4">
            {/* Header */}
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
              <p className="font-bold">Connect Wallet</p>
              <button onClick={() => setShowWallets(false)}>
                <PiX />
              </button>
            </div>

            {/* Wallets */}
            <div className="flex flex-col gap-3">
              {availableWallets.map((wallet) => {
                const isSelected = selectedWallet?.name === wallet.name;

                return (
                  <button
                    key={wallet.name}
                    onClick={async () => {
                      setSelectedWallet(wallet);
                      await connectWallet(wallet);
                      setShowWallets(false);
                    }}
                    className={`flex justify-between items-center px-5 py-3 rounded-full border ${
                      isSelected
                        ? "border-[#26b69c] bg-[#26b69c]/10"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={wallet.icon} className="w-8 h-8" />
                      <p className="text-sm font-semibold">{wallet.name}</p>
                    </div>

                    <input type="radio" checked={isSelected} readOnly />
                  </button>
                );
              })}
            </div>

            {/* Recommended */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="text-xs text-center capitalize font-semibold mb-3">
                Looking for another wallet?
              </p>

              <div className="grid grid-cols-3 gap-2">
                {RECOMMENDED_WALLETS.map((wallet) => (
                  <a
                    key={wallet.name}
                    href={wallet.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 border p-2 border-gray-200 dark:border-gray-700 rounded-full"
                  >
                    <img src={wallet.icon} className="w-6 h-6" />
                    <span className="text-[10px] font-bold">{wallet.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
