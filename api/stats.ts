/**
 * Public stats for the AAF homepage: GitHub repo, MCP tool calls, posture reports, pillar averages.
 * Reads from Vercel Blob (updated by cron) when BLOB_READ_WRITE_TOKEN is set; else live GitHub + AAF_STATS_JSON.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { list } from "@vercel/blob";

const GITHUB_REPO = "AgenticAF-Community/FrameworkCore";
const GITHUB_API = "https://api.github.com/repos/" + GITHUB_REPO;
const BLOB_PATH = "aaf-stats.json";

export interface StatsResponse {
  github: {
    stars: number;
    forks: number;
    openIssues: number;
    contributors?: number;
  };
  mcpToolCalls: number;
  postureReports: number;
  posturePillarAverages: Record<string, number>;
}

async function fetchGitHub(): Promise<StatsResponse["github"]> {
  const res = await fetch(GITHUB_API, {
    headers: { Accept: "application/vnd.github.v3+json", "User-Agent": "AAF-Stats" },
  });
  if (!res.ok) return { stars: 0, forks: 0, openIssues: 0 };
  const data = (await res.json()) as Record<string, number>;
  return {
    stars: data.stargazers_count ?? 0,
    forks: data.forks_count ?? 0,
    openIssues: data.open_issues_count ?? 0,
  };
}

/** Pillar ids in display order; used for posture averages. */
const PILLAR_IDS = [
  "security",
  "reliability",
  "cost",
  "operational-excellence",
  "performance",
  "sustainability",
  "context-optimization",
  "autonomy-governance",
];

function getPlaceholderPillarAverages(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const id of PILLAR_IDS) out[id] = 0;
  return out;
}

/** Parse optional env JSON for MCP count, posture count, and pillar averages. */
function getTelemetryFromEnv(): {
  mcpToolCalls: number;
  postureReports: number;
  posturePillarAverages: Record<string, number>;
} {
  const raw = process.env.AAF_STATS_JSON;
  if (!raw) {
    return {
      mcpToolCalls: 0,
      postureReports: 0,
      posturePillarAverages: getPlaceholderPillarAverages(),
    };
  }
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    const pillars = (data.pillarAverages as Record<string, number>) || {};
    const averages = getPlaceholderPillarAverages();
    for (const id of PILLAR_IDS) {
      if (typeof pillars[id] === "number") averages[id] = Math.round(pillars[id]);
    }
    return {
      mcpToolCalls: typeof data.mcpToolCalls === "number" ? data.mcpToolCalls : 0,
      postureReports: typeof data.postureReports === "number" ? data.postureReports : 0,
      posturePillarAverages: averages,
    };
  } catch {
    return {
      mcpToolCalls: 0,
      postureReports: 0,
      posturePillarAverages: getPlaceholderPillarAverages(),
    };
  }
}

/** Try to load stats from Vercel Blob (written by cron). */
async function getStatsFromBlob(): Promise<StatsResponse | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  try {
    const { blobs } = await list({ prefix: "aaf-stats", limit: 5 });
    const blob = blobs.find((b) => b.pathname === BLOB_PATH);
    if (!blob?.url) return null;
    const res = await fetch(blob.url);
    if (!res.ok) return null;
    const data = (await res.json()) as StatsResponse & { updatedAt?: string };
    return {
      github: data.github ?? { stars: 0, forks: 0, openIssues: 0 },
      mcpToolCalls: data.mcpToolCalls ?? 0,
      postureReports: data.postureReports ?? 0,
      posturePillarAverages: data.posturePillarAverages ?? getPlaceholderPillarAverages(),
    };
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");

  try {
    const fromBlob = await getStatsFromBlob();
    if (fromBlob) return res.status(200).json(fromBlob);

    const [github, telemetry] = await Promise.all([fetchGitHub(), Promise.resolve(getTelemetryFromEnv())]);

    const body: StatsResponse = {
      github,
      mcpToolCalls: telemetry.mcpToolCalls,
      postureReports: telemetry.postureReports,
      posturePillarAverages: telemetry.posturePillarAverages,
    };

    return res.status(200).json(body);
  } catch (e) {
    console.error("stats error", e);
    return res.status(500).json({
      error: "Failed to fetch stats",
      github: { stars: 0, forks: 0, openIssues: 0 },
      mcpToolCalls: 0,
      postureReports: 0,
      posturePillarAverages: getPlaceholderPillarAverages(),
    });
  }
}
