# egrants_interview_prep

A study tracker for the Senior Engineer coding and system design workbooks. Content is
presented in workbook order: four weeks of coding problems, with the ten system
design chapters distributed across those same weeks.

## Requirements

Node 18 or newer. This machine uses nvm:

```bash
nvm use 22
```

## Running it

```bash
npm install
npm run dev
```

The client runs on http://localhost:5173 and the API on http://localhost:4000.
Vite proxies `/api` to the server, so the client never hardcodes a port.

Copy `.env.example` to `server/.env` if you want to change the port or storage
driver. Without it the defaults apply.

## How the code is organized

Two workspaces, `server/` and `client/`. Each layer only talks to the layer
directly beneath it.

### server/

```
src/
  index.js         starts the HTTP listener
  app.js           builds the Express app (middleware + routes)
  config/          reads environment variables into one config object
  routes/          URL -> controller mapping, nothing else
  controllers/     unpack the request, call a service, send the response
  services/        the actual logic; no knowledge of HTTP
  storage/         where progress is saved; swappable (see below)
  data/            the workbook content, transcribed to JSON
  middleware/      404 and error handling
```

`data/` holds static content that never changes at runtime:

- `codingWeeks.json` — the four weeks and their 52 problems
- `designChapters.json` — the ten system design chapters, each tagged with the week it belongs to
- `designFramework.json` — the nine framework steps and practice checklist, shared by every chapter
- `checklists.json` — the weekly and final interview checklists
- `seedProgress.json` — progress already recorded in the workbook, used on first run

### Storage is swappable

Everything saves through the contract in `storage/StorageAdapter.js`: an object
with `read()` and `write()`. `storage/index.js` picks the implementation from the
`STORAGE_DRIVER` environment variable.

- `local` (default) writes `server/data/progress.json`
- `google-drive` is a stub — `storage/googleDriveAdapter.js` lists the four steps
  to finish it

Because nothing outside `storage/` knows which backend is active, finishing the
Drive adapter requires no changes anywhere else.

### client/

```
src/
  main.jsx         mounts React
  App.jsx          providers + routes
  api/             every fetch call lives here, one file per resource
  context/         CurriculumContext (static content), ProgressContext (user state)
  hooks/           small readers on top of the contexts
  constants/       shared values like the confidence levels
  pages/           one file per route, composes components
  components/
    common/        generic and reusable: Card, Badge, Checkbox, Checklist, ProgressBar
    layout/        AppLayout, Sidebar
    coding/        the problem table, confidence picker, notes, weekly checklist
    systemDesign/  framework steps, concept list, practice checklist
    dashboard/     overall stats, week cards, final checklist
  styles/          global.css holds the colors and spacing tokens
```

Components under `components/common/` are presentational — they take props and
report changes, and never read context directly. Section folders
(`coding/`, `systemDesign/`, `dashboard/`) hold the components that know about a
specific part of the workbook and wire the common pieces to the right slice of
progress state.

Two contexts rather than one, because the two kinds of data behave differently:
curriculum is fetched once and never changes, while progress is written on every
interaction. `ProgressContext` applies each change locally first and rolls back if
the request fails, so the UI never waits on the network.

## How progress is saved

Checkboxes and confidence save on click. Notes save when the field loses focus,
so typing does not fire a request per keystroke.

To start over, delete `server/data/progress.json` — the next read re-seeds it from
`seedProgress.json`.
