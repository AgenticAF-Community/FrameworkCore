#!/usr/bin/env node

/**
 * Concatenates all framework docs into a single llms-full.txt for LLM consumption.
 * Strips YAML frontmatter and HTML comment blocks (engine markers), keeps clean markdown.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT, 'docs');
const OUTPUT = path.join(ROOT, 'website', 'static', 'llms-full.txt');

const DOC_ORDER = [
  '00-intro',
  '01-executive-summary',
  '02-introduction',
  '03-what-is-an-agent',
  '04-deterministic-probabilistic-agentic',
  '05-framework-overview',
  '06-pillar-security',
  '07-pillar-reliability',
  '08-pillar-cost',
  '09-pillar-operations',
  '10-pillar-performance',
  '10-pillar-performance-casestudy-1',
  '11-pillar-sustainability',
  '12-context-optimization',
  '13-autonomy-governance',
  '14-ecosystem-interoperability',
  '15-application-method',
  '16-conclusion',
  '18-ethics',
  '17-emerging-thought',
  '19-annex-agent-control-contracts',
];

function stripFrontmatter(content) {
  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/);
  return match ? match[1].trim() : content;
}

function loadDoc(filename) {
  const filePath = path.join(DOCS_DIR, `${filename}.md`);
  if (!fs.existsSync(filePath)) {
    console.warn(`  SKIP: ${filePath} not found`);
    return null;
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  return stripFrontmatter(raw);
}

function main() {
  const parts = [
    '# Agentic Architecture Framework — Full Text',
    '',
    '> This file contains the complete framework text in plain markdown,',
    '> intended for consumption by large language models. For the structured',
    '> guide, see https://agenticaf.io/llms.txt',
    '> For the human-readable site, visit https://agenticaf.io',
    '',
    `> Generated: ${new Date().toISOString().slice(0, 10)}`,
    '',
    '---',
    '',
  ];

  for (const name of DOC_ORDER) {
    const content = loadDoc(name);
    if (!content) continue;
    parts.push(content);
    parts.push('');
    parts.push('---');
    parts.push('');
  }

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, parts.join('\n'), 'utf8');
  console.log(`llms-full.txt written to ${OUTPUT} (${DOC_ORDER.length} docs)`);
}

main();
