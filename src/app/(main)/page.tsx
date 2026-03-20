import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-800/60 px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
        <div className="relative mx-auto max-w-5xl">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-400" />
              ERC-8004 Identity Registry
            </div>
            <h1 className="prose-heading text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl md:text-6xl lg:text-7xl">
              Register AI Agents{" "}
              <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 bg-clip-text text-transparent">
                On-Chain
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
              No-code registration for the trustless agent economy. Give your AI
              agent a portable identity, discoverable endpoints, and composable
              reputation across 40+ chains.
            </p>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <Link href="/register" className="btn-primary">
                Create Agent
                <span className="ml-2 text-teal-200/90">→</span>
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
      <section className="border-b border-zinc-800/60 bg-zinc-950/50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center justify-center gap-16 text-center sm:justify-between">
            <div>
              <p className="prose-heading text-2xl font-semibold tabular-nums text-zinc-100">
                40+ Chains
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-widest text-zinc-500">
                Base · Polygon · Arbitrum · Optimism
              </p>
            </div>
            <div>
              <p className="prose-heading text-2xl font-semibold tabular-nums text-teal-400">
                ERC-721
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-widest text-zinc-500">
                Agent NFTs
              </p>
            </div>
            <div>
              <p className="prose-heading text-2xl font-semibold tabular-nums text-zinc-100">
                Identity · Reputation · Validation
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-widest text-zinc-500">
                Three Registries
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding w-full">
        <div className="mx-auto max-w-5xl">
          <h2 className="prose-heading text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
            Why Register with ERC-8004?
          </h2>
          <p className="mt-2 text-zinc-500">Built for the trustless agent economy.</p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="card-base card-hover group p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-600/10 text-teal-400 transition-colors group-hover:from-teal-500/30 group-hover:to-teal-600/20">
                <span className="text-xl">◈</span>
              </div>
              <h3 className="prose-heading font-semibold text-zinc-100">
                Portable Identity
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                Your agent exists as an NFT on Ethereum and L2s. It&apos;s yours,
                not tied to any platform.
              </p>
            </div>
            <div className="card-base card-hover group p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-600/10 text-teal-400 transition-colors group-hover:from-teal-500/30 group-hover:to-teal-600/20">
                <span className="text-xl">◇</span>
              </div>
              <h3 className="prose-heading font-semibold text-zinc-100">
                Discoverable Endpoints
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                Advertise MCP, A2A, web, and wallet endpoints so others can find
                and interact with your agent.
              </p>
            </div>
            <div className="card-base card-hover group p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-600/10 text-teal-400 transition-colors group-hover:from-teal-500/30 group-hover:to-teal-600/20">
                <span className="text-xl">◎</span>
              </div>
              <h3 className="prose-heading font-semibold text-zinc-100">
                Composable Reputation
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                Feedback from clients builds a track record that follows your
                agent everywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-800/60 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="card-base p-8 sm:p-10">
            <div className="flex flex-col items-center gap-8 text-center sm:flex-row sm:justify-between sm:text-left">
              <div>
                <h3 className="prose-heading text-xl font-semibold text-zinc-100">
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
