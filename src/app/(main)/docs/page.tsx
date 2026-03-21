import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="section-padding w-full">
      <div className="mx-auto max-w-3xl">
        <div className="page-header">
          <h1 className="page-title">Developer Docs</h1>
          <p className="page-description">
            API reference, SDK, and integration examples for AgentFoundry.
          </p>
        </div>

        <div className="space-y-14">
          <section>
            <h2 className="prose-heading text-xl font-semibold text-zinc-100">
              REST API
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Base URL:{" "}
              <code className="rounded-lg bg-zinc-800 px-2 py-1 font-mono text-teal-400">
                /api/v1
              </code>
              {" · "}
              <Link
                href="/api-docs"
                className="font-medium text-teal-400 transition-colors hover:text-teal-300"
              >
                OpenAPI / Swagger docs →
              </Link>
            </p>

            <div className="mt-6 space-y-4">
              <div className="card-base p-5">
                <h3 className="font-mono text-sm font-semibold text-teal-400">
                  GET /api/v1/agent/:chainId/:agentId
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  Fetch agent metadata and reputation in one request. Returns
                  chainId, agentId, owner, tokenURI, metadata, reputation, and
                  verification.
                </p>
              </div>

              <div className="card-base p-5">
                <h3 className="font-mono text-sm font-semibold text-teal-400">
                  GET /api/v1/chains
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  List supported chains with identity and reputation registry
                  addresses.
                </p>
              </div>

              <div className="card-base p-5">
                <h3 className="font-mono text-sm font-semibold text-teal-400">
                  POST /api/v1/agent-card
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  Create and upload agent card to IPFS. Requires agentId from a
                  prior register() call.
                </p>
                <pre className="mt-4 overflow-x-auto rounded-xl bg-zinc-950 p-4 text-xs leading-relaxed text-zinc-300">
                  {`{
  "chainId": 84532,
  "agentId": "1",
  "name": "My Agent",
  "description": "...",
  "image": "ipfs://...",
  "services": [{"name": "MCP", "endpoint": "https://..."}]
}`}
                </pre>
              </div>

              <div className="card-base p-5">
                <h3 className="font-mono text-sm font-semibold text-teal-400">
                  POST /api/v1/upload
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  Upload image file (multipart/form-data, field: file). Returns
                  ipfsUri.
                </p>
              </div>

              <div className="card-base p-5">
                <h3 className="font-mono text-sm font-semibold text-teal-400">
                  GET /api/v1/reputation?agentId=1&chainId=84532
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  Get reputation summary for an agent.
                </p>
              </div>

              <div className="card-base p-5">
                <h3 className="font-mono text-sm font-semibold text-teal-400">
                  GET /api/v1/mcp-discovery?chainId=84532
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  List agents with MCP endpoints for Model Context Protocol clients.
                </p>
              </div>

              <div className="card-base p-5">
                <h3 className="font-mono text-sm font-semibold text-teal-400">
                  POST /api/v1/webhooks
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  Register a webhook URL for events: registration, uri_update,
                  feedback. Requires API key when configured.
                </p>
                <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-950 p-3 text-xs text-zinc-300">
                  {`{ "url": "https://your-server.com/webhook", "events": ["registration", "uri_update", "feedback"] }`}
                </pre>
              </div>
            </div>
          </section>

          <section>
            <h2 className="prose-heading text-xl font-semibold text-zinc-100">
              SDK
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Use the published SDK{" "}
              <code className="rounded-lg bg-zinc-800 px-2 py-1">
                @agentfoundry/sdk
              </code>{" "}
              for typed methods and clearer error handling.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 text-sm leading-relaxed text-zinc-300">
              {`import { AgentFoundryClient } from "@agentfoundry/sdk";

const client = new AgentFoundryClient({ baseUrl: "https://your-agentfoundry.com" });

// Get supported chains
const { chains } = await client.getChains();

// Fetch agent metadata + reputation in one call
const agent = await client.getAgent(84532, "1");
console.log(agent.metadata, agent.reputation);

// After register() confirms, create agent card
const { ipfsUri } = await client.createAgentCard({
  chainId: 84532,
  agentId: 1,
  name: "My Agent",
  description: "...",
  image: "ipfs://...",
  services: [{ name: "MCP", endpoint: "https://..." }],
});
// Then call setAgentURI(agentId, ipfsUri) on the registry

// Get reputation
const rep = await client.getReputation("1", 84532);
console.log(rep.count, rep.summaryValue);`}
            </pre>
          </section>

          <section>
            <h2 className="prose-heading text-xl font-semibold text-zinc-100">
              Embeddable Widget
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Add the registration form to any site via iframe or React component.
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-medium text-zinc-400">iframe</p>
                <pre className="mt-2 overflow-x-auto rounded-xl bg-zinc-950 p-4 text-xs leading-relaxed text-zinc-300">
                  {`<iframe
  src="https://your-agentfoundry.com/embed"
  width="100%"
  height="520"
  title="Register AI Agent"
/>`}
                </pre>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-400">React</p>
                <pre className="mt-2 overflow-x-auto rounded-xl bg-zinc-950 p-4 text-xs leading-relaxed text-zinc-300">
                  {`import { AgentFoundryEmbed } from "@/components/embed-widget";

<AgentFoundryEmbed
  baseUrl="https://your-agentfoundry.com"
  width="100%"
  height={520}
/>`}
                </pre>
              </div>
            </div>
          </section>

          <section>
            <h2 className="prose-heading text-xl font-semibold text-zinc-100">
              Registration Flow
            </h2>
            <ol className="mt-4 list-decimal space-y-3 pl-6 text-sm leading-relaxed text-zinc-400">
              <li>Call register() on the Identity Registry contract</li>
              <li>Parse agentId from the Registered event</li>
              <li>POST to /api/v1/agent-card with agentId and metadata</li>
              <li>Call setAgentURI(agentId, ipfsUri) on the Identity Registry</li>
            </ol>
          </section>
        </div>

        <p className="mt-14 text-center text-sm text-zinc-500">
          <Link
            href="/"
            className="font-medium text-teal-400 transition-colors hover:text-teal-300"
          >
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
