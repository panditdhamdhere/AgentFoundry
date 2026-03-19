import { PinataSDK } from "pinata";
import type { AgentCard } from "./types";

export async function uploadAgentCard(
  agentCard: AgentCard
): Promise<{ cid: string; ipfsUri: string }> {
  const pinataJwt = process.env.PINATA_JWT;
  const pinataGateway = process.env.PINATA_GATEWAY;

  if (!pinataJwt || !pinataGateway) {
    throw new Error(
      "Missing PINATA_JWT or PINATA_GATEWAY. Add them to your .env.local"
    );
  }

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
  const pinataJwt = process.env.PINATA_JWT;
  const pinataGateway = process.env.PINATA_GATEWAY;

  if (!pinataJwt || !pinataGateway) {
    throw new Error(
      "Missing PINATA_JWT or PINATA_GATEWAY. Add them to your .env.local"
    );
  }

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
