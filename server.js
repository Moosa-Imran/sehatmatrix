// SehatMatrix coming soon. Every GET that is not an asset shows the page, so old links land here.
// Launch window and the app link come from .env (see .env.example).
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = import.meta.dirname;
const PORT = Number(process.env.PORT) || 4000;
const LAUNCH_AT = new Date(process.env.LAUNCH_AT || '2026-10-08T00:00:00+05:00');
const LIVE_AT = new Date(process.env.LIVE_AT || LAUNCH_AT.getTime() + 30 * 60 * 1000);
const APP_URL = process.env.APP_URL || 'https://app.sehatmatrix.com';
const TIMEZONE = process.env.TIMEZONE || 'Asia/Karachi';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'sehatmatrix@corprosoft.com';

for (const [key, date] of [['LAUNCH_AT', LAUNCH_AT], ['LIVE_AT', LIVE_AT]]) {
    if (Number.isNaN(date.getTime())) throw new Error(`${key} is not a valid date`);
}
if (LIVE_AT <= LAUNCH_AT) throw new Error('LIVE_AT must be after LAUNCH_AT');

const page = fs.readFileSync(path.join(ROOT, 'page.html'), 'utf8');
// JSON inside a <script> tag: escape "<" so a value can never close the tag.
const inline = value => JSON.stringify(value).replace(/</g, '\\u003c');
const icsDate = date => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

const app = express();
app.disable('x-powered-by');
app.use((req, res, next) => {
    res.set({ 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'strict-origin-when-cross-origin' });
    next();
});

app.get(['/launch.ics', '/sehatmatrix/launch.ics'], (req, res) => {
    const lines = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//SehatMatrix//Launch//EN', 'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT', `UID:launch-${LAUNCH_AT.getTime()}@sehatmatrix.com`, `DTSTAMP:${icsDate(new Date())}`,
        `DTSTART:${icsDate(LAUNCH_AT)}`, `DTEND:${icsDate(LIVE_AT)}`,
        'SUMMARY:SehatMatrix launch and system update',
        `DESCRIPTION:The system may be unavailable during the update. Please save your work before it starts. After the update\\, open ${APP_URL}`,
        `URL:${APP_URL}`,
        'BEGIN:VALARM', 'TRIGGER:-PT15M', 'ACTION:DISPLAY', 'DESCRIPTION:SehatMatrix update starts in 15 minutes. Save your work.', 'END:VALARM',
        'END:VEVENT', 'END:VCALENDAR',
    ];
    res.type('text/calendar').attachment('sehatmatrix-launch.ics').send(lines.join('\r\n'));
});

// Mounted twice on purpose: an array mount with '/' in Express 5 never matches root paths.
const assets = express.static(path.join(ROOT, 'public'), { index: false, maxAge: '1h' });
app.use('/sehatmatrix', assets);
app.use(assets);

app.use((req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return res.sendStatus(405);
    const config = { now: Date.now(), launchAt: LAUNCH_AT.getTime(), liveAt: LIVE_AT.getTime(), appUrl: APP_URL, timeZone: TIMEZONE, email: SUPPORT_EMAIL };
    res.set('Cache-Control', 'no-store').type('html').send(page.replace('<!--CONFIG-->', `<script>window.SM = ${inline(config)};</script>`));
});

app.listen(PORT, () => console.log(`SehatMatrix coming soon: http://localhost:${PORT}`));
