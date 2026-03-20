"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { SiweButton } from "./siwe-button";

export function ExploreDropdown() {
  const { address } = useAccount();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-zinc-100"
      >
        Explore <span className="ml-0.5 text-zinc-500">▾</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-xl border border-zinc-800/80 bg-zinc-950 py-1 shadow-xl">
          <Link
            href="/mcp"
            className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100"
            onClick={() => setOpen(false)}
          >
            MCP Discovery
          </Link>
          <a
            href="https://www.8004scan.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100"
            onClick={() => setOpen(false)}
          >
            8004scan
          </a>
          <a
            href="https://eips.ethereum.org/EIPS/eip-8004"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100"
            onClick={() => setOpen(false)}
          >
            ERC-8004 Spec
          </a>
          {address && (
            <div className="border-t border-zinc-800/60 px-2 py-2">
              <SiweButton />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
