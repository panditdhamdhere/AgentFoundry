/**
 * AgentFoundry API Client
 * Use this SDK for programmatic agent registration and reputation queries.
 */

const DEFAULT_BASE = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

export interface ChainInfo {
  id: number;
  name: string;
  identityRegistry: string;
  reputationRegistry: string;
  isTestnet: boolean;
}

export interface AgentCardInput {
  chainId: number;
  agentId: number | string;
  name: string;
  description: string;
  image: string;
  services?: Array<{ name: string; endpoint: string; version?: string }>;
  supportedTrust?: string[];
  x402Support?: boolean;
  active?: boolean;
}

export interface AgentCardResponse {
  ipfsUri: string;
  cid: string;
  agentCard: Record<string, unknown>;
}

export interface ReputationSummary {
  agentId: string;
  chainId: number;
  count: number;
  summaryValue: number;
  summaryValueDecimals: number;
  clients: string[];
}

export class AgentFoundryClient {
  constructor(private baseUrl: string = DEFAULT_BASE) {}

  private async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options?.headers },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error ?? res.statusText);
    }
    return res.json();
  }

  /** List supported chains and registry addresses */
  async getChains(): Promise<{ chains: ChainInfo[]; count: number }> {
    return this.fetch("/api/v1/chains");
  }

  /** Create and upload agent card to IPFS. Call after register() tx confirms. */
  async createAgentCard(input: AgentCardInput): Promise<AgentCardResponse> {
    return this.fetch("/api/v1/agent-card", {
      method: "POST",
      body: JSON.stringify({
        ...input,
        agentId: typeof input.agentId === "string" ? input.agentId : String(input.agentId),
      }),
    });
  }

  /** Upload image file to IPFS */
  async uploadImage(file: File): Promise<{ cid: string; ipfsUri: string }> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${this.baseUrl}/api/v1/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error ?? res.statusText);
    }
    return res.json();
  }

  /** Get reputation summary for an agent */
  async getReputation(
    agentId: string | number,
    chainId: number = 84532
  ): Promise<ReputationSummary> {
    return this.fetch(
      `/api/v1/reputation?agentId=${agentId}&chainId=${chainId}`
    );
  }
}

/** Default client instance */
export const agentFoundry = new AgentFoundryClient();
