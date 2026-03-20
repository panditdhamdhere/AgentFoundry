import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-800/80 px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="relative w-full">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/5 px-4 py-2 text-sm font-medium text-teal-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-teal-400" />
              ERC-8004 Identity Registry
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl md:text-6xl lg:text-7xl">
              Register AI Agents{" "}
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                On-Chain
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
              No-code registration for the trustless agent economy. Give your AI
              agent a portable identity, discoverable endpoints, and composable
              reputation across 40+ chains.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="btn-primary"
              >
                Create Agent
                <span className="ml-2 text-teal-200">→</span>
              </Link>
              <a
                href="https://www.8004scan.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                Explore on 8004scan
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-zinc-800/80 bg-zinc-900/40 px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full">
          <div className="flex flex-wrap items-center justify-center gap-12 text-center sm:justify-between">
            <div>
              <p className="text-2xl font-semibold tabular-nums text-zinc-100">
                40+ Chains
              </p>
              <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-zinc-500">
                Base · Polygon · Arbitrum · Optimism
              </p>
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums text-teal-400">
                ERC-721
              </p>
              <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-zinc-500">
                Agent NFTs
              </p>
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums text-zinc-100">
                Identity · Reputation · Validation
              </p>
              <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-zinc-500">
                Three Registries
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="w-full px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
          Why Register with ERC-8004?
        </h2>
        <p className="mt-2 text-zinc-500">
          Built for the trustless agent economy.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-xl shadow-black/20 transition-all hover:border-zinc-700/80 hover:bg-zinc-800/50 hover:shadow-teal-500/5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-600/10 text-teal-400">
              <span className="text-xl">◈</span>
            </div>
            <h3 className="font-semibold text-zinc-100">Portable Identity</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
              Your agent exists as an NFT on Ethereum and L2s. It&apos;s yours,
              not tied to any platform.
            </p>
          </div>
          <div className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-xl shadow-black/20 transition-all hover:border-zinc-700/80 hover:bg-zinc-800/50 hover:shadow-teal-500/5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-600/10 text-teal-400">
              <span className="text-xl">◇</span>
            </div>
            <h3 className="font-semibold text-zinc-100">Discoverable Endpoints</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
              Advertise MCP, A2A, web, and wallet endpoints so others can find
              and interact with your agent.
            </p>
          </div>
          <div className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-xl shadow-black/20 transition-all hover:border-zinc-700/80 hover:bg-zinc-800/50 hover:shadow-teal-500/5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-600/10 text-teal-400">
              <span className="text-xl">◎</span>
            </div>
            <h3 className="font-semibold text-zinc-100">Composable Reputation</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
              Feedback from clients builds a track record that follows your
              agent everywhere.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-800/80 px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-xl shadow-black/20 sm:p-10">
            <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
              <div>
                <h3 className="text-xl font-semibold text-zinc-100">
                  Browse agents on 8004scan
                </h3>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-zinc-500">
                  Explore hundreds of registered agents, reputation data, and
                  validation proofs across multiple chains.
                </p>
              </div>
              <a
                href="https://www.8004scan.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 btn-primary"
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
