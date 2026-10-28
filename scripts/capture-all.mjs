import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACT_DIR = "C:\\Users\\amank\\.gemini\\antigravity\\brain\\0d5542aa-ade4-4d44-8aa0-8ae36e124b69";
const TEMP_DIR = process.env.TEMP || "C:\\Users\\amank\\AppData\\Local\\Temp";

const pages = [
  { name: "shot_landing.png", url: "http://localhost:3000/", width: 1440, height: 960 },
  { name: "shot_dashboard.png", url: "http://localhost:3000/?view=dashboard", width: 1440, height: 960 },
  { name: "shot_portal.png", url: "http://localhost:3000/portal", width: 1440, height: 900 },
  { name: "shot_pack.png", url: "http://localhost:3000/pack", width: 1200, height: 900 },
  { name: "shot_velia.png", url: "http://localhost:3000/index.html", width: 1440, height: 960 },
];

console.log("--> Starting full-page screenshot capture suite...");

for (const p of pages) {
  const tempTarget = path.join(TEMP_DIR, p.name);
  const artifactTarget = path.join(ARTIFACT_DIR, p.name);

  // Remove existing temp file if any
  try { if (fs.existsSync(tempTarget)) fs.unlinkSync(tempTarget); } catch {}

  console.log(`\nCapturing [${p.name}] from ${p.url} (${p.width}x${p.height})...`);

  const res = spawnSync(
    EDGE_PATH,
    [
      "--headless=new",
      "--disable-gpu",
      `--window-size=${p.width},${p.height}`,
      `--screenshot=${tempTarget}`,
      p.url,
    ],
    { stdio: "inherit", timeout: 25000 }
  );

  if (fs.existsSync(tempTarget)) {
    const stat = fs.statSync(tempTarget);
    fs.copyFileSync(tempTarget, artifactTarget);
    console.log(`✓ Saved ${p.name} (${stat.size} bytes) to artifact directory.`);
  } else {
    console.error(`✗ Failed to capture ${p.name}`);
  }
}

console.log("\n--> Screenshot capture suite completed.");

