import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getAvailableWallets } from "../utils/wallet.js";

const WalletContext = createContext(null);
const STORAGE_KEY = "proof-hire-wallet";

function normalizeAddress(addr) {
  if (!addr || typeof addr !== "string") return null;
  const t = addr.trim().toLowerCase();
  return /^0x[a-f0-9]{40}$/.test(t) ? t : null;
}

function normalizeAccountList(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  const seen = new Set();
  for (const a of raw) {
    const n = normalizeAddress(a);
    if (n && !seen.has(n)) {
      seen.add(n);
      out.push(n);
    }
  }
  return out;
}

function getStoredWallet() {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object") return null;
    const addr = normalizeAddress(parsed.address);
    if (!addr) return null;
    let accounts = normalizeAccountList(parsed.accounts);
    if (!accounts.length) accounts = [addr];
    if (!accounts.includes(addr)) accounts = [addr, ...accounts];
    return {
      ...parsed,
      address: addr,
      accounts,
    };
  } catch {}
  return null;
}

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(getStoredWallet);

  // persist
  useEffect(() => {
    try {
      if (wallet) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(wallet));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {}
  }, [wallet]);

  // Re-sync authorized accounts from the extension (e.g. user added a second account in MetaMask).
  const refreshAuthorizedAccounts = useCallback(async () => {
    if (!wallet?.name) return;
    const matched = getAvailableWallets().find((w) => w.name === wallet.name);
    const provider = matched?.provider;
    if (!provider?.request) return;
    try {
      const accs = await provider.request({ method: "eth_accounts" });
      const normalized = normalizeAccountList(accs);
      if (!normalized.length) return;
      setWallet((prev) => {
        if (!prev) return prev;
        const cur = normalizeAddress(prev.address);
        const nextAddr = cur && normalized.includes(cur) ? cur : normalized[0];
        return { ...prev, accounts: normalized, address: nextAddr };
      });
    } catch (e) {
      console.error("eth_accounts failed:", e);
    }
  }, [wallet?.name]);

  // After restore from localStorage, pull the full permitted account list from the provider.
  useEffect(() => {
    if (!wallet?.name) return;
    const matched = getAvailableWallets().find((w) => w.name === wallet.name);
    if (!matched?.provider?.request) return;
    let cancelled = false;
    (async () => {
      try {
        const accs = await matched.provider.request({ method: "eth_accounts" });
        if (cancelled) return;
        const normalized = normalizeAccountList(accs);
        if (!normalized.length) return;
        setWallet((prev) => {
          if (!prev) return prev;
          const cur = normalizeAddress(prev.address);
          const nextAddr = cur && normalized.includes(cur) ? cur : normalized[0];
          return { ...prev, accounts: normalized, address: nextAddr };
        });
      } catch {
        /* extension not ready or no permission yet */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [wallet?.name]);

  // listen for account / permission changes on the same injected provider we connected with
  useEffect(() => {
    if (!wallet?.name) return;
    const matched = getAvailableWallets().find((w) => w.name === wallet.name);
    const provider = matched?.provider;
    if (!provider?.on) return;

    const handleAccountsChanged = (accounts) => {
      if (!accounts.length) {
        setWallet(null);
        return;
      }
      const incoming = normalizeAccountList(accounts);
      setWallet((prev) => {
        if (!prev) return null;
        const prevList = normalizeAccountList(prev.accounts);
        const merged = [...incoming];
        for (const a of prevList) {
          if (!merged.includes(a)) merged.push(a);
        }
        const cur = normalizeAddress(prev.address);
        const nextAddr =
          cur && incoming.includes(cur) ? cur : incoming[0] ?? cur ?? merged[0];
        return {
          ...prev,
          accounts: merged.length ? merged : incoming,
          address: nextAddr ?? prev.address,
        };
      });
    };

    provider.on("accountsChanged", handleAccountsChanged);
    return () => {
      provider.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, [wallet?.name]);

  // connect
  const connectWallet = useCallback(async (walletMeta) => {
    try {
      if (!walletMeta?.provider) throw new Error("Invalid wallet");

      const provider = walletMeta.provider;

      const rawAccounts = await provider.request({
        method: "eth_requestAccounts",
      });

      const accounts = normalizeAccountList(rawAccounts);
      if (!accounts.length) throw new Error("No accounts returned");

      const chainId = await provider.request({
        method: "eth_chainId",
      });

      const newWallet = {
        address: accounts[0],
        accounts,
        chainId,
        name: walletMeta.name,
        icon: walletMeta.icon,
      };

      setWallet(newWallet);
      return newWallet;
    } catch (err) {
      console.error("Wallet connect error:", err);
      return null;
    }
  }, []);

  const switchAccount = useCallback((nextAddress) => {
    const next = normalizeAddress(nextAddress);
    if (!next) return;
    setWallet((prev) => {
      if (!prev) return prev;
      const list = normalizeAccountList(prev.accounts);
      const allowed = list.length ? list : [normalizeAddress(prev.address)].filter(Boolean);
      if (!allowed.includes(next)) return prev;
      return { ...prev, address: next };
    });
  }, []);

  // disconnect
  const disconnectWallet = useCallback(() => {
    setWallet(null);
  }, []);

  const accounts = useMemo(() => {
    if (!wallet) return [];
    const list = normalizeAccountList(wallet.accounts);
    const addr = normalizeAddress(wallet.address);
    if (addr && !list.includes(addr)) return [addr, ...list];
    return list.length ? list : addr ? [addr] : [];
  }, [wallet]);

  const address = wallet?.address ? normalizeAddress(wallet.address) : null;

  const value = useMemo(
    () => ({
      wallet,
      address,
      accounts,
      isConnected: !!wallet,
      connectWallet,
      disconnectWallet,
      switchAccount,
      refreshAuthorizedAccounts,
    }),
    [
      wallet,
      address,
      accounts,
      connectWallet,
      disconnectWallet,
      switchAccount,
      refreshAuthorizedAccounts,
    ]
  );

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}