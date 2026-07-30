# egrants_interview_prep

A study tracker for the Senior Engineer coding and system design workbooks. Content is
presented in workbook order: four weeks of coding problems, with the ten system
design chapters distributed across those same weeks.

It is a static site. There is no server: the workbook content is bundled into the
build, and progress is saved either in the browser or, once Firebase is
configured, to Firestore against your Google account.

## Requirements

Node 20.19 or newer. This machine uses nvm:

```bash
nvm use 22
```

## Running it

```bash
npm install
npm run dev
```

The app runs on http://localhost:5173. Nothing else needs to be running.

Without a Firebase config the app uses localStorage: no sign-in, progress stays
in that browser. That is the intended way to work locally — copy `.env.example`
to `client/.env.local` only when you want to develop against the real Firestore
data.

## How the code is organized

One workspace, `client/`. Each layer only talks to the layer directly beneath it.

```
src/
  main.jsx         mounts React
  App.jsx          providers + routes
  data/            the workbook content, transcribed to JSON, plus curriculum.js
  firebase/        Firebase config and lazy initialisation
  storage/         where progress is saved; swappable (see below)
  context/         AuthContext (who you are), CurriculumContext (static
                   content), ProgressContext (user state)
  hooks/           small readers on top of the contexts
  constants/       shared values like the confidence levels
  pages/           one file per route, composes components
  components/
    common/        generic and reusable: Card, Badge, Checkbox, Checklist, ProgressBar
    layout/        AppLayout, Sidebar
    auth/          AuthGate, SignInPage, AccountFooter
    coding/        the problem table, confidence picker, notes, weekly checklist
    systemDesign/  framework steps, concept list, practice checklist
    dashboard/     overall stats, week cards, final checklist
  styles/          global.css holds the colors and spacing tokens
```

`data/` holds static content that never changes at runtime:

- `codingWeeks.json` — the four weeks and their 52 problems
- `designChapters.json` — the ten system design chapters, each tagged with the week it belongs to
- `designFramework.json` — the nine framework steps and practice checklist, shared by every chapter
- `checklists.json` — the weekly and final interview checklists
- `seedProgress.json` — progress already recorded in the workbook, used on first run
- `curriculum.js` — assembles the above into the one object the app reads

Because the curriculum is static, it is imported rather than fetched. There is
nothing to load and nothing that can fail.

Components under `components/common/` are presentational — they take props and
report changes, and never read context directly. Section folders
(`coding/`, `systemDesign/`, `dashboard/`) hold the components that know about a
specific part of the workbook and wire the common pieces to the right slice of
progress state.

### Storage is swappable

Everything saves through the contract in `storage/ProgressStore.js`: an object
with `read()` and `write()`. `storage/index.js` picks the implementation from
whether anyone is signed in.

- `localStore` writes to browser localStorage — used when Firebase is not configured
- `firestoreStore` writes to `users/{uid}` in Firestore — used for a signed-in account

`read()` resolves to `null` when nothing has been stored yet, and `loadProgress()`
seeds the first document from `seedProgress.json`, so every backend gets the same
first-run behaviour.

Because nothing outside `storage/` knows which backend is active, adding another
one requires no changes anywhere else.

## How progress is saved

Checkboxes and confidence save on click. Notes save when the field loses focus,
so typing does not fire a request per keystroke.

`ProgressContext` computes the next state locally and hands the whole document to
the store. The document is a few kilobytes, which makes writing all of it cheaper
than the bookkeeping needed to write part of it. Writes are serialised, so a
burst of clicks collapses into one write of the latest document rather than a
race between overlapping requests.

A failed write shows a banner but does not roll the change back. The store holds
one document, so rolling back would discard every edit since the last successful
write — including whatever was just typed. The change stays on screen and the
next edit retries the whole document.

To start over in local mode, clear the site's localStorage. For a signed-in
account, delete the `users/{uid}` document in the Firestore console. Either way
the next read re-seeds from `seedProgress.json`.

## Deploying

The site is built by `.github/workflows/deploy.yml` on every push to `main` and
published to GitHub Pages at `https://<user>.github.io/egrants_interview_prep/`.

### 1. Firebase

1. Create a project at https://console.firebase.google.com.
2. Add a **Web app** to it and copy the config values it shows you.
3. **Authentication → Sign-in method** — enable **Google**.
4. **Firestore Database → Create database** — start in production mode.
5. **Firestore → Rules** — paste in `firestore.rules` and publish. This step is
   what protects your data; do not skip it.
6. **Authentication → Settings → Authorized domains** — add
   `<user>.github.io`, or sign-in will be rejected from the deployed site.

### 2. GitHub

1. **Settings → Pages → Source** — choose **GitHub Actions**.
2. **Settings → Secrets and variables → Actions → Variables** — add the six
   values from step 2 above as repository *variables*:

   ```
   VITE_FIREBASE_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN
   VITE_FIREBASE_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET
   VITE_FIREBASE_MESSAGING_SENDER_ID
   VITE_FIREBASE_APP_ID
   ```

   Variables rather than secrets, because a Firebase web config is public by
   design — it identifies the project and grants nothing. `firestore.rules` is
   what keeps other people out. Setting them as secrets would work but would
   only obscure values that ship in the bundle anyway.

3. Push to `main`.

If the variables are missing the build still succeeds — the deployed site just
falls back to localStorage, with progress per-browser and no sign-in.

### Notes on the two Pages quirks

GitHub Pages serves a project site from `/<repo>/`, so the build sets Vite's
`base` to that prefix and the router takes it from `import.meta.env.BASE_URL`.
The workflow derives it from the repository name, so renaming the repo does not
break asset paths.

Pages also has no rewrite rules, so a deep link like `/weeks/week-1` is a request
for a file that does not exist. The build writes a copy of the app shell to
`404.html`, which Pages serves for those URLs, handing the path to the router
instead of showing an error page.
