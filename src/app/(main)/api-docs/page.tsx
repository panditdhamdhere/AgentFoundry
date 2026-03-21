"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

import "swagger-ui-react/swagger-ui.css";

export default function ApiDocsPage() {
  const specUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/openapi`
      : "/api/openapi";

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800/70 bg-zinc-950/95 px-4 py-3 backdrop-blur-xl">
        <h1 className="text-lg font-semibold text-zinc-100">API Reference</h1>
        <Link
          href="/docs"
          className="text-sm font-medium text-teal-400 hover:text-teal-300"
        >
          ← Developer docs
        </Link>
      </div>
      <div className="swagger-wrap [&_.swagger-ui]:bg-transparent [&_.swagger-ui_.topbar]:hidden [&_.swagger-ui_.info]:text-zinc-300">
        <SwaggerUI url={specUrl} />
      </div>
    </div>
  );
}
