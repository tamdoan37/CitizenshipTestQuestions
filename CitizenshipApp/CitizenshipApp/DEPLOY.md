# Deploying Liberty Civics to Google Play & the App Store

Everything below runs from the app folder:
`CitizenshipApp/CitizenshipApp` (the one with `package.json`).
On Windows PowerShell use `eas.cmd` / `npx` as shown; on macOS use `eas`.

- **App name (stores):** Liberty: US Citizenship Test
- **Display name (under the icon):** Liberty Civics
- **Bundle ID / package (permanent):** `com.tamdoan.libertycivics`
- **Version:** 1.0.0 (build 1)

---

## 0. One‑time setup

```powershell
npm install -g eas-cli
eas login                 # your Expo account
eas whoami                # confirm
eas init                  # links this project to Expo, writes extra.eas.projectId into app.json
```

Commit the `app.json` change that `eas init` makes (it adds a `projectId`).

> `eas.json` is already set up: `preview` builds an installable **APK**,
> `production` builds an **AAB** (Play) / **IPA** (App Store) with auto build‑number bumps.

---

## 1. Host the privacy policy (needed by BOTH stores)

You must give each store a **public URL** to a privacy policy. `PRIVACY.md` is in
this folder — first add your support email where it says
`[add the support email you want shown publicly]`, then host it. Easiest option:

1. Push to GitHub (already done).
2. In the repo: **Settings → Pages → Build from branch → `master` / root → Save.**
3. Your policy will be at `https://tamdoan37.github.io/<repo>/…` — or paste the
   text into a free host (e.g. a GitHub Gist "raw" URL, or Notion public page).

Keep that URL handy; you'll paste it into both consoles.

---

## 2. Android — Google Play

### Build
```powershell
eas build -p android --profile production
```
This produces an **.aab**. (Use `--profile preview` any time you want a plain
**.apk** to sideload and test on your own phone.)

### Create the listing (Google Play Console)
1. **Create app** → name **Liberty: US Citizenship Test**, language English (US),
   type **App**, **Free**.
2. **Store listing:**
   - Short description (≤80 chars): *Free study app for the US citizenship civics test — 128 questions.*
   - Full description: see **§4** below.
   - App icon: `assets/store/play-icon-512.png`
   - Feature graphic: `assets/store/feature-graphic-1024x500.png`
   - Phone screenshots: 2–8 (see **§5**).
3. **Privacy policy:** paste your URL from §1.
4. **Data safety:** answer **"No data collected"** and **"No data shared"** (the
   app stores everything on‑device — see §6 for the exact answers).
