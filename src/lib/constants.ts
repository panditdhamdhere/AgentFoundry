import { baseSepolia } from "viem/chains";

export const SUPPORTED_CHAINS = [baseSepolia] as const;
export type SupportedChainId = (typeof SUPPORTED_CHAINS)[number]["id"];

// ERC-8004 Identity Registry addresses
export const REGISTRY_ADDRESSES: Record<number, `0x${string}`> = {
  // Base Sepolia (testnet)
  84532: "0x8004A818BFB912233c491871b3d84c89A494BD9e" as `0x${string}`,
  // Base Mainnet
  8453: "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" as `0x${string}`,
  // Ethereum Sepolia
  11155111: "0x8004A818BFB912233c491871b3d84c89A494BD9e" as `0x${string}`,
  // Ethereum Mainnet
  1: "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" as `0x${string}`,
};

export const DEFAULT_CHAIN = baseSepolia;
