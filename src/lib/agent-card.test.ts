import { describe, it, expect } from "vitest";
import { buildAgentCard } from "./agent-card";

describe("buildAgentCard", () => {
  it("builds valid agent card for baseSepolia", () => {
    const card = buildAgentCard({
      chainId: 84532,
      agentId: 1,
      name: "Test Agent",
      description: "A test",
      image: "ipfs://QmTest",
      services: [{ name: "MCP", endpoint: "https://mcp.example.com" }],
    });
    expect(card.type).toBe("https://eips.ethereum.org/EIPS/eip-8004#registration-v1");
    expect(card.name).toBe("Test Agent");
    expect(card.registrations[0].agentId).toBe(1);
    expect(card.registrations[0].agentRegistry.startsWith("eip155:84532:")).toBe(true);
    expect(card.services).toHaveLength(1);
    expect(card.services[0].name).toBe("MCP");
  });

  it("throws for unsupported chain", () => {
    expect(() =>
      buildAgentCard({
        chainId: 99999,
        agentId: 1,
        name: "X",
        description: "Y",
        image: "ipfs://x",
        services: [],
      })
    ).toThrow(/Unsupported chain/);
  });

  it("filters empty services", () => {
    const card = buildAgentCard({
      chainId: 84532,
      agentId: 1,
      name: "X",
      description: "Y",
      image: "https://x.com/img.png",
      services: [
        { name: "MCP", endpoint: "https://a.com" },
        { name: "", endpoint: "https://b.com" },
        { name: "A2A", endpoint: "" },
      ],
    });
    expect(card.services).toHaveLength(1);
    expect(card.services[0].name).toBe("MCP");
  });
});
