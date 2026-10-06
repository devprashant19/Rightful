import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";

export async function GET() {
  const env = getEnv();

  if (!env.hasNebius) {
    return NextResponse.json({ error: "NEBIUS_API_KEY is not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(`${env.nebiusBaseUrl}/models`, {
      headers: {
        Authorization: `Bearer ${env.nebiusKey}`,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `Nebius API error ${res.status}: ${errText}` }, { status: res.status });
    }

    const json = await res.json();
    const models = (json.data || [])
      .map((m: { id: string }) => m.id)
      .filter((id: string) => id.toLowerCase().includes("nemotron") || id.toLowerCase().includes("nvidia"))
      .sort();

    return NextResponse.json({
      total: models.length,
      nemotron_models: models,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

