import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const WalletContext = createContext(null);
const STORAGE_KEY = "proof-hire-wallet";

function getStoredWallet() {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
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

  // listen for account change
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (!accounts.length) {
        setWallet(null);
      } else {
        setWallet((prev) => ({
          ...prev,
          address: accounts[0],
        }));
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum.removeListener(
        "accountsChanged",
        handleAccountsChanged
      );
    };
  }, []);

  // connect
  const connectWallet = useCallback(async (walletMeta) => {
    try {
      if (!walletMeta?.provider) throw new Error("Invalid wallet");

      const provider = walletMeta.provider;

      const accounts = await provider.request({
        method: "eth_requestAccounts",
      });

      const chainId = await provider.request({
        method: "eth_chainId",
      });

      const newWallet = {
        address: accounts[0],
        chainId,
        name: walletMeta.name,
        icon: walletMeta.icon
      };

      setWallet(newWallet);
      return newWallet;
    } catch (err) {
      console.error("Wallet connect error:", err);
      return null;
    }
  }, []);

  // disconnect
  const disconnectWallet = useCallback(() => {
    setWallet(null);
  }, []);

  const value = useMemo(
    () => ({
      wallet,
      address: wallet?.address || null,
      isConnected: !!wallet,
      connectWallet,
      disconnectWallet,
    }),
    [wallet, connectWallet, disconnectWallet]
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