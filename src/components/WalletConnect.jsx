import React from 'react';

export default function WalletConnect({ wallet, onConnect, onDisconnect }) {
    if (wallet) {
        const shortAddr =
            wallet.slice(0, 4) + '...' + wallet.slice(-4);

        return (
            <button
                className="btn-wallet connected"
                onClick={onDisconnect}
                title="Click to disconnect"
            >
                <span className="wallet-dot" />
                {shortAddr}
            </button>
        );
    }

    return (
        <button className="btn-wallet" onClick={onConnect}>
            Connect Wallet
        </button>
    );
}
