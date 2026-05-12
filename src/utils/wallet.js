const WALLET_CONFIG = {
    Metamask: {
        icon: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
    },
    "Trust Wallet": {
        icon: "https://trustwallet.com/assets/images/media/assets/TWT.png",
    },
    "Coinbase Wallet": {
        icon: "https://avatars.githubusercontent.com/u/18060234?s=200&v=4",
    },
    Unknown: {
        icon: "https://via.placeholder.com/40",
    },
};

/** Official / download pages for “Visit wallet” in the UI */
const WALLET_HOME_URLS = {
    Metamask: "https://metamask.io/",
    "Trust Wallet": "https://trustwallet.com/",
    "Coinbase Wallet": "https://www.coinbase.com/wallet",
};

/**
 * Brand icon for a wallet name (Metamask fox, Trust logo, etc.).
 * Use when rendering the connected wallet so the icon stays correct after reload.
 */
export function getWalletIconByName(name) {
    if (!name) return WALLET_CONFIG.Unknown.icon;
    return WALLET_CONFIG[name]?.icon ?? WALLET_CONFIG.Unknown.icon;
}

export function getWalletHomeUrl(name) {
    if (!name) return null;
    return WALLET_HOME_URLS[name] ?? null;
}

/** Human-readable native token label for common EVM chains */
export function getNativeCurrencyLabel(chainIdHex) {
    const id = (chainIdHex || "").toLowerCase();
    if (id === "0x89" || id === "0x13881") return "MATIC";
    if (id === "0x38" || id === "0x61") return "BNB";
    return "ETH";
}

export function formatWeiBalanceHex(hexWei) {
    if (!hexWei || typeof hexWei !== "string") return "—";
    try {
        const wei = BigInt(hexWei);
        if (wei === 0n) return "0";
        const asEth = Number(wei) / 1e18;
        if (!Number.isFinite(asEth)) return "—";
        if (asEth > 0 && asEth < 1e-8) return "<0.00000001";
        return asEth.toLocaleString(undefined, {
            maximumFractionDigits: 6,
            minimumFractionDigits: 0,
        });
    } catch {
        return "—";
    }
}

export const getAvailableWallets = () => {
    if (!window.ethereum) return [];

    const providers = window.ethereum.providers || [window.ethereum];

    return providers.map((provider) => {
        let name = "Unknown";

        if (provider.isMetaMask) name = "Metamask";
        else if (provider.isTrust) name = "Trust Wallet";
        else if (provider.isCoinbaseWallet) name = "Coinbase Wallet";

        return {
            name,
            icon: WALLET_CONFIG[name]?.icon || WALLET_CONFIG.Unknown.icon,
            provider,
        };
    });
};

export const RECOMMENDED_WALLETS = [
    {
        name: "Metamask",
        icon: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
        url: "https://metamask.io/download/",
    },
    {
        name: "Trust Wallet",
        icon: "https://trustwallet.com/assets/images/media/assets/TWT.png",
        url: "https://trustwallet.com/download",
    },
    {
        name: "Coinbase",
        icon: "https://avatars.githubusercontent.com/u/18060234?s=200&v=4",
        url: "https://www.coinbase.com/wallet/downloads",
    },
];

export const getWalletAddress = async (provider) => {
    return await provider.request({ method: 'eth_requestAccounts' });
}