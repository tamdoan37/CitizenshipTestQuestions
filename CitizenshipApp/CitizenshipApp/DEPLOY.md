# Deploying CitizenFlow (React Native / Expo)

This app needs **no running server**. Officials data is a single static JSON
file you can host for free and update anytime — users pick up changes without
re-downloading the app.

## How officials data works

- The app ships with a bundled copy at `data/officials.json` — so it works
  offline and on first launch with zero hosting.
- If the env var `EXPO_PUBLIC_OFFICIALS_URL` is set to a hosted `officials.json`,
  the app fetches that on launch (cached for 24h) and uses it instead.
- To update officials after an election: edit the hosted `officials.json` and
  re-publish it. No app update, no store review.

`officials.json` shape:

```json
{
  "dataVersion": "2025.1",
  "federal": {
    "president": "…", "vicePresident": "…",
    "speakerOfHouse": "…", "chiefJustice": "…", "presidentParty": "…"
  },
  "representative": "Find your representative at house.gov/…",
  "states": {
    "WI": { "governor": "…", "senators": ["…", "…"], "capital": "…" }
  }
}
```

## Host it for free (pick one)

### Cloudflare Pages (recommended — global CDN, free)
1. Create a new folder with just `officials.json` in it (copy `data/officials.json`).
2. Push it to a GitHub repo (or use Cloudflare's direct upload).
3. Cloudflare dashboard → Pages → Create → connect the repo (or upload).
4. Deploy. You get a URL like `https://citizenflow-data.pages.dev/officials.json`.

### GitHub Pages (also free)
1. In a repo, put `officials.json` in a `/docs` folder (or repo root).
2. Repo Settings → Pages → Source = that branch/folder → Save.
3. URL: `https://<user>.github.io/<repo>/officials.json`.

Either way, confirm the file loads in a browser and returns JSON.

## Point the app at your hosted file

Set the env var at build time. In `eas.json`, add an `env` block to the profile:

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" },
      "env": { "EXPO_PUBLIC_OFFICIALS_URL": "https://YOUR-URL/officials.json" }
    },
    "production": {
      "autoIncrement": true,
      "android": { "buildType": "app-bundle" },
      "env": { "EXPO_PUBLIC_OFFICIALS_URL": "https://YOUR-URL/officials.json" }
    }
  }
}
```

For local dev, create a `.env` file with `EXPO_PUBLIC_OFFICIALS_URL=https://…`
(Expo reads `EXPO_PUBLIC_*` automatically). If unset, the app uses the bundled copy.

## Publishing the app (minimal cost)

- **Android (start here):** Google Play, one-time **$25** developer fee.
  `eas build -p android --profile production` → upload the `.aab` to Play Console.
- **iOS (optional):** Apple Developer Program, **$99/year**.
- Hosting cost for officials data: **$0** (static file on a free CDN).

## Updating officials later

1. Edit the hosted `officials.json` (change a governor/senator name, etc.).
2. Save/redeploy the static file.
3. Users see the change on next launch (24h cache) — no app update required.

Keep `data/officials.json` in the repo in sync so fresh installs start current.
