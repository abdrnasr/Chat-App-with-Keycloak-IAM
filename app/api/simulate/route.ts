export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const scenario = searchParams.get("scenario");

  // Case 1: No search parameter
  if (!scenario) {
    return NextResponse.json({ status: "ok" }, { status: 200 });
  }

  // Case 2: Slow scenario
  if (scenario === "slow") {
    await new Promise((r) => setTimeout(r, 500));
    return NextResponse.json({ status: "ok", delay: "500ms" }, { status: 200 });
  }

  // Case 3: Error scenario
  if (scenario === "error") {
    return NextResponse.json(
      { error: "Server error simulation" },
      { status: 500 }
    );
  }

  // Default fallback
  return NextResponse.json({ status: "ok" }, { status: 200 });
}
