// src/index.ts
var DEFAULT_BASE = typeof window !== "undefined" ? window.location?.origin ?? "http://localhost:3000" : "http://localhost:3000";
var AgentFoundryError = class extends Error {
  constructor(message, statusCode, body) {
    super(message);
    this.statusCode = statusCode;
    this.body = body;
    this.name = "AgentFoundryError";
  }
};
var AgentFoundryClient = class {
  constructor(baseUrlOrOptions = DEFAULT_BASE) {
    if (typeof baseUrlOrOptions === "string") {
      this.baseUrl = baseUrlOrOptions.replace(/\/$/, "");
      this.apiKey = void 0;
    } else {
      this.baseUrl = (baseUrlOrOptions.baseUrl ?? DEFAULT_BASE).replace(/\/$/, "");
      this.apiKey = baseUrlOrOptions.apiKey;
    }
  }
  async fetch(path, options) {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      "Content-Type": "application/json",
      ...options?.headers ?? {}
    };
    if (this.apiKey) {
      headers["x-api-key"] = this.apiKey;
    }
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      let body;
      try {
        body = await res.json();
      } catch {
        body = await res.text();
      }
      const message = body?.error ?? res.statusText ?? `Request failed (${res.status})`;
      throw new AgentFoundryError(message, res.status, body);
    }
    return res.json();
  }
  /** List supported chains and registry addresses */
  async getChains() {
    return this.fetch("/api/v1/chains");
  }
  /** Fetch agent metadata and reputation by chain and agent ID */
  async getAgent(chainId, agentId) {
    return this.fetch(`/api/v1/agent/${chainId}/${String(agentId)}`);
  }
  /** Create and upload agent card to IPFS. Call after register() tx confirms. */
  async createAgentCard(input) {
    return this.fetch("/api/v1/agent-card", {
      method: "POST",
      body: JSON.stringify({
        ...input,
        agentId: typeof input.agentId === "string" ? input.agentId : String(input.agentId)
      })
    });
  }
  /** Upload image file to IPFS */
  async uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);
    const headers = {};
    if (this.apiKey) {
      headers["x-api-key"] = this.apiKey;
    }
    const res = await fetch(`${this.baseUrl}/api/v1/upload`, {
      method: "POST",
      body: formData,
      headers
    });
    if (!res.ok) {
      let body;
      try {
        body = await res.json();
      } catch {
        body = await res.text();
      }
      const message = body?.error ?? res.statusText ?? "Upload failed";
      throw new AgentFoundryError(message, res.status, body);
    }
    return res.json();
  }
  /** Get reputation summary for an agent */
  async getReputation(agentId, chainId = 84532) {
    return this.fetch(
      `/api/v1/reputation?agentId=${agentId}&chainId=${chainId}`
    );
  }
};
var agentFoundry = new AgentFoundryClient();
export {
  AgentFoundryClient,
  AgentFoundryError,
  agentFoundry
};
