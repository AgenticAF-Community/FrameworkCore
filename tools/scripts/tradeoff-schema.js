/**
 * Schema definition for trade-offs.js entries.
 * Used by extract-tradeoffs.js for output validation and by tests for structural checks.
 */

export const VALID_PILLAR_IDS = [
  "security",
  "reliability",
  "cost",
  "operational-excellence",
  "performance",
  "sustainability",
  "context-optimization",
  "autonomy-governance",
];

export const VALID_CONFIDENCE_VALUES = ["explicit", "inferred"];

/**
 * Validate a single trade-off entry against the schema.
 * Returns { valid: boolean, errors: string[] }.
 */
export function validateEntry(entry, index) {
  const errors = [];
  const prefix = `[${index}] ${entry.id || "(no id)"}`;

  if (!entry.id || typeof entry.id !== "string") {
    errors.push(`${prefix}: missing or invalid id`);
  }

  if (!Array.isArray(entry.pillars) || entry.pillars.length !== 2) {
    errors.push(`${prefix}: pillars must be an array of exactly 2 pillar IDs`);
  } else {
    for (const p of entry.pillars) {
      if (!VALID_PILLAR_IDS.includes(p)) {
        errors.push(`${prefix}: invalid pillar ID "${p}"`);
      }
    }
    if (entry.pillars[0] === entry.pillars[1]) {
      errors.push(`${prefix}: pillars must be different (got "${entry.pillars[0]}" twice)`);
    }
  }

  if (!entry.tension || typeof entry.tension !== "string") {
    errors.push(`${prefix}: missing or invalid tension`);
  }

  if (!entry.sourceQuote || typeof entry.sourceQuote !== "string") {
    errors.push(`${prefix}: missing or invalid sourceQuote`);
  }

  if (!entry.source || typeof entry.source !== "object") {
    errors.push(`${prefix}: missing source object`);
  } else {
    if (!entry.source.doc || typeof entry.source.doc !== "string") {
      errors.push(`${prefix}: missing source.doc`);
    }
    if (!entry.source.section || typeof entry.source.section !== "string") {
      errors.push(`${prefix}: missing source.section`);
    }
  }

  if (!VALID_CONFIDENCE_VALUES.includes(entry.confidence)) {
    errors.push(`${prefix}: confidence must be "explicit" or "inferred", got "${entry.confidence}"`);
  }

  if (!entry.recommendation || typeof entry.recommendation !== "string") {
    errors.push(`${prefix}: missing or invalid recommendation`);
  }

  if (!entry.recommendationSource || typeof entry.recommendationSource !== "object") {
    errors.push(`${prefix}: missing recommendationSource object`);
  }

  if (!Array.isArray(entry.indicators)) {
    errors.push(`${prefix}: indicators must be an array`);
  } else {
    for (const ind of entry.indicators) {
      if (!ind.questionId || !ind.signal) {
        errors.push(`${prefix}: indicator missing questionId or signal`);
      }
    }
  }

  if (!entry.autonomyNotes || typeof entry.autonomyNotes !== "object") {
    errors.push(`${prefix}: missing autonomyNotes object`);
  } else {
    for (const level of ["assistive", "delegated", "boundedAutonomous", "supervisory"]) {
      if (typeof entry.autonomyNotes[level] !== "string") {
        errors.push(`${prefix}: missing autonomyNotes.${level}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate the full trade-offs array.
 */
export function validateTradeoffs(entries) {
  const allErrors = [];

  if (!Array.isArray(entries)) {
    return { valid: false, errors: ["Trade-offs must be an array"] };
  }

  const ids = new Set();
  entries.forEach((entry, i) => {
    const { errors } = validateEntry(entry, i);
    allErrors.push(...errors);
    if (entry.id) {
      if (ids.has(entry.id)) {
        allErrors.push(`[${i}] ${entry.id}: duplicate id`);
      }
      ids.add(entry.id);
    }
  });

  return { valid: allErrors.length === 0, errors: allErrors };
}
