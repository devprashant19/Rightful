import { getEnv } from "@/lib/env";

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  raw_content?: string;
}

export interface TavilyExtractResult {
  url: string;
  raw_content: string;
}

export class TavilyError extends Error {
  constructor(public endpoint: string, public statusCode: number, message: string) {
    super(`[Tavily ${endpoint}] Error (${statusCode}): ${message}`);
    this.name = "TavilyError";
  }
}

export async function tavilySearch(
  query: string,
  options: { include_domains?: string[]; max_results?: number; search_depth?: "basic" | "advanced" } = {}
): Promise<TavilySearchResult[]> {
  const env = getEnv();
  if (!env.tavilyKey) throw new TavilyError("/search", 500, "TAVILY_API_KEY is not configured.");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.tavilyKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        search_depth: options.search_depth ?? "advanced",
        include_domains: options.include_domains && options.include_domains.length > 0 ? options.include_domains : undefined,
        max_results: options.max_results ?? 5,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new TavilyError("/search", res.status, await res.text());
    }

    const json = await res.json();
    return json.results || [];
  } finally {
    clearTimeout(timeout);
  }
}

export async function tavilyExtract(urls: string[]): Promise<TavilyExtractResult[]> {
  const env = getEnv();
  if (!env.tavilyKey) throw new TavilyError("/extract", 500, "TAVILY_API_KEY is not configured.");
  if (urls.length === 0) return [];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout

  try {
    const res = await fetch("https://api.tavily.com/extract", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.tavilyKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ urls }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new TavilyError("/extract", res.status, await res.text());
    }

    const json = await res.json();
    return json.results || [];
  } finally {
    clearTimeout(timeout);
  }
}

