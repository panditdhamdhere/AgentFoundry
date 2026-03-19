# Agent Registry

No-code ERC-8004 AI agent registration. Register your AI agents on-chain with a simple form—give them portable identity, discoverable endpoints, and composable reputation.

## Features

- **Wallet Connect** — Connect with MetaMask, WalletConnect, or any supported wallet
- **No-Code Registration** — Fill in a form; we handle IPFS upload and on-chain registration
- **Multi-Service Support** — Add MCP, A2A, web, and other endpoint types
- **Image Upload** — Upload agent avatars to IPFS or use a URL
- **Base Sepolia** — Deployed on Base Sepolia testnet (ERC-8004)

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Wagmi + RainbowKit (Web3)
- viem
- Pinata (IPFS)

## Setup

1. **Clone and install**

   ```bash
   cd Micro-SAAS
   npm install
   ```

2. **Configure environment**

   Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

   Fill in:

   - `PINATA_JWT` — From [Pinata](https://pinata.cloud/) API keys
   - `PINATA_GATEWAY` — Your Pinata gateway domain (e.g. `your-gateway.mypinata.cloud`)
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` — From [WalletConnect Cloud](https://cloud.walletconnect.com/)

3. **Get testnet ETH**

   Use [Alchemy Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia) to get testnet ETH for gas.

4. **Run the app**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## ERC-8004

This app uses the [ERC-8004 Trustless Agents](https://eips.ethereum.org/EIPS/eip-8004) standard:

- **Identity Registry** — ERC-721 based agent NFTs
- **Reputation Registry** — On-chain feedback (not yet implemented in this UI)
- **Validation Registry** — Independent verification (not yet implemented)

Contract addresses:

- Base Sepolia: `0x8004A818BFB912233c491871b3d84c89A494BD9e`
- Base Mainnet: `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`

## License

MIT
