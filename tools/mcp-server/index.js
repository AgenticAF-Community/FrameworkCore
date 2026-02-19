#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {
  lookupInDocs,
  getSkillContent,
  getPillarsSummary,
  getChecklist,
  VALID_SKILL_IDS,
} from "./content.js";

const server = new Server(
  {
    name: "aaf-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "aaf_lookup",
      description:
        "Look up a term or topic in the AAF framework docs. Returns which docs match and an excerpt. Use when searching for concepts like epistemic gates, security, pillars, autonomy.",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search term or phrase (e.g. 'epistemic gate', 'tool gateway')",
          },
        },
        required: ["query"],
      },
    },
    {
      name: "aaf_checklist",
      description:
        "Return the AAF architecture review checklist (pre-production readiness). Use when reviewing an agentic system against the framework.",
      inputSchema: {
        type: "object",
        properties: {
          kind: {
            type: "string",
            enum: ["review", "design"],
            description: "Checklist type: 'review' for pre-production review, 'design' for design-time",
          },
        },
      },
    },
    {
      name: "aaf_pillars_summary",
      description:
        "Return a short summary of the six AAF pillars and cross-cutting foundations (context optimization, autonomy & outcome governance).",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "aaf_get_skill",
      description:
        "Return the full content of an AAF skill by id. Use when the user needs architecture-review, security, epistemic-gates, or cost-context guidance.",
      inputSchema: {
        type: "object",
        properties: {
          skillId: {
            type: "string",
            enum: VALID_SKILL_IDS,
            description:
              "Skill id: aaf-architecture-review, aaf-security, aaf-epistemic-gates, aaf-cost-context",
          },
        },
        required: ["skillId"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "aaf_lookup") {
    const query = args?.query ?? "";
    const { matches, excerpt } = lookupInDocs(query);
    const text = matches.length
      ? `Matches in: ${matches.join(", ")}\n${excerpt ? `Excerpt: ${excerpt}` : ""}`
      : `No docs matched "${query}". Try another term or check docs/ for available files.`;
    return { content: [{ type: "text", text }], isError: false };
  }

  if (name === "aaf_checklist") {
    const kind = args?.kind ?? "review";
    const text = getChecklist(kind);
    return { content: [{ type: "text", text }], isError: false };
  }

  if (name === "aaf_pillars_summary") {
    const text = getPillarsSummary();
    return { content: [{ type: "text", text }], isError: false };
  }

  if (name === "aaf_get_skill") {
    const skillId = args?.skillId;
    if (!skillId || !VALID_SKILL_IDS.includes(skillId)) {
      return {
        content: [
          {
            type: "text",
            text: `Invalid skillId. Use one of: ${VALID_SKILL_IDS.join(", ")}`,
          },
        ],
        isError: true,
      };
    }
    const text = getSkillContent(skillId);
    if (!text) {
      return {
        content: [{ type: "text", text: `Skill not found: ${skillId}` }],
        isError: true,
      };
    }
    return { content: [{ type: "text", text }], isError: false };
  }

  return {
    content: [{ type: "text", text: `Unknown tool: ${name}` }],
    isError: true,
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
