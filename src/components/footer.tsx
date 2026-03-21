import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-zinc-800/70 bg-zinc-950/50">
      <div className="w-full px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <Link
              href="/"
              className="flex items-center gap-3 text-lg font-semibold tracking-tight text-zinc-50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/90 to-teal-600/90 text-white shadow-lg shadow-teal-500/25">
                ◈
              </span>
              <span className="prose-heading">AgentFoundry</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-zinc-500">
              No-code ERC-8004 registration. Give your AI agent portable identity,
              discoverable endpoints, and composable reputation across 40+ chains.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Product
              </h4>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link
                    href="/register"
                    className="text-sm text-zinc-500 transition-colors hover:text-teal-400"
                  >
                    Create Agent
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="text-sm text-zinc-500 transition-colors hover:text-teal-400"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/embed"
                    className="text-sm text-zinc-500 transition-colors hover:text-teal-400"
                  >
                    Embed
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                ERC-8004
              </h4>
              <ul className="mt-4 space-y-3">
                <li>
                  <a
                    href="https://www.8004.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-500 transition-colors hover:text-teal-400"
                  >
                    8004.org
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.8004scan.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-500 transition-colors hover:text-teal-400"
                  >
                    8004scan
                  </a>
                </li>
                <li>
                  <a
                    href="https://best-practices.8004scan.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-500 transition-colors hover:text-teal-400"
                  >
                    Best Practices
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Resources
              </h4>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link
                    href="/docs"
                    className="text-sm text-zinc-500 transition-colors hover:text-teal-400"
                  >
                    Developer Docs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/api-docs"
                    className="text-sm text-zinc-500 transition-colors hover:text-teal-400"
                  >
                    API Reference (Swagger)
                  </Link>
                </li>
                <li>
                  <a
                    href="https://eips.ethereum.org/EIPS/eip-8004"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-500 transition-colors hover:text-teal-400"
                  >
                    ERC-8004 Spec
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.alchemy.com/faucets/base-sepolia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-500 transition-colors hover:text-teal-400"
                  >
                    Base Sepolia Faucet
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-zinc-800/70 pt-8 sm:flex-row">
          <p className="text-xs text-zinc-600">
            Multi-chain · Part of the ERC-8004 Trustless Agents ecosystem
          </p>
        </div>
      </div>
    </footer>
  );
}
