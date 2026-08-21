/**
 * Test env helper.
 *
 * Some suites talk to live services (Upstash KV, Stripe, Resend). They need
 * credentials that only maintainers hold. Contributors must still be able to
 * run `npm test` and get a green, meaningful result.
 *
 * `skipWithoutEnv` returns a node:test options object. When a credential is
 * absent the suite is skipped with a reason instead of failing, so a missing
 * secret never looks like a broken change.
 *
 * CommonJS on purpose — the integration suites that use it are CommonJS.
 */

/**
 * @param {string[]} names - Required environment variable names.
 * @returns {string[]} The names that are absent or empty.
 */
function missingEnv(names) {
  return names.filter((name) => {
    const value = process.env[name];
    return !value || !value.trim();
  });
}

/**
 * Build node:test suite options that skip when credentials are absent.
 *
 * @param {string[]} names - Required environment variable names.
 * @returns {{ skip?: string }} Options for describe()/it().
 */
function skipWithoutEnv(names) {
  const missing = missingEnv(names);
  if (missing.length === 0) return {};
  return {
    skip: `integration test — set ${missing.join(", ")} to run (see .env.example)`,
  };
}

module.exports = { missingEnv, skipWithoutEnv };
