"use client";

export function EnvBanner() {
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";
  const hasWalletConnect =
    projectId.trim() && projectId !== "YOUR_PROJECT_ID";
  if (hasWalletConnect) return null;

  return (
    <div className="bg-amber-500/20 border-b border-amber-500/40 px-4 py-2 text-center text-sm text-amber-200">
      <strong>Config needed:</strong> Add{" "}
      <code className="rounded bg-black/30 px-1">NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID</code> in
      Vercel → Settings → Environment Variables, then redeploy. Wallet connect
      will not work until then.
    </div>
  );
}
