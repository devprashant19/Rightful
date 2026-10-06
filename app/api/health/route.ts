import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";

export async function GET() {
  const env = getEnv();

  return NextResponse.json({
    status: "ok",
    services: {
      nebius: env.hasNebius,
      tavily: env.hasTavily,
      live_mode: env.isLive,
      force_replay: env.forceReplay,
    },
    models: {
      fast: env.fastModel,
      reason: env.reasonModel,
      ultra: env.ultraModel || "not_configured",
    },
    timestamp: new Date().toISOString(),
  });
}

