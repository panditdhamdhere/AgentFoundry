import {
  abstract,
  abstractTestnet,
  arbitrum,
  arbitrumSepolia,
  avalanche,
  avalancheFuji,
  base,
  baseSepolia,
  bsc,
  bscTestnet,
  celo,
  celoSepolia,
  gnosis,
  goat,
  hederaTestnet,
  linea,
  lineaSepolia,
  mainnet,
  mantle,
  mantleSepoliaTestnet,
  megaeth,
  megaethTestnet,
  metis,
  metisSepolia,
  monad,
  monadTestnet,
  optimism,
  optimismSepolia,
  polygon,
  polygonAmoy,
  scroll,
  scrollSepolia,
  sepolia,
  skaleBase,
  skaleBaseSepoliaTestnet,
  soneium,
  soneiumMinato,
  taiko,
  taikoHoodi,
  xLayer,
  xLayerTestnet,
  arcTestnet,
} from "viem/chains";

// All ERC-8004 deployed chains - from https://github.com/erc-8004/erc-8004-contracts
// Identity: Mainnets 0x8004A169..., Testnets 0x8004A818...
const MAINNET_IDENTITY = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" as const;
const TESTNET_IDENTITY = "0x8004A818BFB912233c491871b3d84c89A494BD9e" as const;
// Reputation: Mainnets 0x8004BAa1..., Testnets 0x8004B663...
const MAINNET_REPUTATION = "0x8004BAa17C55a88189AE136b182e5fdA19dE9b63" as const;
const TESTNET_REPUTATION = "0x8004B663056A597Dffe9eCcC1965A193B7388713" as const;

const TESTNET_CHAINS = [
  baseSepolia,
  sepolia,
  abstractTestnet,
  arbitrumSepolia,
  avalancheFuji,
  bscTestnet,
  celoSepolia,
  lineaSepolia,
  mantleSepoliaTestnet,
  megaethTestnet,
  metisSepolia,
  monadTestnet,
  optimismSepolia,
  polygonAmoy,
  scrollSepolia,
  skaleBaseSepoliaTestnet,
  soneiumMinato,
  taikoHoodi,
  xLayerTestnet,
  hederaTestnet,
  arcTestnet,
] as const;

const MAINNET_CHAINS = [
  mainnet,
  base,
  abstract,
  arbitrum,
  avalanche,
  bsc,
  celo,
  gnosis,
  goat,
  linea,
  mantle,
  megaeth,
  metis,
  monad,
  optimism,
  polygon,
  scroll,
  skaleBase,
  soneium,
  taiko,
  xLayer,
] as const;

export const SUPPORTED_CHAINS = [
  ...TESTNET_CHAINS,
  ...MAINNET_CHAINS,
] as const;

export type SupportedChainId = (typeof SUPPORTED_CHAINS)[number]["id"];

export const CHAIN_BY_ID = Object.fromEntries(
  SUPPORTED_CHAINS.map((c) => [c.id, c])
) as Record<number, (typeof SUPPORTED_CHAINS)[number]>;

export const CHAIN_NAMES = Object.fromEntries(
  SUPPORTED_CHAINS.map((c) => [c.id, c.name])
) as Record<number, string>;

// ERC-8004 Identity Registry addresses
export const REGISTRY_ADDRESSES: Record<number, `0x${string}`> = {} as Record<
  number,
  `0x${string}`
>;

TESTNET_CHAINS.forEach((c) => {
  REGISTRY_ADDRESSES[c.id] = TESTNET_IDENTITY;
});

