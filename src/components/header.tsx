"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BetaNav } from "@/components/beta-nav";
import { SiweButton } from "@/components/siwe-button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full min-w-0 border-b border-zinc-800/70 bg-zinc-950/95 backdrop-blur-xl">
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 text-lg font-semibold tracking-tight text-zinc-50 transition-opacity hover:opacity-90"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/90 to-teal-600/90 text-white shadow-lg shadow-teal-500/25">
            ◈
          </span>
          <span className="prose-heading">AgentFoundry</span>
          <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-2 py-0.5 text-xs font-semibold text-teal-400">
            Beta
          </span>
        </Link>

        <nav className="flex items-center gap-0.5 sm:gap-1">
          <Link
            href="/#join-beta"
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-zinc-100"
          >
            Join Beta
          </Link>
          <Link
            href="/"
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-zinc-100"
          >
            Home
          </Link>
          <Link
            href="/directory"
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-zinc-100"
          >
            Directory
          </Link>
          <Link
            href="/mcp"
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-zinc-100"
          >
            MCP
          </Link>
          <a
            href="https://www.8004scan.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-zinc-100"
          >
            8004scan
          </a>
          <BetaNav />
          <Link
            href="/feedback"
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-zinc-100"
          >
            Feedback
          </Link>
          <Link
            href="/docs"
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-zinc-100"
          >
            Docs
          </Link>
          <a
            href="https://eips.ethereum.org/EIPS/eip-8004"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-zinc-100 sm:block"
          >
            Spec
          </a>
          <div className="ml-3 flex items-center gap-3">
            <SiweButton />
            <ConnectButton />
          </div>
        </nav>
      </div>
    </header>
  );
}
