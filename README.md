# Solana Token Launchpad

<img width="1440" height="1024" alt="V2 Cominggain" src="https://github.com/user-attachments/assets/c6465da9-e65f-43eb-858e-4261946a87cf" />


Create your own SPL tokens on **Solana Devnet** using the **Token-2022** program with built-in metadata — no Metaplex needed.

## Features

- 🔗 Connect wallet (Phantom / Backpack)
- 🚀 Create tokens with Token-2022 program
- 📝 Add metadata directly on the mint (name, symbol, image, description)
- 🌐 Everything runs on Devnet

## Tech Stack

- React + Vite
- @solana/web3.js
- @solana/spl-token (Token-2022)
- @solana/spl-token-metadata

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

## Prerequisites

1. Install [Phantom](https://phantom.app) or [Backpack](https://backpack.app) or [Saifu](https://saifu-flax.vercel.app/) wallet extension
2. Switch wallet network to **Devnet**
3. Get free Devnet SOL from [faucet.solana.com](https://faucet.solana.com)

## How It Works

1. Connect your wallet
2. Fill in token details (name, symbol, decimals, supply, image URL, description)
3. Click **Create Token**
4. View your new token on [Solana Explorer](https://explorer.solana.com/?cluster=devnet)

## License

MIT