/** Token explorer base URLs for ERC-721 view (Etherscan-style: /token/{addr}?a={id}) */
const TOKEN_EXPLORER_BASES: Record<number, string> = {
  [baseSepolia.id]: "https://sepolia.basescan.org",
  [base.id]: "https://basescan.org",
  [sepolia.id]: "https://sepolia.etherscan.io",
  [mainnet.id]: "https://etherscan.io",
  [arbitrumSepolia.id]: "https://sepolia.arbiscan.io",
  [arbitrum.id]: "https://arbiscan.io",
  [optimismSepolia.id]: "https://sepolia-optimism.etherscan.io",
  [optimism.id]: "https://optimistic.etherscan.io",
  [polygonAmoy.id]: "https://amoy.polygonscan.com",
  [polygon.id]: "https://polygonscan.com",
  [avalancheFuji.id]: "https://testnet.snowtrace.io",
  [avalanche.id]: "https://snowtrace.io",
  [bscTestnet.id]: "https://testnet.bscscan.com",
  [bsc.id]: "https://bscscan.com",
  [celoSepolia.id]: "https://sepolia.celoscan.io",
  [celo.id]: "https://celoscan.io",
  [gnosis.id]: "https://gnosisscan.io",
  [lineaSepolia.id]: "https://sepolia.lineascan.build",
  [linea.id]: "https://lineascan.build",
  [mantleSepoliaTestnet.id]: "https://sepolia.mantlescan.xyz",
  [mantle.id]: "https://mantlescan.xyz",
  [scrollSepolia.id]: "https://sepolia.scrollscan.com",
  [scroll.id]: "https://scrollscan.com",
  [metisSepolia.id]: "https://sepolia-explorer.metisdevops.link",
  [metis.id]: "https://andromeda-explorer.metis.io",
  [taikoHoodi.id]: "https://hoodi.taikoscan.io",
  [taiko.id]: "https://taikoscan.io",
  [xLayerTestnet.id]: "https://www.oklink.com/xlayer-test",
  [xLayer.id]: "https://www.oklink.com/xlayer",
  [abstractTestnet.id]: "https://explorer.testnet.abs.xyz",
  [abstract.id]: "https://explorer.mainnet.abs.xyz",
  [goat.id]: "https://explorer.goat.network",
  [megaethTestnet.id]: "https://megaeth-testnet-v2.blockscout.com",
  [megaeth.id]: "https://megaeth.blockscout.com",
  [monadTestnet.id]: "https://monad-testnet.socialscan.io",
  [monad.id]: "https://monadscan.com",
  [skaleBaseSepoliaTestnet.id]: "https://base-sepolia-testnet-explorer.skalenodes.com",
  [skaleBase.id]: "https://skale-base-explorer.skalenodes.com",
  [soneiumMinato.id]: "https://soneium-minato.blockscout.com",
  [soneium.id]: "https://soneium.blockscout.com",
  [hederaTestnet.id]: "https://hashscan.io/testnet",
  [arcTestnet.id]: "https://testnet.arcscan.app",
};

/** Block explorer token URL (ERC-721 view) */
export function getAgentExplorerUrl(chainId: number, agentId: string): string {
  const registry = REGISTRY_ADDRESSES[chainId];
  if (!registry) return `https://www.8004scan.io/agents`;
  const base = TOKEN_EXPLORER_BASES[chainId];
  if (base) return `${base}/token/${registry}?a=${agentId}`;
  return `https://www.8004scan.io/agents`;
}
MAINNET_CHAINS.forEach((c) => {
  REGISTRY_ADDRESSES[c.id] = MAINNET_IDENTITY;
});

// ERC-8004 Reputation Registry addresses
export const REPUTATION_REGISTRY_ADDRESSES: Record<number, `0x${string}`> = {} as Record<
  number,
  `0x${string}`
>;
TESTNET_CHAINS.forEach((c) => {
  REPUTATION_REGISTRY_ADDRESSES[c.id] = TESTNET_REPUTATION;
});
MAINNET_CHAINS.forEach((c) => {
  REPUTATION_REGISTRY_ADDRESSES[c.id] = MAINNET_REPUTATION;
});

// Block explorer URLs for contract/address views
export const BLOCK_EXPLORERS: Record<
  number,
  { name: string; url: (address: string) => string }
