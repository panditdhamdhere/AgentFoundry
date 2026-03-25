import { NextResponse } from "next/server";
import { computeTrustScore } from "@/lib/trust-score";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId");
    const chainIdParam = searchParams.get("chainId");
    const chainId = chainIdParam ? parseInt(chainIdParam, 10) : 84532;

    if (!agentId) {
      return NextResponse.json({ error: "agentId is required" }, { status: 400 });
    }

    const url = new URL(request.url);
    const base = `${url.protocol}//${url.host}`;

    const [repRes, valRes] = await Promise.all([
      fetch(`${base}/api/v1/reputation?agentId=${agentId}&chainId=${chainId}`),
      fetch(`${base}/api/v1/validation?agentId=${agentId}&chainId=${chainId}`),
    ]);

    if (!repRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch reputation data" },
        { status: 502 }
      );
    }
    if (!valRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch validation data" },
        { status: 502 }
      );
    }

    const rep = await repRes.json();
    const val = await valRes.json();

    const repCount = Number(rep.count ?? 0);
    const repSummaryValue = Number(rep.summaryValue ?? 0);
    const repDecimals = Number(rep.summaryValueDecimals ?? 0);
    const repAverage =
      repDecimals > 0
        ? repSummaryValue / Math.pow(10, repDecimals)
        : repSummaryValue;

    const validationAvailable = Boolean(val.available);
    const validationCount = Number(val.count ?? 0);
    const validationAverage = Number(val.averageResponse ?? 0);

    const trust = computeTrustScore({
      reputationCount: repCount,
      reputationAverage: repAverage,
      validationAvailable,
      validationCount,
      validationAverage,
    });

    return NextResponse.json({
      chainId,
      agentId,
      inputs: {
        reputationCount: repCount,
        reputationAverage: repAverage,
        validationAvailable,
        validationCount,
        validationAverage,
      },
      ...trust,
    });
  } catch (error) {
    console.error("Trust score API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to compute trust score",
      },
      { status: 500 }
    );
  }
}
