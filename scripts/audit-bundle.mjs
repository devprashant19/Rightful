import fs from "fs";
import path from "path";

const nextStaticDir = path.resolve(".next/static");
if (!fs.existsSync(nextStaticDir)) {
  console.log("Run `npm run build` before auditing secrets.");
  process.exit(1);
}

const FORBIDDEN_PATTERNS = [
  /tvly-[a-zA-Z0-9_-]{20,}/i,
  /v1\.CmM[a-zA-Z0-9_.-]{30,}/i,
  /api\.tokenfactory\.nebius\.com/i,
];

let leakDetected = false;
let scannedFilesCount = 0;

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath);
    } else if (file.endsWith(".js") || file.endsWith(".json")) {
      scannedFilesCount++;
      const content = fs.readFileSync(fullPath, "utf-8");
      for (const pattern of FORBIDDEN_PATTERNS) {
        if (pattern.test(content)) {
          console.error(`[CRITICAL LEAK] Secret pattern detected in client file: ${fullPath}`);
          leakDetected = true;
        }
      }
    }
  }
}

console.log("--> Scanning .next/static client bundles for secret leakage...");
scanDir(nextStaticDir);
console.log(`--> Total client bundle files scanned: ${scannedFilesCount}`);

if (leakDetected) {
  console.error("[FAILED] API secrets detected in client bundle. Aborting.");
  process.exit(1);
} else {
  console.log("[PASS] Zero secrets detected in client bundles.");
}

