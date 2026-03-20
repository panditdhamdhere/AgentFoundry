"use client";

import { useMemo } from "react";

export interface AgentFoundryEmbedProps {
  /** Base URL of the AgentFoundry app. When embedding on external sites, pass your app URL (e.g. https://agentfoundry.vercel.app). */
  baseUrl?: string;
  /** Width of the iframe (default: "100%") */
  width?: string | number;
  /** Height of the iframe (default: 520) */
  height?: string | number;
  /** Optional className for the wrapper */
  className?: string;
}

/**
 * Embeddable iframe widget for AgentFoundry registration.
 * Drop this into any website to let users register ERC-8004 agents.
 *
 * @example
 * ```tsx
 * <AgentFoundryEmbed
 *   baseUrl="https://your-agentfoundry-domain.com"
 *   width="100%"
 *   height={520}
 * />
 * ```
 */
export function AgentFoundryEmbed({
  baseUrl,
  width = "100%",
  height = 520,
  className = "",
}: AgentFoundryEmbedProps) {
  const embedUrl = useMemo(() => {
    const base =
      baseUrl?.replace(/\/$/, "") ??
      (typeof window !== "undefined" ? window.location.origin : "");
    return `${base}/embed`;
  }, [baseUrl]);

  return (
    <iframe
      src={embedUrl}
      title="Register AI Agent - AgentFoundry"
      width={width}
      height={height}
      className={`border-0 rounded-xl ${className}`}
      style={{ minHeight: typeof height === "number" ? `${height}px` : height }}
      allow="clipboard-write"
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
    />
  );
}
