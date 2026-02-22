/**
 * Deterministic trade-off pattern matcher.
 *
 * Given design answers or posture scores, looks up applicable trade-offs
 * from the approved data model. No AI. Fully reproducible.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, "..", "data", "trade-offs.json");

let _cache = null;

/**
 * Load and cache the approved trade-offs data model.
 */
export function loadTradeoffs(customPath) {
  if (_cache && !customPath) return _cache;
  const fp = customPath || DATA_PATH;
  const raw = JSON.parse(fs.readFileSync(fp, "utf8"));
  const data = raw.tradeoffs || [];
  if (!customPath) _cache = data;
  return data;
}

/**
 * Clear the cache (for testing).
 */
export function clearCache() {
  _cache = null;
}

/**
 * Given design answers, return applicable trade-offs.
 *
 * @param {Record<string, Record<string, string>>} answers
 *   Keyed by pillar ID, then by questionId, value is the answer (e.g., "yes", "no").
 *   Example: { "security": { "security-q3": "yes" }, "cost": { "cost-q1": "no" } }
 * @param {object[]} [tradeoffs] - Optional pre-loaded trade-offs array.
 * @returns {{ id, pillars, tension, recommendation, source, confidence, autonomyNotes, matchedIndicators }[]}
 */
export function matchByDesignAnswers(answers, tradeoffs) {
  const data = tradeoffs || loadTradeoffs();
  const results = [];

  for (const entry of data) {
    const matchedIndicators = [];

    for (const indicator of entry.indicators || []) {
      const pillarId = indicator.questionId?.split("-q")[0];
      const pillarAnswers = answers[pillarId];
      if (!pillarAnswers) continue;

      const userAnswer = pillarAnswers[indicator.questionId];
      if (userAnswer === undefined) continue;

      const normalised = userAnswer.toLowerCase().trim();
      const expected = (indicator.answer || "").toLowerCase().trim();
      if (normalised === expected) {
        matchedIndicators.push(indicator);
      }
    }

    if (matchedIndicators.length > 0) {
      results.push({
        id: entry.id,
        pillars: entry.pillars,
        tension: entry.tension,
        recommendation: entry.recommendation,
        source: entry.source,
        confidence: entry.confidence,
        autonomyNotes: entry.autonomyNotes,
        matchedIndicators,
        matchStrength: matchedIndicators.length / (entry.indicators?.length || 1),
      });
    }
  }

  return results.sort((a, b) => b.matchStrength - a.matchStrength);
}

/**
 * Given posture scores (per-pillar 0-1), identify trade-off tensions
 * where one pillar scores high and its pair scores low.
 *
 * @param {Record<string, number>} scores - Pillar ID -> score (0 to 1).
 * @param {number} [threshold=0.3] - Minimum score difference to flag.
 * @param {object[]} [tradeoffs] - Optional pre-loaded trade-offs array.
 * @returns {{ id, pillars, tension, recommendation, source, highPillar, lowPillar, scoreDelta }[]}
 */
export function matchByPostureScores(scores, threshold = 0.3, tradeoffs) {
  const data = tradeoffs || loadTradeoffs();
  const results = [];

  for (const entry of data) {
    const [pA, pB] = entry.pillars;
    const scoreA = scores[pA];
    const scoreB = scores[pB];

    if (scoreA === undefined || scoreB === undefined) continue;

    const delta = Math.abs(scoreA - scoreB);
    if (delta < threshold) continue;

    const highPillar = scoreA > scoreB ? pA : pB;
    const lowPillar = scoreA > scoreB ? pB : pA;

    results.push({
      id: entry.id,
      pillars: entry.pillars,
      tension: entry.tension,
      recommendation: entry.recommendation,
      source: entry.source,
      highPillar,
      lowPillar,
      scoreDelta: delta,
    });
  }

  return results.sort((a, b) => b.scoreDelta - a.scoreDelta);
}

/**
 * Get all trade-offs for a specific pillar.
 *
 * @param {string} pillarId
 * @param {object[]} [tradeoffs] - Optional pre-loaded trade-offs array.
 * @returns {object[]}
 */
export function getTradeoffsForPillar(pillarId, tradeoffs) {
  const data = tradeoffs || loadTradeoffs();
  return data.filter((e) => e.pillars.includes(pillarId));
}

/**
 * Get all trade-offs grouped by pillar.
 *
 * @param {object[]} [tradeoffs] - Optional pre-loaded trade-offs array.
 * @returns {Record<string, object[]>}
 */
export function groupByPillar(tradeoffs) {
  const data = tradeoffs || loadTradeoffs();
  const grouped = {};
  for (const entry of data) {
    for (const p of entry.pillars) {
      if (!grouped[p]) grouped[p] = [];
      grouped[p].push(entry);
    }
  }
  return grouped;
}
