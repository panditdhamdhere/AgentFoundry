import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="w-full px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
          Developer Docs
        </h1>
        <p className="mt-3 text-base leading-relaxed text-zinc-500">
          API reference, SDK, and integration examples for AgentFoundry.
        </p>

        <div className="mt-12 space-y-12">
          <section>
            <h2 className="text-xl font-semibold text-zinc-100">
              REST API
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Base URL: <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-teal-400">/api/v1</code>
            </p>

            <div className="mt-6 space-y-6">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                <h3 className="font-mono text-sm font-medium text-teal-400">
                  GET /api/v1/chains
                </h3>
                <p className="mt-2 text-sm text-zinc-400">
                  List supported chains with identity and reputation registry addresses.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                <h3 className="font-mono text-sm font-medium text-teal-400">
                  POST /api/v1/agent-card
                </h3>
                <p className="mt-2 text-sm text-zinc-400">
                  Create and upload agent card to IPFS. Requires agentId from a prior register() call.
                </p>
                <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-950 p-4 text-xs text-zinc-300">
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

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                <h3 className="font-mono text-sm font-medium text-teal-400">
                  POST /api/v1/upload
                </h3>
                <p className="mt-2 text-sm text-zinc-400">
                  Upload image file (multipart/form-data, field: file). Returns ipfsUri.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                <h3 className="font-mono text-sm font-medium text-teal-400">
                  GET /api/v1/reputation?agentId=1&chainId=84532
                </h3>
                <p className="mt-2 text-sm text-zinc-400">
                  Get reputation summary for an agent.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100">
              SDK
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Import from <code className="rounded bg-zinc-800 px-1.5 py-0.5">@/lib/agentfoundry-client</code>
            </p>
            <pre className="mt-4 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 text-sm text-zinc-300">
{`import { AgentFoundryClient } from "@/lib/agentfoundry-client";

const client = new AgentFoundryClient("https://your-agentfoundry.com");

// Get supported chains
const { chains } = await client.getChains();

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
            <h2 className="text-xl font-semibold text-zinc-100">
              Embeddable Widget
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Add the registration form to any site via iframe or React component.
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-medium text-zinc-400">iframe</p>
                <pre className="mt-1 overflow-x-auto rounded-lg bg-zinc-950 p-4 text-xs text-zinc-300">
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
                <pre className="mt-1 overflow-x-auto rounded-lg bg-zinc-950 p-4 text-xs text-zinc-300">
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
            <h2 className="text-xl font-semibold text-zinc-100">
              Registration Flow
            </h2>
            <ol className="mt-4 list-decimal space-y-2 pl-6 text-sm text-zinc-400">
              <li>Call register() on the Identity Registry contract</li>
              <li>Parse agentId from the Registered event</li>
              <li>POST to /api/v1/agent-card with agentId and metadata</li>
              <li>Call setAgentURI(agentId, ipfsUri) on the Identity Registry</li>
            </ol>
          </section>
        </div>

        <p className="mt-12 text-center text-sm text-zinc-500">
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
