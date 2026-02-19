/**
 * AAF MCP server — Vercel serverless route (Streamable HTTP).
 * Exposes aaf_lookup, aaf_checklist, aaf_pillars_summary, aaf_get_skill.
 * Optional: set MCP_API_KEY env and use Bearer token for auth.
 */
import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = process.cwd();
const DOCS_DIR = path.join(REPO_ROOT, "docs");
const SKILLS_DIR = path.join(REPO_ROOT, "tools", "skills");
const VALID_SKILL_IDS = [
  "aaf-architecture-review",
  "aaf-security",
  "aaf-epistemic-gates",
  "aaf-cost-context",
] as const;

function safeReadFile(p: string): string | null {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return null;
  }
}

function listDocs(): string[] {
  try {
    return fs.readdirSync(DOCS_DIR).filter((n) => n.endsWith(".md")).sort();
  } catch {
    return [];
  }
}

function lookupInDocs(query: string): { matches: string[]; excerpt: string | null } {
  const q = query.trim().toLowerCase();
  const docs = listDocs();
  const matches: string[] = [];
  let excerpt: string | null = null;
  for (const doc of docs) {
    const full = path.join(DOCS_DIR, doc);
    if (!full.startsWith(DOCS_DIR)) continue;
    const content = safeReadFile(full);
    if (!content) continue;
    const lower = content.toLowerCase();
    if (lower.includes(q)) {
      matches.push(doc);
      if (!excerpt) {
        const idx = lower.indexOf(q);
        const start = Math.max(0, idx - 80);
        const end = Math.min(content.length, idx + q.length + 120);
        excerpt = content.slice(start, end).replace(/\n/g, " ").trim();
      }
    }
  }
  return { matches, excerpt };
}

function getSkillContent(skillId: string): string | null {
  if (!VALID_SKILL_IDS.includes(skillId as (typeof VALID_SKILL_IDS)[number])) return null;
  const fp = path.join(SKILLS_DIR, skillId, "SKILL.md");
  if (!fp.startsWith(SKILLS_DIR)) return null;
  return safeReadFile(fp);
}

function getPillarsSummary(): string {
  const fp = path.join(DOCS_DIR, "05-framework-overview.md");
  const content = safeReadFile(fp);
  if (!content) return "AAF pillars: Security, Reliability, Cost Optimization, Operational Excellence, Performance Efficiency, Sustainability. Cross-cutting: Context Optimization, Autonomy & Outcome Governance. See docs/05-framework-overview.md.";
  return content.slice(0, 3200) + "\n\n[... see docs/05-framework-overview.md ...]";
}

function getChecklist(kind: string): string {
  const content = getSkillContent("aaf-architecture-review");
  if (!content) return "See docs/15-application-method.md for checklist.";
  const section = content.includes("## Mode 2: Architecture review")
    ? content.slice(content.indexOf("## Mode 2: Architecture review"))
    : content;
  return section.slice(0, 4000) + (section.length > 4000 ? "\n\n[...]" : "");
}

const baseHandler = createMcpHandler(
  (server) => {
    server.registerTool(
      "aaf_lookup",
      {
        title: "AAF Lookup",
        description: "Look up a term or topic in the AAF framework docs. Returns matching docs and an excerpt.",
        inputSchema: { query: z.string().min(1) },
      },
      async ({ query }) => {
        const { matches, excerpt } = lookupInDocs(query);
        const text = matches.length
          ? `Matches: ${matches.join(", ")}\n${excerpt ? `Excerpt: ${excerpt}` : ""}`
          : `No docs matched "${query}".`;
        return { content: [{ type: "text", text }] };
      }
    );
    server.registerTool(
      "aaf_checklist",
      {
        title: "AAF Checklist",
        description: "Return the AAF architecture review checklist (pre-production readiness).",
        inputSchema: { kind: z.enum(["review", "design"]).optional() },
      },
      async ({ kind }) => ({
        content: [{ type: "text", text: getChecklist(kind ?? "review") }],
      })
    );
    server.registerTool(
      "aaf_pillars_summary",
      {
        title: "AAF Pillars Summary",
        description: "Short summary of the six AAF pillars and cross-cutting foundations.",
        inputSchema: {},
      },
      async () => ({ content: [{ type: "text", text: getPillarsSummary() }] })
    );
    server.registerTool(
      "aaf_get_skill",
      {
        title: "AAF Get Skill",
        description: "Return full content of an AAF skill by id.",
        inputSchema: {
        skillId: z.enum([
          "aaf-architecture-review",
          "aaf-security",
          "aaf-epistemic-gates",
          "aaf-cost-context",
          "aaf-cross-cutting",
          "aaf-acc-implementation",
          "aaf-orchestration-occ",
        ]),
      },
      },
      async ({ skillId }) => {
        const text = getSkillContent(skillId);
        if (!text) return { content: [{ type: "text", text: `Skill not found: ${skillId}` }], isError: true };
        return { content: [{ type: "text", text }] };
      }
    );
  },
  {},
  { basePath: "/api", maxDuration: 30 }
);

const verifyToken = async (
  _req: Request,
  bearerToken?: string
): Promise<{ token: string; scopes: string[]; clientId: string } | undefined> => {
  const apiKey = process.env.MCP_API_KEY;
  if (!apiKey) return undefined;
  if (!bearerToken || bearerToken !== apiKey) return undefined;
  return { token: bearerToken, scopes: ["read:aaf"], clientId: "api-key" };
};

const authHandler = withMcpAuth(baseHandler, verifyToken, {
  required: false,
  requiredScopes: ["read:aaf"],
  resourceMetadataPath: "/.well-known/oauth-protected-resource",
});

export const GET = authHandler;
export const POST = authHandler;
export const DELETE = authHandler;
