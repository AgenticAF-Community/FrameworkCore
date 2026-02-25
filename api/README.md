# API (serverless)

- **`mcp.ts`** — AAF MCP server (Streamable HTTP) for Vercel.
- **`stats.ts`** — Public stats for the homepage: GitHub repo, MCP tool calls, posture reports, pillar averages. Reads from Vercel Blob when available (see below).
- **`refresh-stats.ts`** — Cron handler: fetches GitHub + `AAF_STATS_JSON`, writes to Vercel Blob. Invoked by Vercel Cron (see `vercel.json`).

## Stats and cron (get homepage stats live)

1. **Vercel Blob** — In the Vercel project: Storage → Create → Blob. This sets `BLOB_READ_WRITE_TOKEN` for the project.
2. **CRON_SECRET** — In Project → Settings → Environment Variables, add `CRON_SECRET` (e.g. a 16+ character random string). Vercel sends it as `Authorization: Bearer <CRON_SECRET>` when invoking the cron; the refresh endpoint rejects requests without it.
3. **Cron schedule** — `vercel.json` runs `/api/refresh-stats` daily at 12:00 UTC (`0 12 * * *`). On Pro you can change to hourly (e.g. `0 * * * *`).
4. **Optional: MCP/posture numbers** — Add env var **`AAF_STATS_JSON`** (a JSON string). The cron merges it with live GitHub and writes to Blob. Example:
   ```json
   {"mcpToolCalls": 1200, "postureReports": 45, "pillarAverages": {"security": 62, "reliability": 58, "cost": 41, "operational-excellence": 70, "performance": 65, "sustainability": 52, "context-optimization": 55, "autonomy-governance": 48}}
   ```

After the first cron run (or a manual GET to `/api/refresh-stats` with `Authorization: Bearer <CRON_SECRET>`), `GET /api/stats` serves from Blob so the homepage shows up-to-date figures. Without Blob, the stats API falls back to live GitHub + `AAF_STATS_JSON`.

**MCP endpoint:** `https://www.agenticaf.io/api/mcp` (Streamable HTTP, 11 tools). Optional auth: set `MCP_API_KEY` in Vercel and send `Authorization: Bearer <key>`.
