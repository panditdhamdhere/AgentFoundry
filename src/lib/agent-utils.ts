import { env } from "./env";
import type { AgentCard, AgentService } from "./types";

const PROTOCOLS = ["MCP", "A2A", "OASF", "mcp", "a2a", "oasf"] as const;

/** Resolve ipfs:// URI to HTTP URL */
export function resolveIpfsUrl(uri: string): string {
  if (uri.startsWith("ipfs://")) {
    const cid = uri.replace("ipfs://", "").split("/")[0];
    const gateway = env.pinata.gateway || "https://gateway.pinata.cloud";
    const base = gateway.replace(/\/$/, "");
    return `${base}/ipfs/${cid}`;
  }
  return uri;
}

/** Fetch metadata from URI (ipfs or http) */
export async function fetchAgentMetadata(
  uri: string
): Promise<AgentCard | null> {
  if (!uri || (!uri.startsWith("ipfs://") && !uri.startsWith("http"))) {
    return null;
  }
  try {
    const url = uri.startsWith("ipfs://") ? resolveIpfsUrl(uri) : uri;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const json = await res.json();
    if (json?.name && json?.type) return json as AgentCard;
    return null;
  } catch {
    return null;
  }
}

/** Check if agent metadata is schema-valid (ERC-8004 Agent Card) */
export function isMetadataSchemaValid(meta: unknown): meta is AgentCard {
  if (!meta || typeof meta !== "object") return false;
  const m = meta as Record<string, unknown>;
  return (
    typeof m.name === "string" &&
    typeof m.type === "string" &&
    Array.isArray(m.services)
  );
}

/** Get verification status for an agent */
export function getVerificationStatus(
  tokenURI: string | null,
  metadata: AgentCard | null
): { uriSet: boolean; schemaValid: boolean } {
  const uriSet = !!tokenURI && tokenURI.length > 0;
  const schemaValid = !!metadata && isMetadataSchemaValid(metadata);
  return { uriSet, schemaValid };
}

/** Check if agent has a given protocol in services */
export function hasProtocol(
  metadata: AgentCard | null,
  protocol: string
): boolean {
  if (!metadata?.services?.length) return false;
  const p = protocol.toLowerCase();
  return metadata.services.some(
    (s) => s.name?.toLowerCase().includes(p) || s.name?.toLowerCase() === p
  );
}

/** Check if agent matches search (name, description, endpoints) */
export function matchesSearch(
  metadata: AgentCard | null,
  search: string,
  agentId: string
): boolean {
  if (!search.trim()) return true;
  const q = search.toLowerCase().trim();
  if (agentId.toLowerCase().includes(q)) return true;
  if (!metadata) return false;
  if (metadata.name?.toLowerCase().includes(q)) return true;
  if (metadata.description?.toLowerCase().includes(q)) return true;
  for (const s of metadata.services ?? []) {
    if (s.name?.toLowerCase().includes(q)) return true;
    if (s.endpoint?.toLowerCase().includes(q)) return true;
  }
  return false;
}

/** Protocol filter values for directory */
export function getProtocolFilterValues(): string[] {
  return ["MCP", "A2A", "OASF"];
}
