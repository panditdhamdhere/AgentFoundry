import type { AgentCard, AgentService } from "./types";
import { REGISTRY_ADDRESSES, isChainSupported } from "./constants";

export function buildAgentCard(params: {
  chainId: number;
  agentId: number | bigint;
  name: string;
  description: string;
  image: string;
  services: AgentService[];
  supportedTrust?: string[];
  x402Support?: boolean;
  active?: boolean;
}): AgentCard {
  const registryAddress = REGISTRY_ADDRESSES[params.chainId as keyof typeof REGISTRY_ADDRESSES];
  if (!registryAddress || !isChainSupported(params.chainId)) {
    throw new Error(`Unsupported chain: ${params.chainId}`);
  }

  const agentRegistry = `eip155:${params.chainId}:${registryAddress}`;
  const agentIdNum = Number(params.agentId);

  return {
    type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
    name: params.name.trim(),
    description: params.description.trim(),
    image: params.image.trim(),
    services: params.services
      .filter((s) => s.name?.trim() && s.endpoint?.trim())
      .map((s) => ({
        name: s.name.trim(),
        endpoint: s.endpoint.trim(),
        ...(s.version?.trim() ? { version: s.version.trim() } : {}),
      })),
    registrations: [
      {
        agentId: agentIdNum,
        agentRegistry,
      },
    ],
    supportedTrust: params.supportedTrust ?? ["reputation"],
    x402Support: params.x402Support ?? false,
    active: params.active ?? true,
  };
}
