import { NextResponse } from "next/server";
import {
  SUPPORTED_CHAINS,
  REGISTRY_ADDRESSES,
  REPUTATION_REGISTRY_ADDRESSES,
} from "@/lib/constants";

export async function GET() {
  const chains = SUPPORTED_CHAINS.map((chain) => ({
    id: chain.id,
    name: chain.name,
    identityRegistry: REGISTRY_ADDRESSES[chain.id],
    reputationRegistry: REPUTATION_REGISTRY_ADDRESSES[chain.id],
    isTestnet: chain.id !== 1 && chain.name.toLowerCase().includes("sepolia")
      ? true
      : ["Fuji", "Amoy", "Hoodi", "Minato", "Testnet"].some((t) =>
          chain.name.includes(t)
        ),
  }));

  return NextResponse.json({
    chains,
    count: chains.length,
  });
}
