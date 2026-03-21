# Agent Registry

No-code ERC-8004 AI agent registration. Register your AI agents on-chain with a simple form—give them portable identity, discoverable endpoints, and composable reputation.

## Features

- **Wallet Connect** — Connect with MetaMask, WalletConnect, or any supported wallet
- **No-Code Registration** — Fill in a form; we handle IPFS upload and on-chain registration
- **Multi-Service Support** — Add MCP, A2A, web, and other endpoint types
- **Image Upload** — Upload agent avatars to IPFS or use a URL
- **Multi-chain** — 40+ networks: Base, Ethereum, Polygon, Arbitrum, Optimism, Avalanche, BSC, Scroll, Linea, and more (ERC-8004)

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

   Fill in (all required for production):

   - `PINATA_JWT` — From [Pinata](https://pinata.cloud/) API keys
   - `PINATA_GATEWAY` — Your Pinata gateway domain (e.g. `your-gateway.mypinata.cloud`)
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` — From [WalletConnect Cloud](https://cloud.walletconnect.com/)

   In production, missing vars will cause startup/runtime errors.

3. **Get testnet ETH** (for Base Sepolia / Sepolia)

   [Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia) · [Sepolia Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)

4. **Run the app**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Production Setup

Set these before public launch:

- **Core required**
  - `PINATA_JWT`
  - `PINATA_GATEWAY`
  - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- **Open registration**
  - `BETA_PUBLIC_REGISTRATION=true`
- **Rate limiting (multi-instance safe)**
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`
- **RPC reliability**
  - `NODE_RPC_URL_MAINNET`
  - `NODE_RPC_URL_BASE_SEPOLIA`
  - Optional per-chain format: `NODE_RPC_URL_<CHAIN_ID>` (example: `NODE_RPC_URL_8453`)
- **Monitoring (Sentry)**
  - `NEXT_PUBLIC_SENTRY_DSN`
  - `SENTRY_DSN`
  - `SENTRY_ORG`
  - `SENTRY_PROJECT`
  - `SENTRY_AUTH_TOKEN`

Recommended verification before launch:

1. `npm run build` passes in production mode
2. `/api/v1/*` routes respond and rate limit correctly
3. create-agent flow succeeds end-to-end on target chain
4. Sentry receives a test exception
5. webhook + API key behavior matches your intended access model

## ERC-8004

This app uses the [ERC-8004 Trustless Agents](https://eips.ethereum.org/EIPS/eip-8004) standard:

- **Identity Registry** — ERC-721 based agent NFTs
- **Reputation Registry** — Give and view feedback on agents (UI on agent page)
- **Validation Registry** — Independent verification UI (ready; registry deployment in progress per 8004 team)

Supported chains (40+ networks). Contract addresses via [ERC-8004 deterministic deployment](https://github.com/erc-8004/erc-8004-contracts):

- **Mainnets**: `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`
- **Testnets**: `0x8004A818BFB912233c491871b3d84c89A494BD9e`

Networks include: Ethereum, Base, Sepolia, Arbitrum, Optimism, Polygon, Avalanche, BSC, Celo, Gnosis, Linea, Mantle, Scroll, Metis, Taiko, XLayer, Abstract, Monad, and more. See [erc-8004-contracts](https://github.com/erc-8004/erc-8004-contracts) for the full list.

## License

MIT
