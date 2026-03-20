import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { SUPPORTED_CHAINS } from "./constants";
import { env } from "./env";

export const config = getDefaultConfig({
  appName: "AgentFoundry",
  projectId: env.walletConnect.projectId,
  chains: [...SUPPORTED_CHAINS],
  ssr: true,
});
