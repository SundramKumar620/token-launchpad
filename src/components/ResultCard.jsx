import React from 'react';

export default function ResultCard({ mintAddress }) {
    const explorerUrl = `https://explorer.solana.com/address/${mintAddress}?cluster=devnet`;

    return (
        <div className="result-card">
            <h3>✅ Token Created Successfully!</h3>
            <div className="mint-address">{mintAddress}</div>
            <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                View on Solana Explorer
            </a>
        </div>
    );
}
