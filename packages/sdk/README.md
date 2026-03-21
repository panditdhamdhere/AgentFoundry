# @agentfoundry/sdk

Official SDK for [AgentFoundry](https://agentfoundry.com) - ERC-8004 agent registration and discovery.

## Install

```bash
npm install @agentfoundry/sdk
```

## Usage

```typescript
import { AgentFoundryClient, AgentFoundryError } from "@agentfoundry/sdk";

const client = new AgentFoundryClient("https://your-agentfoundry.com");

// Optional: pass API key for protected endpoints
const clientWithAuth = new AgentFoundryClient({
  baseUrl: "https://your-agentfoundry.com",
  apiKey: "your-api-key",
});

// Get supported chains
const { chains } = await client.getChains();

// Fetch agent metadata and reputation
const agent = await client.getAgent(84532, "1");

// Create agent card (after register() tx confirms)
const { ipfsUri } = await client.createAgentCard({
  chainId: 84532,
  agentId: 1,
  name: "My Agent",
  description: "...",
  image: "ipfs://...",
  services: [{ name: "MCP", endpoint: "https://..." }],
});

// Get reputation
const rep = await client.getReputation("1", 84532);

// Error handling
try {
  await client.getAgent(999, "1");
} catch (err) {
  if (err instanceof AgentFoundryError) {
    console.log(err.statusCode, err.message, err.body);
  }
}
```

## API Reference

See [OpenAPI docs](https://your-agentfoundry.com/api-docs) for full API documentation.
