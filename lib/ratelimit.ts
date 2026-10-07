import crypto from "crypto";
import { getEnv } from "@/lib/env";

const ipRequestMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimitAndJudgeAccess(
  ip: string,
  judgeHeaderCode: string | null
): { allowed: boolean; isJudge: boolean; remaining: number } {
  const env = getEnv();

  // Judge code verification (constant-time comparison)
  let isJudge = false;
  if (judgeHeaderCode && env.judgeAccessCode) {
    try {
      const a = Buffer.from(judgeHeaderCode.trim());
      const b = Buffer.from(env.judgeAccessCode.trim());
      if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
        isJudge = true;
      }
    } catch {
      isJudge = false;
    }
  }

  // Judges completely bypass all rate limits and force-replay
  if (isJudge) {
    return { allowed: true, isJudge: true, remaining: 9999 };
  }

  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const limit = env.rateLimit;

  const current = ipRequestMap.get(ip) || { count: 0, resetTime: now + windowMs };

  if (now > current.resetTime) {
    current.count = 1;
    current.resetTime = now + windowMs;
    ipRequestMap.set(ip, current);
    return { allowed: true, isJudge: false, remaining: limit - 1 };
  }

  if (current.count >= limit) {
    return { allowed: false, isJudge: false, remaining: 0 };
  }

  current.count++;
  ipRequestMap.set(ip, current);
  return { allowed: true, isJudge: false, remaining: limit - current.count };
}

