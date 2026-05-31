import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PiWalletDuotone, PiX } from "react-icons/pi";
import { useAuth } from "../../context/AuthContext.jsx";
import { useWallet } from "../../context/WalletContext.jsx";
import { getAvailableWallets, RECOMMENDED_WALLETS } from "../../utils/wallet.js";

export default function ConnectWalletModal({ open, onDismiss }) {
  const { linkWalletToAccount } = useAuth();
  const { connectWallet } = useWallet();
  const [step, setStep] = useState("prompt");
  const [wallets, setWallets] = useState([]);
  const [selectedName, setSelectedName] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setStep("prompt");
    setWallets(getAvailableWallets());
    setSelectedName("");
    setConnecting(false);
    setError("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const onLinkWallet = async (walletMeta) => {
    setConnecting(true);
    setError("");
    setSelectedName(walletMeta.name);
    try {
      const connected = await connectWallet(walletMeta);
      if (!connected) {
        setError("Could not connect. Approve the request in your wallet extension.");
        return;
      }

      await linkWalletToAccount(connected.address, connected.chainId);
      onDismiss?.();
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Failed to link wallet. Try again or pick another wallet.";
      setError(message);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="connect-wallet-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            aria-label="Close"
            onClick={onDismiss}
          />

          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
          >
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#26b69c]/15 text-[#26b69c]">
                  <PiWalletDuotone size={22} aria-hidden />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#26b69c]">Wallet required</p>
                  <h2 id="connect-wallet-title" className="text-lg font-bold text-slate-900 dark:text-white">
                    Connect your wallet
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onDismiss}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-800"
                aria-label="Close dialog"
              >
                <PiX size={20} />
              </button>
            </div>

            <div className="px-5 py-5">
              {step === "prompt" ? (
                <div className="space-y-4">
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    You must connect a wallet to post projects, submit bids, and manage contracts on Proof Hire.
                  </p>
                  <motion.button
                    type="button"
                    onClick={() => setStep("pick")}
                    className="w-full rounded-xl bg-[#26b69c] px-5 py-3 text-sm font-bold capitalize text-white shadow-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    Link wallet
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Choose a wallet extension installed in your browser.
                  </p>

                  {error ? (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                      {error}
                    </p>
                  ) : null}

                  {wallets.length ? (
                    <ul className="flex max-h-56 flex-col gap-2 overflow-y-auto">
                      {wallets.map((w) => (
                        <li key={w.name}>
                          <motion.button
                            type="button"
                            disabled={connecting}
                            onClick={() => onLinkWallet(w)}
                            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition disabled:opacity-60 ${
                              selectedName === w.name && connecting
                                ? "border-[#26b69c] bg-[#26b69c]/10"
                                : "border-slate-200 hover:border-[#26b69c]/50 dark:border-gray-700"
                            }`}
                            whileTap={{ scale: 0.98 }}
                          >
                            <span className="flex items-center gap-3">
                              <img src={w.icon} alt="" className="h-8 w-8 object-contain" />
                              <span className="text-sm font-semibold text-slate-900 dark:text-white">{w.name}</span>
                            </span>
                            <span className="text-xs font-bold uppercase text-[#26b69c]">
                              {connecting && selectedName === w.name ? "Linking…" : "Connect"}
                            </span>
                          </motion.button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-center dark:border-gray-700 dark:bg-gray-900/50">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        No wallet extension detected.
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Install one of the wallets below, then return and tap Link wallet again.
                      </p>
                    </div>
                  )}

                  <div className="border-t border-slate-200 pt-4 dark:border-gray-800">
                    <p className="mb-3 text-center text-xs font-semibold capitalize text-slate-500">
                      Need a wallet?
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {RECOMMENDED_WALLETS.map((w) => (
                        <a
                          key={w.name}
                          href={w.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 rounded-full border border-slate-200 p-2 transition hover:border-[#26b69c]/40 dark:border-gray-700"
                        >
                          <img src={w.icon} alt="" className="h-6 w-6 object-contain" />
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{w.name}</span>
                        </a>
                      ))}
                    </div>
                  </div>

                 
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
