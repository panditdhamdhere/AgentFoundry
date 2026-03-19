export interface AgentService {
  name: string;
  endpoint: string;
  version?: string;
}

export interface AgentRegistration {
  agentId: number;
  agentRegistry: string;
}

export interface AgentCard {
  type: string;
  name: string;
  description: string;
  image: string;
  services: AgentService[];
  registrations: AgentRegistration[];
  supportedTrust: string[];
  x402Support?: boolean;
  active?: boolean;
}

export interface AgentFormData {
  name: string;
  description: string;
  image: string; // URL or IPFS
  services: AgentService[];
  supportedTrust: string[];
  x402Support: boolean;
}
