/**
 * @agentfoundry/sdk
 * Official SDK for AgentFoundry - ERC-8004 agent registration and discovery
 */
interface ChainInfo {
    id: number;
    name: string;
    identityRegistry: string;
    reputationRegistry: string;
    isTestnet: boolean;
}
interface AgentCardInput {
    chainId: number;
    agentId: number | string;
    name: string;
    description: string;
    image: string;
    services?: Array<{
        name: string;
        endpoint: string;
        version?: string;
    }>;
    supportedTrust?: string[];
    x402Support?: boolean;
    active?: boolean;
}
interface AgentCardResponse {
    ipfsUri: string;
    cid: string;
    agentCard: Record<string, unknown>;
}
interface ReputationSummary {
    agentId: string;
    chainId: number;
    count: number;
    summaryValue: number;
    summaryValueDecimals: number;
    clients: string[];
}
interface AgentMetadata {
    name?: string;
    description?: string;
    image?: string;
    services?: Array<{
        name: string;
        endpoint: string;
        version?: string;
    }>;
}
interface AgentResponse {
    chainId: number;
    agentId: string;
    owner: string | null;
    tokenURI: string | null;
    metadata: AgentMetadata | null;
    reputation: {
        count: number;
        summaryValue: number;
        summaryValueDecimals: number;
    };
    verification: {
        uriSet: boolean;
        schemaValid: boolean;
    };
}
/** API error with status code */
declare class AgentFoundryError extends Error {
    readonly statusCode?: number | undefined;
    readonly body?: unknown | undefined;
    constructor(message: string, statusCode?: number | undefined, body?: unknown | undefined);
}
interface ClientOptions {
    baseUrl?: string;
    apiKey?: string;
}
declare class AgentFoundryClient {
    private baseUrl;
    private apiKey?;
    constructor(baseUrlOrOptions?: string | ClientOptions);
    private fetch;
    /** List supported chains and registry addresses */
    getChains(): Promise<{
        chains: ChainInfo[];
        count: number;
    }>;
    /** Fetch agent metadata and reputation by chain and agent ID */
    getAgent(chainId: number, agentId: string | number): Promise<AgentResponse>;
    /** Create and upload agent card to IPFS. Call after register() tx confirms. */
    createAgentCard(input: AgentCardInput): Promise<AgentCardResponse>;
    /** Upload image file to IPFS */
    uploadImage(file: File): Promise<{
        cid: string;
        ipfsUri: string;
    }>;
    /** Get reputation summary for an agent */
    getReputation(agentId: string | number, chainId?: number): Promise<ReputationSummary>;
}
/** Default client instance */
declare const agentFoundry: AgentFoundryClient;

export { type AgentCardInput, type AgentCardResponse, AgentFoundryClient, AgentFoundryError, type AgentMetadata, type AgentResponse, type ChainInfo, type ClientOptions, type ReputationSummary, agentFoundry };
