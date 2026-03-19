"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl">
      <div className="flex h-14 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-500/20 text-teal-400">
            ◈
          </span>
          <span>Agent Registry</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className="rounded-md px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-zinc-100"
          >
            Home
          </Link>
          <a
            href="https://www.8004scan.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-zinc-100"
          >
            Explore Agents
          </a>
          <Link
            href="/register"
            className="rounded-md px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-zinc-100"
          >
            Create
          </Link>
          <a
            href="https://eips.ethereum.org/EIPS/eip-8004"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-zinc-100 sm:block"
          >
            Docs
          </a>
          <div className="ml-2">
            <ConnectButton />
          </div>
        </nav>
      </div>
    </header>
  );
}
