# SehatMatrix redirect

Runs on the old address (health.corprosoft.com) and sends every visitor to the same path on
app.sehatmatrix.com, so old bookmarks keep working. The page redirects itself; if the redirect is
blocked it shows that the system has moved, with a button to the new address.

```bash
npm install
npm start          # http://localhost:4000
```

Settings in `.env` (copy `.env.example`): `PORT`, `APP_URL`, `OLD_HOST`.
