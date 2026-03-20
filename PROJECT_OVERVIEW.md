# AgentFoundry - Project Overview

## 1) What This Project Is

AgentFoundry is a micro-SaaS web app for registering AI agents on-chain using the ERC-8004 standard.
It gives builders a no-code UI and API to:

- register agent identity (ERC-721 based)
- publish agent metadata (Agent Card) to IPFS
- set the on-chain URI for discoverability
- collect and surface reputation context

In simple terms: AgentFoundry helps turn an AI agent into a portable, verifiable, chain-native identity that can be discovered and evaluated across ecosystems.

---

## 2) Core Product Goals

- Make ERC-8004 onboarding easy for non-smart-contract users.
- Support multi-chain registration with a single app experience.
- Provide both UI and API/SDK paths for builders and integrations.
- Keep production safety basics in place (rate limits, auth, env checks, security headers, monitoring).
- Support staged rollout (waitlist + invite-only beta gate).

---

## 3) High-Level Architecture

### Frontend

- Next.js 16 App Router UI with Tailwind styling.
- RainbowKit + wagmi for wallet connection and contract writes.
- Client flow guides user through:
  1. connect wallet
  2. register agent on-chain
  3. generate/upload agent card to IPFS
  4. call `setAgentURI` on registry

### Backend (Next API routes)

- API endpoints handle uploads, card generation, reputation reads, waitlist collection, and dashboard agent lookups.
- Uses server env vars for Pinata, Upstash, optional API key auth, optional RPC overrides.

### On-Chain + Infra

- ERC-8004 Identity and Reputation registries.
- IPFS via Pinata for metadata/image persistence.
- Upstash Redis for distributed rate limiting and waitlist storage.
- Optional Sentry for runtime monitoring.

---

## 4) Main User Flows

### A) Register Agent (UI)

1. User opens `Create Agent` page.
2. Connects wallet on supported chain.
3. Submits basic metadata and service endpoints.
4. App sends `register()` transaction to ERC-8004 Identity Registry.
5. App reads `Registered` event and extracts `agentId`.
6. App uploads Agent Card JSON to IPFS.
7. App calls `setAgentURI(agentId, ipfsUri)`.
8. Agent appears in dashboard and is externally verifiable.

### B) Waitlist + Beta Access

- Public users can join waitlist from landing page.
- Signups are stored in Upstash Redis.
- Registration can be invite-only with `BETA_ACCESS_CODE`.
- Optional `BETA_PUBLIC_REGISTRATION=true` opens registration.

### C) Dashboard

- Shows connected wallet address.
- Fetches user-owned agents (Base Sepolia support implemented).
- Provides outbound links to block explorer token pages for each agent ID.

---

## 5) API Surface (Current)

Base path for programmatic APIs: `/api/v1`

- `GET /api/v1/chains`
  - returns supported chains + registry address data

- `POST /api/v1/agent-card`
  - validates payload and uploads built agent card to IPFS
  - optional API auth via `x-api-key` when `API_KEY` is set
  - rate limited

- `POST /api/v1/upload`
  - uploads image file to IPFS (multipart form-data)
  - optional API auth via `x-api-key`
  - rate limited

- `GET /api/v1/reputation?agentId=<id>&chainId=<id>`
  - reads reputation summary from registry context
  - optional dedicated RPC envs supported

- `GET /api/v1/my-agents?address=<wallet>&chainId=<id>`
  - server-side event lookup for registered agents (dashboard feed)
  - rate limited

Other routes:

- `/api/upload`
  - UI-focused upload endpoint (not `x-api-key` protected)

- `/api/waitlist`
  - stores beta waitlist emails in Upstash Redis

- `/api/beta-status`
  - tells UI whether registration is gated

- `/api/beta-verify`
  - validates invite code and sets beta access cookie

---

## 6) Security and Production Controls

- **Rate limiting**:
  - 30 req/min per IP
  - Upstash-backed when configured (multi-instance safe)
  - in-memory fallback in local/single-instance mode

- **Optional API key auth**:
  - `API_KEY` enables `x-api-key` checks on `/api/v1/*` write endpoints

- **Security headers**:
  - `X-Content-Type-Options`, `X-Frame-Options`, Referrer-Policy, Permissions-Policy
  - tailored embed + API CORS behavior

- **Environment guardrails**:
  - server env checks before sensitive ops (Pinata)
  - client WalletConnect env handling with visible config guidance

- **Monitoring**:
  - Sentry wiring available and controlled by env

---

## 7) Environment Variables

See `.env.example` for canonical template. Important ones:

Required for normal registration flow:

- `PINATA_JWT`
- `PINATA_GATEWAY`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

Beta / rollout controls:

- `BETA_ACCESS_CODE`
- `BETA_PUBLIC_REGISTRATION=true` (optional public mode)

Ops / scalability:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `NODE_RPC_URL_BASE_SEPOLIA` (recommended)
- `NODE_RPC_URL_MAINNET` (optional)

Optional:

- `API_KEY`
- Sentry vars (`NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`)

---

## 8) SDK and Integration Story

There is an internal SDK client in:

- `src/lib/agentfoundry-client.ts`

It supports:

- `getChains()`
- `createAgentCard()`
- `uploadImage()`
- `getReputation()`

This is currently repo-internal (not published as a standalone npm package).

---

## 9) Current Limitations / Known Gaps

- Dashboard agent discovery currently focused on Base Sepolia path.
- 8004scan deep-linking was unreliable; explorer links now point to chain explorers.
- Reputation and validation UX is still evolving relative to full ERC-8004 breadth.
- For high-scale production, ensure dedicated RPC + Upstash are configured.

---

## 10) Deployment Model

Recommended deployment: Vercel.

Checklist:

1. Set env vars in Vercel Project Settings.
2. Redeploy after env changes.
3. Verify:
   - landing page loads
   - wallet connect works
   - create flow registers + sets URI
   - dashboard shows agents
   - waitlist writes to Redis

---

## 11) Tech Stack Summary

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- RainbowKit + wagmi + viem
- Pinata (IPFS)
- Upstash Redis + Upstash Ratelimit
- Vitest
- Optional Sentry

---

## 12) Why This Matters

AgentFoundry lowers the barrier for ERC-8004 adoption by combining:

- user-friendly registration
- on-chain identity anchoring
- metadata portability
- API-first integration options
- practical production controls

It is positioned as a builder gateway into the trustless agent ecosystem.

