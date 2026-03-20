import type { AgentService } from "./types";

export interface AgentTemplate {
  id: string;
  label: string;
  description: string;
  name: string;
  formDescription: string;
  services: AgentService[];
}

export const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: "mcp",
    label: "MCP Server",
    description: "Model Context Protocol server exposing tools, prompts, and resources",
    name: "My MCP Agent",
    formDescription:
      "An MCP (Model Context Protocol) server that exposes tools, prompts, and resources for AI assistants.",
    services: [
      { name: "MCP", endpoint: "https://mcp.example.com/", version: "2025-06-18" },
    ],
  },
  {
    id: "a2a",
    label: "A2A Agent",
    description: "Agent2Agent protocol for direct agent-to-agent communication",
    name: "My A2A Agent",
    formDescription:
      "An A2A (Agent-to-Agent) agent that can receive tasks and respond via the A2A protocol.",
    services: [
      {
        name: "A2A",
        endpoint: "https://agent.example.com/.well-known/agent-card.json",
        version: "0.3.0",
      },
    ],
  },
  {
    id: "web",
    label: "Web / Chatbot",
    description: "Web-based chatbot or API endpoint",
    name: "My Web Agent",
    formDescription: "A web-based AI agent or chatbot accessible via HTTP.",
    services: [{ name: "web", endpoint: "https://chat.example.com/" }],
  },
  {
    id: "mcp-a2a",
    label: "MCP + A2A",
    description: "Multi-protocol agent with both MCP and A2A support",
    name: "My Multi-Protocol Agent",
    formDescription:
      "An agent that supports both MCP (tools, prompts) and A2A (agent-to-agent) protocols.",
    services: [
      { name: "MCP", endpoint: "https://mcp.example.com/", version: "2025-06-18" },
      {
        name: "A2A",
        endpoint: "https://agent.example.com/.well-known/agent-card.json",
        version: "0.3.0",
      },
    ],
  },
  {
    id: "custom",
    label: "Custom",
    description: "Start from scratch",
    name: "",
    formDescription: "",
    services: [],
  },
];
