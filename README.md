# egrants_interview_prep

A study tracker for the Senior Engineer coding and system design workbooks. Content is
presented in workbook order: four weeks of coding problems, with the ten system
design chapters distributed across those same weeks.

It is a static site. There is no server: the workbook content is bundled into the
build, and progress is saved either in the browser or, once Firebase is
configured, to Firestore against your Google account.

## Tests

```bash
npm test
```

Node's built-in runner, so there is nothing to install and no config file. Tests
sit next to what they test as `*.test.js` and cover the pure logic — what gets
written to storage, what a corrupt document is repaired into, and how a diagram
is described. They run in CI before the build, so a failure stops the deploy.

Components are not tested; that would need a DOM and a test framework, which is a
bigger commitment than this project has needed so far.

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
  storage/         where progress and designs are saved; swappable (see below)
  analysis/        describeDesign.js — turns a diagram into a plain description
  context/         AuthContext (who you are), CurriculumContext (static
                   content), ProgressContext (user state), DesignContext (one
                   chapter's diagram, mounted per chapter)
  hooks/           small readers on top of the contexts
  constants/       shared values: confidence levels, the design component catalog
  pages/           one file per route, composes components
  components/
    common/        generic and reusable: Card, Badge, Checkbox, Checklist, ProgressBar
    layout/        AppLayout, Sidebar
    auth/          AuthGate, SignInPage, AccountFooter
    coding/        the problem table, confidence picker, notes, weekly checklist
    systemDesign/  framework steps, concept list, practice checklist
    designCanvas/  the React Flow diagram, its notes, and the summary
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

Design diagrams follow the same contract in `storage/DesignStore.js`, but in their
own documents — one per chapter, at `users/{uid}/designs/{chapterId}`. They are
kept out of the progress document for two reasons. Progress is rewritten in full
on every edit, and a diagram is far larger than a checkbox, so dragging a node
would rewrite every note in the account. And only one chapter's diagram is ever
on screen, so there is no reason to load ten of them.

`toStoredDesign()` decides what actually gets written. React Flow hangs
bookkeeping on nodes as you interact with them — measured pixel sizes, selection
flags — and none of it describes the design or survives a move to another screen.
Listing the fields explicitly keeps the stored shape one we define.

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

## System design diagrams

Each design chapter has a canvas built on [React Flow](https://reactflow.dev).
You add components from a palette, drag from a node's edge to connect them, and
select a connection to label it. Below the canvas is a free text section for
assumptions, capacity estimates, and tradeoffs — the half of a design interview
that the picture does not capture.

Diagrams save about a second after you stop editing, and leaving the page flushes
whatever is still pending. There is no save button, so the card header says
whether the current state is stored.

Because diagrams live in a subcollection, they needed a rules change: a rule on
`users/{userId}` covers that document alone and does not cascade to documents
beneath it, so `firestore.rules` now matches `users/{userId}/{document=**}`.
**Those rules have to be published before a signed-in account can save a
diagram** — otherwise every write is denied. See *Keeping the rules honest*.

The components in the palette are not anonymous boxes. Each carries a `kind` from
`constants/designNodes.js` — service, database, cache, queue, and so on — and each
connection carries what it means. That is the difference between a drawing and
data: `analysis/describeDesign.js` turns the graph into a plain description of
which components exist, what talks to what, and which boxes were never wired up.

Today that description feeds the summary under the canvas. It is also the shape
you would serialise into a prompt to have an agent critique a design, which is why
it is a pure function with no React in it and no knowledge of what happens to its
output. Adding that means writing a caller, not rewriting the diagram.

Adding a component type is a matter of adding an entry to `COMPONENT_KINDS`; the
palette, the node rendering, the minimap colors, and the summary all read from
that one list.

## Deploying

The site is built by `.github/workflows/deploy.yml` on every push to `main` and
published to GitHub Pages at `https://<user>.github.io/egrants_interview_prep/`.

### 1. Firebase

1. Create a project at https://console.firebase.google.com.
2. Add a **Web app** to it and copy the config values it shows you.
3. **Authentication → Sign-in method** — enable **Google**.
4. **Firestore Database → Create database** — start in production mode.
5. **Firestore → Rules** — paste in `firestore.rules` and publish. This step is
   what protects your data; do not skip it. See *Keeping the rules honest* below
   for how to stop doing this by hand.
6. **Authentication → Settings → Authorized domains** — add
   `<user>.github.io`, or sign-in will be rejected from the deployed site.

Steps 3 and 6 have to happen in the console. Enabling Google sign-in makes
Firebase provision an OAuth client for you; driving that through the Identity
Toolkit API instead means supplying your own client id and secret, which is more
work than clicking the toggle.

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

### Keeping the rules honest

Publishing rules by pasting them into the console leaves two copies: the one in
this repo and the one actually being enforced. They drift, and the way you find
out is that something turns out to be readable which should not have been.

`.github/workflows/firestore-rules.yml` publishes `firestore.rules` on every push
that touches it, so the repo copy is the only copy. To turn it on:

1. In the Google Cloud console for the project, **IAM & Admin → Service
   Accounts** — create one and grant it **Firebase Rules Admin**
   (`roles/firebaserules.admin`). That is the whole permission it needs.
2. Give it a **JSON key** and download it.
3. In GitHub, **Settings → Secrets and variables → Actions → Secrets** — add the
   file's entire contents as `FIREBASE_SERVICE_ACCOUNT`.

A secret this time, not a variable: a service account key is a real credential,
unlike the web config.

Prefer a service account over `firebase login` for this. A personal login can
reach every Firebase project on your Google account; a service account scoped to
one project with one role can publish these rules and nothing else.

Until the secret exists the workflow logs that it is skipping and passes, so
nothing breaks if you would rather keep using the console.

To deploy rules from your own machine instead:

```bash
npm install -g firebase-tools   # the CLI must be v7 or newer
firebase login
firebase use <your-project-id>
firebase deploy --only firestore:rules
```

`.firebaserc`, which `firebase use` writes, is gitignored — it names your
project, which is yours rather than the repo's.

### Notes on the two Pages quirks

GitHub Pages serves a project site from `/<repo>/`, so the build sets Vite's
`base` to that prefix and the router takes it from `import.meta.env.BASE_URL`.
The workflow derives it from the repository name, so renaming the repo does not
break asset paths.

Pages also has no rewrite rules, so a deep link like `/weeks/week-1` is a request
for a file that does not exist. The build writes a copy of the app shell to
`404.html`, which Pages serves for those URLs, handing the path to the router
instead of showing an error page.
