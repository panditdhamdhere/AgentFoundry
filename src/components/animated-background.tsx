"use client";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(20,184,166,0.12),transparent)]" />

      {/* Animated gradient blobs - Aurora / AI vibe */}
      <div className="absolute -left-40 -top-40 h-80 w-80 animate-blob rounded-full bg-teal-500/25 opacity-80 blur-3xl" />
      <div className="absolute -right-40 -top-40 h-80 w-80 animate-blob rounded-full bg-cyan-500/20 opacity-80 blur-3xl [animation-delay:2s]" />
      <div className="absolute -bottom-40 left-1/2 h-80 w-80 -translate-x-1/2 animate-blob rounded-full bg-teal-400/15 opacity-80 blur-3xl [animation-delay:4s]" />

      {/* Secondary subtle blobs */}
      <div className="absolute left-1/3 top-1/2 h-64 w-64 animate-blob-slow rounded-full bg-teal-500/12 opacity-70 blur-3xl" />
      <div className="absolute right-1/4 top-1/3 h-64 w-64 animate-blob-slow rounded-full bg-cyan-500/12 opacity-70 blur-3xl [animation-delay:3s]" />

      {/* Floating particles - AI/agent vibe */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 animate-float rounded-full bg-teal-400/30"
            style={{
              left: `${(i * 7) % 100}%`,
              top: `${(i * 11) % 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${8 + (i % 4)}s`,
            }}
          />
        ))}
      </div>

      {/* Subtle dot grid overlay - AI/tech feel */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(148 163 184) 1px, transparent 0)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Gradient noise overlay for depth */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
