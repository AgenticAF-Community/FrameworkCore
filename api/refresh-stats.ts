/**
 * Cron: refresh homepage stats (GitHub + AAF_STATS_JSON) and write to Vercel Blob.
 * Schedule in vercel.json. Secure with CRON_SECRET (Vercel sends Bearer token).
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { put } from "@vercel/blob";

const GITHUB_REPO = "AgenticAF-Community/FrameworkCore";
const GITHUB_API = "https://api.github.com/repos/" + GITHUB_REPO;
const BLOB_PATH = "aaf-stats.json";

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

async function fetchGitHub(): Promise<{ stars: number; forks: number; openIssues: number }> {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization;
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({
      success: false,
      error: "BLOB_READ_WRITE_TOKEN not set. Add a Vercel Blob store to this project.",
    });
  }

  try {
    const [github, telemetry] = await Promise.all([
      fetchGitHub(),
      Promise.resolve(getTelemetryFromEnv()),
    ]);

    const payload = {
      github,
      mcpToolCalls: telemetry.mcpToolCalls,
      postureReports: telemetry.postureReports,
      posturePillarAverages: telemetry.posturePillarAverages,
      updatedAt: new Date().toISOString(),
    };

    const blob = await put(BLOB_PATH, JSON.stringify(payload), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    return res.status(200).json({
      success: true,
      url: blob.url,
      github: payload.github,
    });
  } catch (e) {
    console.error("refresh-stats error", e);
    return res.status(500).json({ success: false, error: String(e) });
  }
}
