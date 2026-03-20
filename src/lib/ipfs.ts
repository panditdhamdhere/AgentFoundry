import { PinataSDK } from "pinata";
import { ensurePinataConfig } from "./env";
import type { AgentCard } from "./types";

export async function uploadAgentCard(
  agentCard: AgentCard
): Promise<{ cid: string; ipfsUri: string }> {
  const { jwt: pinataJwt, gateway: pinataGateway } = ensurePinataConfig();

  const pinata = new PinataSDK({
    pinataJwt,
    pinataGateway,
  });

  const result = await pinata.upload.public.json(agentCard);

  if (!result?.cid) {
    throw new Error("Failed to upload to IPFS");
  }

  return {
    cid: result.cid,
    ipfsUri: `ipfs://${result.cid}`,
  };
}

export async function uploadImage(file: File): Promise<{ cid: string; ipfsUri: string }> {
  const { jwt: pinataJwt, gateway: pinataGateway } = ensurePinataConfig();

  const pinata = new PinataSDK({
    pinataJwt,
    pinataGateway,
  });

  const result = await pinata.upload.public.file(file);

  if (!result?.cid) {
    throw new Error("Failed to upload image to IPFS");
  }

  return {
    cid: result.cid,
    ipfsUri: `ipfs://${result.cid}`,
  };
}
