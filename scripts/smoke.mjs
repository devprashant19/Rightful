import fs from "fs";
import path from "path";

// Simple env loader
const envFile = path.resolve(".env.local");
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, "utf-8").split("\n");
  for (const line of lines) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      process.env[key] = value.trim();
    }
  }
}

const nebiusKey = process.env.NEBIUS_API_KEY;
const nebiusBase = process.env.NEBIUS_BASE_URL || "https://api.tokenfactory.nebius.com/v1";
const fastModel = process.env.NEMOTRON_FAST_MODEL || "nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B";
const tavilyKey = process.env.TAVILY_API_KEY || process.env.TAVILY_KEY;

async function testNebius() {
  console.log("--> Testing Nebius Token Factory with model:", fastModel);
  const start = Date.now();
  try {
    const res = await fetch(`${nebiusBase}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${nebiusKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: fastModel,
        messages: [{ role: "user", content: "Reply with exactly: OK" }],
        max_tokens: 100,
        temperature: 0,
      }),
    });
    const latency = Date.now() - start;
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    const reply = data.choices[0]?.message?.content?.trim();
    console.log(`[PASS] Nebius response: "${reply}" (${latency}ms)`);
  } catch (err) {
    console.error(`[FAIL] Nebius test failed:`, err.message);
  }
}

async function testTavily() {
  console.log("--> Testing Tavily Search API...");
  const start = Date.now();
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tavilyKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: "return policy electronics",
        max_results: 1,
      }),
    });
    const latency = Date.now() - start;
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    console.log(`[PASS] Tavily returned ${data.results?.length || 0} results (${latency}ms)`);
  } catch (err) {
    console.error(`[FAIL] Tavily test failed:`, err.message);
  }
}

async function run() {
  console.log("=== Rightful Smoke Test ===");
  await testNebius();
  await testTavily();
  console.log("===========================");
}

run();