5. **Content rating:** fill the questionnaire → it will rate **Everyone**.
6. **Target audience:** 13+ (or your preference; it's an adult study app).

### Upload & release
- Easiest: upload the `.aab` under **Testing → Internal testing** first, add your
  own email as a tester, install via the opt‑in link, verify.
- Then promote to **Production**.
- Or automate uploads with `eas submit` (needs a Google service‑account JSON —
  Play Console → Setup → API access). Once set:
  ```powershell
  eas submit -p android --profile production --latest
  ```

Google review is usually hours to a couple of days for a new app.

---

## 3. iOS — App Store

> iOS builds happen in EAS's cloud, so you don't strictly need a Mac. You DO
> need your Apple Developer membership (you have it).

### Register the app
1. **App Store Connect → My Apps → +** → new app **Liberty: US Citizenship Test**,
   bundle ID `com.tamdoan.libertycivics` (create the App ID if prompted),
   SKU `libertycivics`, language English (US).

### Build
```powershell
eas build -p ios --profile production
```
EAS will offer to create the signing certificate & provisioning profile — say
yes and log in with your Apple account. Output is an **.ipa**.

### Submit
```powershell
eas submit -p ios --profile production --latest
```
Provide your Apple ID / app‑specific password or an App Store Connect API key
when prompted. The build appears in App Store Connect under **TestFlight** in
~10–30 min after processing.

### Fill the listing
- Screenshots for **6.7"** and **6.5"** iPhones (and 12.9" iPad if you enable
  iPad). See §5.
- **App Privacy:** choose **"Data Not Collected"** (see §6).
- Description/keywords: see §4.
- **Age rating:** answer the questionnaire → **4+**.
- Submit for review. Apple review is typically 1–3 days.

---

## 4. Store listing copy (paste‑ready)

**Title:** Liberty: US Citizenship Test

**Subtitle / short:** Free 2025 US citizenship civics test prep

**Full description:**
```
Study for the U.S. citizenship (civics) test — 100% free, no ads, no paywalls.

Liberty Civics covers all 128 questions from the 2025 USCIS civics test with
friendly tools to help you actually remember the answers:

• Flashcards — flip through every question, hear it read aloud
• Quick Quiz — 20 weighted questions, pass mark 12/20, like the real interview
• Mock Interview — simulate the officer's questions
• Oral Practice — hear each question, answer aloud, self‑check
• Listen Mode — hands‑free audio that plays questions and answers, and repeats
  the ones you miss most
• Read & Write — practice the English reading/writing portion
• Quick Review & Vocabulary Drill — browse answers by topic and learn key terms
• Weak Spots — the app tracks what you miss and helps you focus

Set your home state and the app tailors the "who represents you" questions to
your governor and senators. Track your progress, review past quizzes, and study
at your own pace with adjustable speed and voice.

Free forever — the best way to support it is to rate it or share it with a
friend on their journey to citizenship.

Not affiliated with or endorsed by USCIS or the U.S. government. Always confirm
current answers at uscis.gov/citizenship.
```

**Keywords (App Store, ≤100 chars):**
`citizenship,civics,USCIS,naturalization,US test,2025,immigration,flashcards,quiz`

**Category:** Education

---

## 5. Screenshots (you capture these)

Take a few from the running app on a phone or the iOS simulator:
- Dashboard, a Flashcard, the Quiz, Listen Mode, the Study tab.

How: run `npx expo start`, open on a device/simulator, screenshot normally.
Google Play wants 2–8 phone shots (min 320px side). Apple wants the exact device
sizes listed in App Store Connect (6.7" and 6.5" iPhone at minimum).

---

## 6. Privacy answers (both stores)

The app collects nothing and has no accounts/ads/analytics, so:
- **Google Data safety:** "Does your app collect or share any of the required
  user data types?" → **No.**
- **Apple App Privacy:** **Data Not Collected.**
- Notifications are **local only**; text‑to‑speech is **on‑device**. Neither is
  data collection.

---

## 7. Shipping an update later

1. Bump `version` in `app.json` (e.g. `1.0.1`). `eas.json` auto‑increments the
   build number, so you don't touch `buildNumber` / `versionCode`.
2. `eas build -p android --profile production` and/or `-p ios`.
3. `eas submit …` and release in each console.

Because officials update via the static JSON, most content changes need **no**
new build — only civics‑question or feature changes do.

## 8. Monetization later (keep it free now)

Plan: launch **100% free, no ads**. After traction (~1,000 users), add ads plus
an optional **$1.99 "remove ads"** in‑app purchase.

Rules that keep this safe:
- **Never switch the app from Free to Paid** — that's the one irreversible move.
  Keep it **Free** and monetize with ads + IAP (this is standard freemium).
- Adding **ads** (e.g. Google AdMob via `react-native-google-mobile-ads`) means
  the app then collects the advertising ID → you must update the Play **Data
  safety** form and the privacy policy at that time (say what's collected and
  that it's for ads). Until ads ship, "no data collected" is correct.
- The **$1.99 remove‑ads** option is an in‑app purchase. We removed the IAP code
  when going free; re‑adding it is a small task (react-native-iap + a
  non‑consumable "remove_ads" product + the withIapFlavor plugin) when you're
  ready.

Suggested sequence when monetizing: ship ads first (fastest revenue), then add
the remove‑ads IAP as the paid upgrade. Ping Claude and it'll wire both.
