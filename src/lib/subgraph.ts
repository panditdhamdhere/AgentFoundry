/**
 * Subgraph / indexer support for agent directory.
 * When SUBGRAPH_URL or SUBGRAPH_URL_<chainId> is set, fetches registrations via GraphQL
 * instead of raw RPC event scanning. Falls back to RPC when not configured or on error.
 */

function getSubgraphUrl(chainId: number): string | null {
  const chainKey = `SUBGRAPH_URL_${chainId}`;
  const chainUrl = process.env[chainKey];
  if (chainUrl) return chainUrl;
  return process.env.SUBGRAPH_URL ?? null;
}

export interface SubgraphRegistration {
  agentId: string;
  owner: string;
  blockNumber: number;
}

/**
 * Fetch recent agent registrations from subgraph (The Graph, Goldsky, etc.).
 * Expects entities with agentId, owner, blockNumber.
 * Returns empty array if subgraph not configured or query fails.
 */
export async function fetchRegistrationsFromSubgraph(
  chainId: number,
  limit: number
): Promise<SubgraphRegistration[]> {
  const url = getSubgraphUrl(chainId);
  if (!url) return [];

  // Common subgraph patterns: "registrations", "registered", "agents"
  const query = `
    query GetRegistrations($first: Int!) {
      registrations(
        first: $first
        orderBy: blockNumber
        orderDirection: desc
      ) {
        agentId
        owner
        blockNumber
      }
    }
  `;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        variables: { first: Math.min(limit, 500) },
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];

    const json = await res.json();
    const data = json?.data;
    if (!data) return [];

    // Support multiple entity names
    const list =
      data.registrations ?? data.registered ?? data.agents ?? [];
    if (!Array.isArray(list)) return [];

    return list
      .map((item: { agentId?: string; owner?: string; blockNumber?: string | number }) => {
        const agentId = item.agentId != null ? String(item.agentId) : null;
        const owner = item.owner ? String(item.owner) : null;
        const blockNum = item.blockNumber;
        if (!agentId || !owner) return null;
        const ownerAddr = owner.startsWith("0x") ? owner : `0x${owner}`;
        return {
          agentId,
          owner: ownerAddr,
          blockNumber:
            typeof blockNum === "number"
              ? blockNum
              : typeof blockNum === "string"
                ? parseInt(blockNum, 10) || 0
                : 0,
        };
      })
      .filter(
        (r: SubgraphRegistration | null): r is SubgraphRegistration =>
          r !== null && r.blockNumber >= 0
      );
  } catch (err) {
    console.warn("Subgraph fetch failed, falling back to RPC:", err);
    return [];
  }
}
