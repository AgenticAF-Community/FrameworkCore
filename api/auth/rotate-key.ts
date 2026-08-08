/**
 * POST /api/auth/rotate-key — mint new API key, revoke old hash, one-time reveal URL.
 * Does not return revealToken in JSON (URL only) to limit accidental disclosure.
 */
import { REVEAL_TTL_SEC } from "../lib/access";
import { generateApiKey, generateToken, hashApiKey } from "../lib/keys";
import { getKv, KV_PREFIX } from "../lib/kv";
import { getCustomer, getSessionFromRequest } from "../lib/magic";
import { encryptApiKey } from "../lib/reveal-crypto";
import { resolveAppBaseUrl } from "../lib/urls";

export async function POST(req: Request): Promise<Response> {
  try {
    const session = getSessionFromRequest(req);
    if (!session) return json({ error: "Unauthorized" }, 401);

    const customer = await getCustomer(session.customerId);
    if (!customer || customer.status !== "active") {
      return json({ error: "Subscription inactive" }, 403);
    }

    const kv = getKv();
    const apiKey = generateApiKey();
    const keyHash = hashApiKey(apiKey);

    if (customer.keyHash) {
      await kv.del(`${KV_PREFIX.keyHash}${customer.keyHash}`);
    }

    await kv.set(`${KV_PREFIX.customer}${session.customerId}`, {
      ...customer,
      keyHash,
    });
    await kv.set(`${KV_PREFIX.keyHash}${keyHash}`, session.customerId);

    const revealToken = generateToken(24);
    await kv.set(
      `${KV_PREFIX.reveal}${revealToken}`,
      {
        customerId: session.customerId,
        reused: false,
        enc: encryptApiKey(apiKey),
      },
      { ex: REVEAL_TTL_SEC }
    );

    const appBase = resolveAppBaseUrl(req);
    return json({
      ok: true,
      revealUrl: `${appBase}/access/success?token=${encodeURIComponent(revealToken)}`,
    });
  } catch (e: any) {
    return json({ error: e?.message || "Rotate failed" }, 500);
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
