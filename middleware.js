/**
 * Vercel Edge Middleware: password protection for AAF site.
 * Requires AAF_SITE_PASSWORD to be set in Vercel project environment.
 * Working group members enter the password once; cookie persists for 7 days.
 */

// Run on every request
export const config = {
  matcher: ['/(.*)'],
};

const COOKIE_NAME = 'aaf_authenticated';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const SALT = 'aaf-working-group-v1';

async function hashPassword(password) {
  const data = new TextEncoder().encode((password || '') + SALT);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function getCookieValue(cookieHeader) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match ? match[1].trim() : null;
}

function loginPageHtml(redirectPath) {
  const path = redirectPath || '/';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AAF – Sign in</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f5f5f5; }
    .box { background: #fff; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); width: 100%; max-width: 360px; }
    h1 { margin: 0 0 1rem; font-size: 1.25rem; color: #222; }
    p { color: #666; font-size: 0.9rem; margin: 0 0 1.25rem; }
    input { width: 100%; padding: 0.6rem 0.75rem; font-size: 1rem; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 1rem; }
    button { width: 100%; padding: 0.6rem 1rem; font-size: 1rem; background: #3578e5; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
    button:hover { background: #2868c7; }
  </style>
</head>
<body>
  <div class="box">
    <h1>Agentic Architecture Framework</h1>
    <p>This site is for the AAF working group. Enter the shared password to continue.</p>
    <form method="post" action="/api/auth">
      <input type="hidden" name="redirect" value="${path.replace(/"/g, '&quot;')}">
      <input type="password" name="password" placeholder="Password" required autofocus>
      <button type="submit">Sign in</button>
    </form>
  </div>
</body>
</html>`;
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Serve login form and handle POST from it
  if (pathname === '/api/auth') {
    if (request.method === 'POST') {
      const password = process.env.AAF_SITE_PASSWORD;
      let body = '';
      try {
        body = await request.text();
      } catch (_) {}
      const params = new URLSearchParams(body);
      const submitted = params.get('password') || '';
      const redirect = params.get('redirect') || '/';

      if (password && submitted === password) {
        const token = await hashPassword(password);
        const headers = new Headers();
        headers.set('Location', redirect);
        headers.set(
          'Set-Cookie',
          `${COOKIE_NAME}=${token}; Path=/; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; SameSite=Lax`
        );
        return new Response(null, { status: 302, headers });
      }
      // Wrong password: show login again with 401
      return new Response(loginPageHtml(redirect), {
        status: 401,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
    // GET /api/auth -> show login with redirect to /
    return new Response(loginPageHtml('/'), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // If no password is configured: on Vercel show config message, locally allow access
  const isVercel = url.hostname.endsWith('.vercel.app') || url.hostname.includes('vercel.app');
  if (!process.env.AAF_SITE_PASSWORD) {
    if (isVercel) {
      return new Response(
        '<!DOCTYPE html><html><body style="font-family:system-ui;padding:2rem;max-width:480px;margin:0 auto;"><h1>AAF</h1><p>Password not configured. Set <strong>AAF_SITE_PASSWORD</strong> in Vercel (Settings → Environment Variables), then redeploy.</p></body></html>',
        { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }
    return; // local dev: allow
  }

  const expectedToken = await hashPassword(process.env.AAF_SITE_PASSWORD);
  const cookie = getCookieValue(request.headers.get('Cookie') || '');

  if (cookie === expectedToken) {
    return; // allow request to continue
  }

  // Not authenticated: show login (preserve requested path for redirect after login)
  return new Response(loginPageHtml(pathname || '/'), {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
