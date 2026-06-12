import { NextRequest, NextResponse } from "next/server";
import { settleDueBallots } from "@/app/lib/ballots";

export const dynamic = "force-dynamic";

/**
 * Close admission ballots whose window has ended (insufficient accepts ⇒
 * refused). Hit daily by an external scheduler; guarded by CRON_SECRET.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const settled = await settleDueBallots();
  return NextResponse.json({ settled });
}
