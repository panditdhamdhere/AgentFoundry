/**
 * @agentfoundry/sdk
 * Official SDK for AgentFoundry - ERC-8004 agent registration and discovery
 */

const DEFAULT_BASE =
  typeof window !== "undefined"
    ? (window as unknown as { location?: { origin: string } }).location?.origin ?? "http://localhost:3000"
    : "http://localhost:3000";

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

export interface AgentMetadata {
  name?: string;
  description?: string;
  image?: string;
  services?: Array<{ name: string; endpoint: string; version?: string }>;
}

export interface AgentResponse {
  chainId: number;
  agentId: string;
  owner: string | null;
  tokenURI: string | null;
  metadata: AgentMetadata | null;
  reputation: {
    count: number;
    summaryValue: number;
    summaryValueDecimals: number;
  };
  verification: {
    uriSet: boolean;
    schemaValid: boolean;
  };
}

/** API error with status code */
export class AgentFoundryError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = "AgentFoundryError";
  }
}

export interface ClientOptions {
  baseUrl?: string;
  apiKey?: string;
}

export class AgentFoundryClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrlOrOptions: string | ClientOptions = DEFAULT_BASE) {
    if (typeof baseUrlOrOptions === "string") {
      this.baseUrl = baseUrlOrOptions.replace(/\/$/, "");
      this.apiKey = undefined;
    } else {
      this.baseUrl = (baseUrlOrOptions.baseUrl ?? DEFAULT_BASE).replace(/\/$/, "");
      this.apiKey = baseUrlOrOptions.apiKey;
    }
  }

  private async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options?.headers as Record<string, string>) ?? {}),
    };
    if (this.apiKey) {
      headers["x-api-key"] = this.apiKey;
    }

    const res = await fetch(url, { ...options, headers });

    if (!res.ok) {
      let body: unknown;
      try {
        body = await res.json();
      } catch {
        body = await res.text();
      }
      const message =
        (body as { error?: string })?.error ?? res.statusText ?? `Request failed (${res.status})`;
      throw new AgentFoundryError(message, res.status, body);
    }

    return res.json();
  }

  /** List supported chains and registry addresses */
  async getChains(): Promise<{ chains: ChainInfo[]; count: number }> {
    return this.fetch("/api/v1/chains");
  }

  /** Fetch agent metadata and reputation by chain and agent ID */
  async getAgent(chainId: number, agentId: string | number): Promise<AgentResponse> {
    return this.fetch(`/api/v1/agent/${chainId}/${String(agentId)}`);
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
    const headers: Record<string, string> = {};
    if (this.apiKey) {
      headers["x-api-key"] = this.apiKey;
    }
    const res = await fetch(`${this.baseUrl}/api/v1/upload`, {
      method: "POST",
      body: formData,
      headers,
    });

    if (!res.ok) {
      let body: unknown;
      try {
        body = await res.json();
      } catch {
        body = await res.text();
      }
      const message =
        (body as { error?: string })?.error ?? res.statusText ?? "Upload failed";
      throw new AgentFoundryError(message, res.status, body);
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
