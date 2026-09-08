export function getEnv() {
  const tavilyKey = process.env.TAVILY_API_KEY || process.env.TAVILY_KEY || "";
  const nebiusKey = process.env.NEBIUS_API_KEY || "";
  const nebiusBaseUrl = process.env.NEBIUS_BASE_URL || "https://api.tokenfactory.nebius.com/v1";

  const fastModel = process.env.NEMOTRON_FAST_MODEL || "nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B";
  const reasonModel = process.env.NEMOTRON_REASON_MODEL || "nvidia/nemotron-3-super-120b-a12b";
  const ultraModel = process.env.NEMOTRON_ULTRA_MODEL || "";
  const visionModel = process.env.NEMOTRON_VISION_MODEL || "";

  const forceReplay = process.env.DEMO_FORCE_REPLAY === "true";
  const judgeAccessCode = process.env.JUDGE_ACCESS_CODE || "RIGHTFUL2026_JUDGE_PASS";
  const rateLimit = parseInt(process.env.RATE_LIMIT_PER_10MIN || "10", 10);

  return {
    tavilyKey,
    nebiusKey,
    nebiusBaseUrl,
    fastModel,
    reasonModel,
    ultraModel,
    visionModel,
    forceReplay,
    judgeAccessCode,
    rateLimit,
    hasNebius: Boolean(nebiusKey),
    hasTavily: Boolean(tavilyKey),
    isLive: Boolean(nebiusKey && tavilyKey && !forceReplay),
  };
}

