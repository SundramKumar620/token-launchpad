import { Connection, clusterApiUrl } from '@solana/web3.js';

const NETWORK = 'devnet';
const connection = new Connection(clusterApiUrl(NETWORK), 'confirmed');

/**
 * Detect a Solana wallet provider (Phantom or Backpack).
 * Returns the provider object or null.
 */
export function getProvider() {
    if (window?.phantom?.solana?.isPhantom) {
        return window.phantom.solana;
    }
    if (window?.solana?.isPhantom) {
        return window.solana;
    }
    if (window?.backpack?.isBackpack) {
        return window.backpack;
    }
    return null;
}

/**
 * Connect to the wallet and return the public key.
 */
export async function connectWallet() {
    const provider = getProvider();
    if (!provider) {
        throw new Error('No Solana wallet found. Please install Phantom or Backpack.');
    }
    const resp = await provider.connect();
    return resp.publicKey;
}

/**
 * Disconnect the wallet.
 */
export async function disconnectWallet() {
    const provider = getProvider();
    if (provider) {
        await provider.disconnect();
    }
}

export { connection, NETWORK };
