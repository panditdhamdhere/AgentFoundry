import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero - 8004scan style: compact, explorer feel */}
      <section className="relative overflow-hidden border-b border-zinc-800/80 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="relative w-full">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/5 px-4 py-1.5 text-sm text-teal-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-teal-400" />
              ERC-8004 Identity Registry
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Register AI Agents{" "}
              <span className="text-teal-400">On-Chain</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base text-zinc-500 sm:text-lg">
              No-code registration for the trustless agent economy. Give your AI
              agent a portable identity, discoverable endpoints, and composable
              reputation.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-teal-500"
              >
                Create Agent
                <span className="text-teal-300">→</span>
              </Link>
              <a
                href="https://www.8004scan.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-2.5 font-medium text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
              >
                Explore on 8004scan
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar - explorer style */}
      <section className="border-b border-zinc-800/80 bg-zinc-900/30 px-4 py-4 sm:px-6 lg:px-8">
        <div className="w-full">
          <div className="flex flex-wrap items-center justify-center gap-8 text-center sm:justify-between">
            <div>
              <p className="text-2xl font-semibold tabular-nums text-zinc-100">
                Multi-Chain
              </p>
              <p className="text-xs text-zinc-500">
                40+ chains · Base, Polygon, Arbitrum, etc.
              </p>
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums text-teal-400">
                ERC-721
              </p>
              <p className="text-xs text-zinc-500">Agent NFTs</p>
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums text-zinc-100">
                Identity · Reputation · Validation
              </p>
              <p className="text-xs text-zinc-500">Three Registries</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features - card grid like 8004scan */}
      <section className="w-full px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-lg font-semibold text-zinc-200">
          Why Register with ERC-8004?
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-zinc-700 hover:bg-zinc-800/50">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
              <span className="text-lg">◈</span>
            </div>
            <h3 className="font-medium text-zinc-100">Portable Identity</h3>
            <p className="mt-1.5 text-sm text-zinc-500">
              Your agent exists as an NFT on Ethereum and L2s. It&apos;s yours,
              not tied to any platform.
            </p>
          </div>
          <div className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-zinc-700 hover:bg-zinc-800/50">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
              <span className="text-lg">◇</span>
            </div>
            <h3 className="font-medium text-zinc-100">Discoverable Endpoints</h3>
            <p className="mt-1.5 text-sm text-zinc-500">
              Advertise MCP, A2A, web, and wallet endpoints so others can find
              and interact with your agent.
            </p>
          </div>
          <div className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-zinc-700 hover:bg-zinc-800/50">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
              <span className="text-lg">◎</span>
            </div>
            <h3 className="font-medium text-zinc-100">Composable Reputation</h3>
            <p className="mt-1.5 text-sm text-zinc-500">
              Feedback from clients builds a track record that follows your
              agent everywhere.
            </p>
          </div>
        </div>
      </section>

      {/* Explore CTA - link to 8004scan */}
      <section className="border-t border-zinc-800/80 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 sm:p-8">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
              <div>
                <h3 className="font-semibold text-zinc-100">
                  Browse agents on 8004scan
                </h3>
                <p className="mt-1 text-sm text-zinc-500">
                  Explore hundreds of registered agents, reputation data, and
                  validation proofs across multiple chains.
                </p>
              </div>
              <a
                href="https://www.8004scan.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-lg border border-teal-500/50 bg-teal-500/10 px-4 py-2 font-medium text-teal-400 transition-colors hover:bg-teal-500/20"
              >
                Visit 8004scan →
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
