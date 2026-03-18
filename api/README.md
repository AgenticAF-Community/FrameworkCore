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

**MCP endpoint:** `https://www.agenticaf.io/api/mcp` (Streamable HTTP, 12 tools). Optional auth: set `MCP_API_KEY` in Vercel and send `Authorization: Bearer <key>`.

### Google Antigravity IDE (and other stdio-only clients)

Antigravity uses **`mcp_config.json`** with **`command` + `args`** (local stdio), not a bare `url` field like Cursor. Use the community **`mcp-remote`** proxy so the IDE talks to the hosted AAF server over HTTP:

1. Open **Agent panel → Manage MCP Servers → View raw config** (or edit `mcp_config.json`).
2. Merge this under `mcpServers` (requires **Node.js 18+** on the machine):

```json
{
  "mcpServers": {
    "aaf": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://www.agenticaf.io/api/mcp",
        "--transport",
        "http-first"
      ]
    }
  }
}
```

`http-first` matches the AAF server’s Streamable HTTP transport (mcp-remote’s default is also `http-first`; the flag makes intent explicit).

If **`MCP_API_KEY`** is set on the deployment, add a header (avoid spaces after `:` in `args` on some Windows clients; put the full value in `env`):

```json
{
  "mcpServers": {
    "aaf": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://www.agenticaf.io/api/mcp",
        "--transport",
        "http-first",
        "--header",
        "Authorization:${AAF_MCP_AUTHORIZATION}"
      ],
      "env": {
        "AAF_MCP_AUTHORIZATION": "Bearer YOUR_MCP_API_KEY"
      }
    }
  }
}
```

Save, restart Antigravity (or reload MCP). Ask the agent what MCP tools are available; you should see `aaf_lookup`, `aaf_checklist`, etc.
