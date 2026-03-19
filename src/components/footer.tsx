import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-800/80 bg-zinc-950/50">
      <div className="w-full px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-500/20 text-teal-400">
                ◈
              </span>
              Agent Registry
            </Link>
            <p className="mt-2 max-w-xs text-sm text-zinc-500">
              No-code ERC-8004 registration. Register your AI agents on-chain in
              minutes.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <h4 className="text-sm font-medium text-zinc-300">Product</h4>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link
                    href="/register"
                    className="text-sm text-zinc-500 hover:text-teal-400"
                  >
                    Create Agent
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="text-sm text-zinc-500 hover:text-teal-400"
                  >
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-zinc-300">
                ERC-8004 Ecosystem
              </h4>
              <ul className="mt-3 space-y-2">
                <li>
                  <a
                    href="https://www.8004.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-500 hover:text-teal-400"
                  >
                    8004.org
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.8004scan.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-500 hover:text-teal-400"
                  >
                    8004scan
                  </a>
                </li>
                <li>
                  <a
                    href="https://best-practices.8004scan.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-500 hover:text-teal-400"
                  >
                    Best Practices
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-zinc-300">Resources</h4>
              <ul className="mt-3 space-y-2">
                <li>
                  <a
                    href="https://eips.ethereum.org/EIPS/eip-8004"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-500 hover:text-teal-400"
                  >
                    ERC-8004 Spec
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.alchemy.com/faucets/base-sepolia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-500 hover:text-teal-400"
                  >
                    Base Sepolia Faucet
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-800/80 pt-8 sm:flex-row">
          <p className="text-xs text-zinc-600">
            Built on Base Sepolia. Part of the ERC-8004 Trustless Agents
            ecosystem.
          </p>
        </div>
      </div>
    </footer>
  );
}
