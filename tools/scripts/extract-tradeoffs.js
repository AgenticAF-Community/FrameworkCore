#!/usr/bin/env node

/**
 * AI-assisted trade-off extraction from framework docs.
 *
 * Reads all pillar docs, sends to Gemini 3.0 via WrangleAI gateway,
 * outputs structured JSON for human review.
 *
 * Usage:
 *   WRANGLE_API_KEY=... node tools/scripts/extract-tradeoffs.js
 *   node tools/scripts/extract-tradeoffs.js --dry-run   (print prompt, skip LLM call)
 *
 * Output: tools/data/trade-offs.json (proposed, for review)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { validateTradeoffs } from "./tradeoff-schema.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const DOCS_DIR = path.join(REPO_ROOT, "docs");
const PROMPT_PATH = path.join(__dirname, "prompts", "extract-tradeoffs.md");
const PILLARS_PATH = path.join(REPO_ROOT, "tools", "aaf-posture", "pillars.js");
const OUTPUT_PATH = path.join(REPO_ROOT, "tools", "data", "trade-offs.json");
const ENV_PATH = path.join(REPO_ROOT, ".env");

const WRANGLEAI_BASE_URL = "https://gateway.wrangleai.com/v1";
const MODEL = "gemini-2.5-pro";

const PILLAR_DOCS = [
  "05-framework-overview.md",
  "06-pillar-security.md",
  "07-pillar-reliability.md",
  "08-pillar-cost.md",
  "09-pillar-operations.md",
  "10-pillar-performance.md",
  "11-pillar-sustainability.md",
  "12-context-optimization.md",
  "13-autonomy-governance.md",
];

function loadEnv() {
  try {
    const content = fs.readFileSync(ENV_PATH, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env not present, rely on environment variables
  }
}

function readFile(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch (e) {
    console.error(`Could not read ${p}: ${e.message}`);
    return "";
  }
}

function buildUserMessage() {
  const parts = ["# Framework Documents\n"];

  for (const docName of PILLAR_DOCS) {
    const content = readFile(path.join(DOCS_DIR, docName));
    if (!content) continue;
    parts.push(`## ${docName}\n\n${content}\n\n---\n`);
  }

  const { PILLARS } = parsePillars();
  parts.push("# Pillar Questions (for indicator questionId references)\n");
  for (const p of PILLARS) {
    parts.push(`## ${p.id}\n`);
    p.questions.forEach((q, i) => {
      parts.push(`- ${p.id}-q${i + 1}: ${q}`);
    });
    parts.push("");
  }

  return parts.join("\n");
}

function parsePillars() {
  const content = readFile(PILLARS_PATH);
  const match = content.match(/export const PILLARS = (\[[\s\S]*\]);/);
  if (!match) {
    console.error("Could not parse pillars.js");
    return { PILLARS: [] };
  }
  const PILLARS = new Function(`return ${match[1]}`)();
  return { PILLARS };
}

async function callWrangleAI(systemPrompt, userMessage) {
  const apiKey = process.env.WRANGLE_API_KEY || process.env.wrangleai_api_key;
  if (!apiKey) {
    throw new Error(
      "WRANGLE_API_KEY not set. Add it to .env or set the environment variable."
    );
  }

  const res = await fetch(`${WRANGLEAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: 16000,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WrangleAI API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

function parseResponse(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Could not find JSON array in response");
    parsed = JSON.parse(jsonMatch[0]);
  }

  if (Array.isArray(parsed)) return parsed;
  if (parsed.tradeoffs && Array.isArray(parsed.tradeoffs)) return parsed.tradeoffs;
  if (parsed.trade_offs && Array.isArray(parsed.trade_offs)) return parsed.trade_offs;
  throw new Error("Response JSON does not contain a trade-offs array");
}

/**
 * Verify that each sourceQuote appears (approximately) in the cited doc.
 */
function verifySourceQuotes(entries) {
  const warnings = [];
  for (const entry of entries) {
    if (!entry.sourceQuote || !entry.source?.doc) continue;
    const docPath = path.join(REPO_ROOT, entry.source.doc);
    const content = readFile(docPath);
    if (!content) {
      warnings.push(`${entry.id}: could not read ${entry.source.doc}`);
      continue;
    }

    const normalise = (s) =>
      s
        .toLowerCase()
        .replace(/[\s\u2018\u2019\u201c\u201d]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    const quoteWords = normalise(entry.sourceQuote).split(" ").slice(0, 8).join(" ");
    if (!normalise(content).includes(quoteWords)) {
      warnings.push(
        `${entry.id}: sourceQuote not found in ${entry.source.doc} (first 8 words: "${quoteWords}")`
      );
    }
  }
  return warnings;
}

async function main() {
  loadEnv();

  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  const systemPrompt = readFile(PROMPT_PATH);
  if (!systemPrompt) {
    console.error("Could not read extraction prompt");
    process.exit(1);
  }

  const userMessage = buildUserMessage();

  if (dryRun) {
    console.log("=== DRY RUN: Prompt + context ===");
    console.log(`System prompt: ${systemPrompt.length} chars`);
    console.log(`User message: ${userMessage.length} chars (~${Math.round(userMessage.length / 4)} tokens)`);
    console.log(`Provider: WrangleAI (${WRANGLEAI_BASE_URL})`);
    console.log(`Model: ${MODEL}`);
    console.log("\nFirst 500 chars of user message:");
    console.log(userMessage.slice(0, 500));
    process.exit(0);
  }

  console.log(`Extracting trade-offs via WrangleAI → ${MODEL}...`);
  console.log(`Context size: ~${Math.round(userMessage.length / 4)} tokens`);

  const raw = await callWrangleAI(systemPrompt, userMessage);
  console.log(`Response received (${raw.length} chars)`);

  const entries = parseResponse(raw);
  console.log(`Parsed ${entries.length} trade-off entries`);

  const { valid, errors } = validateTradeoffs(entries);
  if (!valid) {
    console.error("\nSchema validation errors:");
    for (const e of errors) console.error(`  - ${e}`);
    console.error("\nWriting raw output for debugging...");
  }

  const quoteWarnings = verifySourceQuotes(entries);
  if (quoteWarnings.length) {
    console.warn("\nSource quote verification warnings:");
    for (const w of quoteWarnings) console.warn(`  - ${w}`);
  }

  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const output = {
    _meta: {
      generatedAt: new Date().toISOString(),
      provider: "wrangleai",
      model: MODEL,
      gateway: WRANGLEAI_BASE_URL,
      promptFile: "tools/scripts/prompts/extract-tradeoffs.md",
      docsUsed: PILLAR_DOCS,
      schemaValid: valid,
      schemaErrors: errors,
      quoteWarnings,
    },
    tradeoffs: entries,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2) + "\n", "utf8");
  console.log(`\nWrote ${OUTPUT_PATH}`);
  console.log(
    `  ${entries.length} entries, ${valid ? "schema valid" : "SCHEMA ERRORS"}, ${quoteWarnings.length} quote warnings`
  );

  if (!valid) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
