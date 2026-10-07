# SehatMatrix coming soon

A one page Express server that shows the SehatMatrix launch countdown. It has three states driven by
the server clock: countdown before `LAUNCH_AT`, an update progress bar until `LIVE_AT`, then "live"
with a button to `APP_URL`.

```bash
npm install
npm start          # http://localhost:4000 (also served at /sehatmatrix)
```

Settings live in `.env` (copy `.env.example`): `PORT`, `LAUNCH_AT`, `LIVE_AT`, `APP_URL`, `TIMEZONE`,
`SUPPORT_EMAIL`. Every unknown GET path shows the page, so old links land here. `/launch.ics` gives a
calendar reminder for the update window.
