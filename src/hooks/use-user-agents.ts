"use client";

import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";

const CHAINS_TO_CHECK = [84532]; // Base Sepolia

export interface UserAgent {
  chainId: number;
  agentId: string;
}

async function fetchAgents(address: string): Promise<UserAgent[]> {
  const all: UserAgent[] = [];
  for (const chainId of CHAINS_TO_CHECK) {
    const res = await fetch(
      `/api/v1/my-agents?address=${encodeURIComponent(address)}&chainId=${chainId}`
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error((data as { error?: string }).error ?? `Failed to fetch agents (${res.status})`);
    }
    if (Array.isArray(data.agents)) {
      all.push(...data.agents);
    }
  }
  return all;
}

export function useUserAgents(): {
  agents: UserAgent[];
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const { address } = useAccount();

  const {
    data: agents = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["user-agents", address],
    queryFn: () => fetchAgents(address!),
    enabled: !!address,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return {
    agents,
    isLoading,
    isFetching,
    error: error ?? null,
    refetch,
  };
}
