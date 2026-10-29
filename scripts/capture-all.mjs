/**
 * Full-page screenshot capture suite.
 *
 * Captures the judge-facing surfaces into ./video/stills/ using whichever
 * Chromium-family browser is installed. Output is deterministic and portable:
 * the previous version of this script wrote to a hardcoded absolute path on a
 * different machine and captured a page that no longer exists.
 *
 * Usage:
 *   npm run dev                 # app must be running
 *   node scripts/capture-all.mjs
 *   node scripts/capture-all.mjs --base http://localhost:3000 --out video/stills
 */
import { spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

const args = process.argv.slice(2);
const argOf = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

const BASE = argOf("--base", process.env.CAPTURE_BASE_URL || "http://localhost:3000");
const OUT_DIR = path.resolve(argOf("--out", "video/stills"));

/** Chromium-family browsers, in preference order, across platforms. */
const CANDIDATES = [
  process.env.CHROME_PATH,
  process.platform === "win32" && "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  process.platform === "win32" && "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  process.platform === "win32" && "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  process.platform === "win32" && "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  process.platform === "darwin" && "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  process.platform === "linux" && "/usr/bin/google-chrome",
  process.platform === "linux" && "/usr/bin/chromium",
].filter(Boolean);

const browser = CANDIDATES.find((p) => {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
});

if (!browser) {
  console.error("[FAIL] No Chromium-family browser found.");
  console.error("       Set CHROME_PATH to a Chrome/Edge executable and retry.");
  process.exit(1);
}

/**
 * Surfaces worth showing a judge. The three marked `film` are the stills the
 * demo-film spec uses for the closing product montage.
 */
const pages = [
  { name: "shot_landing.png", route: "/", width: 1440, height: 960 },
  { name: "shot_dashboard.png", route: "/?view=dashboard", width: 1440, height: 960 },
  { name: "shot_portal.png", route: "/portal", width: 1440, height: 900, film: true },
  { name: "shot_pack.png", route: "/pack", width: 1200, height: 900, film: true },
];

fs.mkdirSync(OUT_DIR, { recursive: true });

console.log(`--> Capturing ${pages.length} pages`);
console.log(`    browser: ${browser}`);
console.log(`    base:    ${BASE}`);
console.log(`    out:     ${OUT_DIR}\n`);

let ok = 0;
for (const p of pages) {
  const url = `${BASE}${p.route}`;
  // Chrome's --screenshot writes relative to cwd, so render to a temp file and move it.
  const tmp = path.join(os.tmpdir(), `rightful-${Date.now()}-${p.name}`);
  const dest = path.join(OUT_DIR, p.name);

  console.log(`[${p.name}] ${url} (${p.width}x${p.height})`);

  spawnSync(
    browser,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-color-profile=srgb",
      `--window-size=${p.width},${p.height}`,
      `--screenshot=${tmp}`,
      url,
    ],
    { stdio: "ignore", timeout: 30000 }
  );

  if (fs.existsSync(tmp)) {
    fs.renameSync(tmp, dest);
    console.log(`  ok  ${(fs.statSync(dest).size / 1024).toFixed(0)} KB -> ${path.relative(process.cwd(), dest)}`);
    ok++;
  } else {
    console.error(`  FAIL  no output (is the dev server running at ${BASE}?)`);
  }
}

console.log(`\n${ok}/${pages.length} captured into ${path.relative(process.cwd(), OUT_DIR)}`);
process.exit(ok === pages.length ? 0 : 1);
