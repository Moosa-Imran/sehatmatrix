// Old address redirect: every GET sends the visitor to the same path on APP_URL. The page redirects
// itself (script + meta refresh); if both are blocked, it explains the move and offers a button.
import express from 'express';
import path from 'node:path';

const ROOT = import.meta.dirname;
const PORT = Number(process.env.PORT) || 4000;
const APP = new URL(process.env.APP_URL || 'https://app.sehatmatrix.com');
const OLD_HOST = process.env.OLD_HOST || 'health.corprosoft.com';

const html = s => String(s).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);

function page(target) {
    const href = html(target);
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=${href}">
<link rel="canonical" href="${href}">
<link rel="icon" href="/favicon.ico">
<title>SehatMatrix | We have moved</title>
<script>location.replace(${JSON.stringify(target).replace(/</g, '\\u003c')});</script>
<style>
* { box-sizing: border-box; margin: 0; }
body { min-height: 100vh; display: grid; place-items: center; padding: 24px 16px; background: #f4f7fb; color: #14213d; font: 16px/1.55 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
main { width: 100%; max-width: 460px; background: #fff; border: 1px solid #e3e8f0; border-radius: 16px; padding: 40px 32px; text-align: center; box-shadow: 0 12px 32px -20px rgb(0 40 90 / .25); }
img { width: 64px; height: 64px; }
.name { margin-top: 10px; font-size: 22px; font-weight: 800; letter-spacing: -0.3px; }
.name b { color: #004490; } .name i { font-style: normal; color: #16973a; }
h1 { margin-top: 26px; font-size: 24px; line-height: 1.3; }
p { margin-top: 10px; color: #5a6577; }
p strong { color: #14213d; font-weight: 600; }
a.btn { display: inline-block; margin-top: 26px; padding: 14px 24px; border-radius: 12px; background: #004490; color: #fff; font-weight: 600; text-decoration: none; }
a.btn:hover { background: #00376f; }
a.btn:focus-visible { outline: 3px solid #26d8ca; outline-offset: 3px; }
small { display: block; margin-top: 28px; font-size: 13px; color: #8a94a6; }
</style>
</head>
<body>
<main>
  <img src="/_sm/logo.png" alt="">
  <div class="name"><b>Sehat</b><i>Matrix</i></div>
  <h1>We have moved</h1>
  <p><strong>${html(OLD_HOST)}</strong> is now available at <strong>${html(APP.host)}</strong>. Same system, new address.</p>
  <p>Please update your bookmarks.</p>
  <a class="btn" href="${href}">Go to ${html(APP.host)}</a>
  <small>SehatMatrix is a product of CorproSoft</small>
</main>
</body>
</html>`;
}

const app = express();
app.disable('x-powered-by');
app.get('/favicon.ico', (req, res) => res.sendFile(path.join(ROOT, 'public', 'favicon.ico'), { maxAge: '1d' }));
app.use('/_sm', express.static(path.join(ROOT, 'public'), { index: false, maxAge: '1d' }));

app.use((req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return res.sendStatus(405);
    // Collapse leading slashes so a path like "//evil.com" can never change the target host.
    const target = APP.origin + req.originalUrl.replace(/^\/+/, '/');
    res.set({ 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' });
    res.type('html').send(page(target));
});

app.listen(PORT, () => console.log(`Redirecting ${OLD_HOST} to ${APP.origin} on http://localhost:${PORT}`));
