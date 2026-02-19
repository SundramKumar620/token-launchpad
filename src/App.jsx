import React, { useState, useCallback } from 'react';
import WalletConnect from './components/WalletConnect.jsx';
import TokenForm from './components/TokenForm.jsx';
import ResultCard from './components/ResultCard.jsx';
import { connectWallet, disconnectWallet } from './utils/wallet.js';
import { createToken } from './utils/createToken.js';

export default function App() {
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [mintAddress, setMintAddress] = useState('');
    const [error, setError] = useState('');

    const handleConnect = useCallback(async () => {
        try {
            const pubkey = await connectWallet();
            setWallet(pubkey.toBase58());
            setError('');
        } catch (err) {
            setError(err.message);
        }
    }, []);

    const handleDisconnect = useCallback(async () => {
        await disconnectWallet();
        setWallet(null);
        setMintAddress('');
        setStatus('');
        setError('');
    }, []);

    const handleCreateToken = useCallback(
        async (formData) => {
            setLoading(true);
            setError('');
            setMintAddress('');
            setStatus('');

            try {
                const mint = await createToken({
                    ...formData,
                    onStatus: (s) => setStatus(s),
                });
                setMintAddress(mint);
                setStatus('');
            } catch (err) {
                console.error(err);
                setError(err.message || 'Something went wrong');
                setStatus('');
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return (
        <>
            {/* Header */}
            <header className="header">
                <div className="header-logo">
                    <img src="logo.png" alt="logo" className='logo'/>
                    <h1>Token Launchpad</h1>
                    <span className="header-badge">DEVNET</span>
                </div>
                <WalletConnect
                    wallet={wallet}
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                />
            </header>

            {/* Main */}
            <main className="main">
                <div className="card">
                    <h2 className="card-title">Create a New Token</h2>
                    <p className="card-subtitle">
                        Launch your own SPL token on Solana Devnet using Token-2022
                    </p>

                    <TokenForm
                        disabled={!wallet}
                        loading={loading}
                        onSubmit={handleCreateToken}
                    />

                    {/* Status */}
                    {status && (
                        <div className="status-bar">
                            <span className="spinner-sm" />
                            {status}
                        </div>
                    )}

                    {/* Error */}
                    {error && <div className="error-card">⚠️ {error}</div>}

                    {/* Result */}
                    {mintAddress && <ResultCard mintAddress={mintAddress} />}
                </div>
            </main>
        </>
    );
}