> = {
  [baseSepolia.id]: {
    name: "BaseScan",
    url: (a) => `https://sepolia.basescan.org/address/${a}#readContract`,
  },
  [base.id]: {
    name: "BaseScan",
    url: (a) => `https://basescan.org/address/${a}#readContract`,
  },
  [sepolia.id]: {
    name: "Etherscan",
    url: (a) => `https://sepolia.etherscan.io/address/${a}#readContract`,
  },
  [mainnet.id]: {
    name: "Etherscan",
    url: (a) => `https://etherscan.io/address/${a}#readContract`,
  },
  [arbitrum.id]: {
    name: "Arbiscan",
    url: (a) => `https://arbiscan.io/address/${a}#readContract`,
  },
  [arbitrumSepolia.id]: {
    name: "Arbiscan",
    url: (a) => `https://sepolia.arbiscan.io/address/${a}#readContract`,
  },
  [optimism.id]: {
    name: "Optimism",
    url: (a) => `https://explorer.optimism.io/address/${a}#readContract`,
  },
  [optimismSepolia.id]: {
    name: "Optimism",
    url: (a) =>
      `https://testnet-explorer.optimism.io/address/${a}#readContract`,
  },
  [polygon.id]: {
    name: "PolygonScan",
    url: (a) => `https://polygonscan.com/address/${a}#readContract`,
  },
  [polygonAmoy.id]: {
    name: "PolygonScan",
    url: (a) => `https://amoy.polygonscan.com/address/${a}#readContract`,
  },
  [avalanche.id]: {
    name: "Snowtrace",
    url: (a) => `https://snowtrace.io/address/${a}#readContract`,
  },
  [avalancheFuji.id]: {
    name: "Snowtrace",
    url: (a) => `https://testnet.snowtrace.io/address/${a}#readContract`,
  },
  [bsc.id]: {
    name: "BSCScan",
    url: (a) => `https://bscscan.com/address/${a}#readContract`,
  },
  [bscTestnet.id]: {
    name: "BSCScan",
    url: (a) => `https://testnet.bscscan.com/address/${a}#readContract`,
  },
  [celo.id]: {
    name: "CeloScan",
    url: (a) => `https://celoscan.io/address/${a}#readContract`,
  },
  [celoSepolia.id]: {
    name: "CeloScan",
    url: (a) => `https://sepolia.celoscan.io/address/${a}#readContract`,
  },
  [gnosis.id]: {
    name: "GnosisScan",
    url: (a) => `https://gnosisscan.io/address/${a}#readContract`,
  },
  [linea.id]: {
    name: "LineaScan",
    url: (a) => `https://lineascan.build/address/${a}#readContract`,
  },
  [lineaSepolia.id]: {
    name: "LineaScan",
    url: (a) => `https://sepolia.lineascan.build/address/${a}#readContract`,
  },
  [mantle.id]: {
    name: "MantleScan",
    url: (a) => `https://mantlescan.xyz/address/${a}#readContract`,
  },
  [mantleSepoliaTestnet.id]: {
    name: "MantleScan",
    url: (a) => `https://sepolia.mantlescan.xyz/address/${a}#readContract`,
  },
  [scroll.id]: {
    name: "ScrollScan",
    url: (a) => `https://scrollscan.com/address/${a}#readContract`,
  },
  [scrollSepolia.id]: {
    name: "ScrollScan",
    url: (a) => `https://sepolia.scrollscan.com/address/${a}#readContract`,
  },
  [metis.id]: {
    name: "Metis",
    url: (a) =>
      `https://andromeda-explorer.metis.io/address/${a}#readContract`,
  },
  [metisSepolia.id]: {
    name: "Metis",
    url: (a) =>
      `https://sepolia-explorer.metisdevops.link/address/${a}#readContract`,
  },
  [taiko.id]: {
    name: "TaikoScan",
    url: (a) => `https://taikoscan.io/address/${a}#readContract`,
  },
  [taikoHoodi.id]: {
    name: "TaikoScan",
    url: (a) => `https://hoodi.taikoscan.io/address/${a}#readContract`,
  },
  [xLayer.id]: {
    name: "OKLink",
    url: (a) => `https://www.oklink.com/xlayer/address/${a}#readContract`,
  },
  [xLayerTestnet.id]: {
    name: "OKLink",
    url: (a) => `https://www.oklink.com/xlayer-test/address/${a}#readContract`,
  },
  [abstract.id]: {
    name: "Abstract",
    url: (a) => `https://explorer.mainnet.abs.xyz/address/${a}#readContract`,
  },
  [abstractTestnet.id]: {
    name: "Abstract",
    url: (a) => `https://explorer.testnet.abs.xyz/address/${a}#readContract`,
  },
  [goat.id]: {
    name: "GOAT",
    url: (a) => `https://explorer.goat.network/address/${a}#readContract`,
  },
  [megaeth.id]: {
    name: "MegaETH",
    url: (a) => `https://megaeth.blockscout.com/address/${a}#readContract`,
  },
  [megaethTestnet.id]: {
    name: "MegaETH",
    url: (a) =>
      `https://megaeth-testnet-v2.blockscout.com/address/${a}#readContract`,
  },
  [monad.id]: {
    name: "MonadScan",
    url: (a) => `https://monadscan.com/address/${a}#readContract`,
  },
  [monadTestnet.id]: {
    name: "MonadScan",
    url: (a) =>
      `https://monad-testnet.socialscan.io/address/${a}#readContract`,
  },
  [skaleBase.id]: {
    name: "SKALE",
    url: (a) =>
      `https://skale-base-explorer.skalenodes.com/address/${a}#readContract`,
  },
  [skaleBaseSepoliaTestnet.id]: {
    name: "SKALE",
    url: (a) =>
      `https://base-sepolia-testnet-explorer.skalenodes.com/address/${a}#readContract`,
  },
  [soneium.id]: {
    name: "Blockscout",
    url: (a) => `https://soneium.blockscout.com/address/${a}#readContract`,
  },
  [soneiumMinato.id]: {
    name: "Blockscout",
    url: (a) =>
      `https://soneium-minato.blockscout.com/address/${a}#readContract`,
  },
  [hederaTestnet.id]: {
    name: "HashScan",
    url: (a) => `https://hashscan.io/testnet/address/${a}#readContract`,
  },
  [arcTestnet.id]: {
    name: "ArcScan",
    url: (a) => `https://testnet.arcscan.app/address/${a}#readContract`,
  },
};

// Fallback for chains without explicit explorer
export function getBlockExplorerUrl(chainId: number, address: string): string {
  const ex = BLOCK_EXPLORERS[chainId];
  if (ex) return ex.url(address);
  return `https://etherscan.io/address/${address}#readContract`;
}

export const DEFAULT_CHAIN = baseSepolia;

export function isChainSupported(chainId: number): boolean {
  return chainId in REGISTRY_ADDRESSES;
}
