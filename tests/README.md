# Tests

These are end-to-end checks that run the real app in a headless phone-sized browser (390×844, touch). Run them before and after any change, and especially before a refactor.

```bash
cd tests
npm install                      # first time only (installs Playwright)
npx playwright install chromium  # first time only
npm test                         # all suites
npm test -- reorder              # just the suites whose file name contains "reorder"
```

The runner serves the app folder itself, so no server or network is needed. GitHub is replaced by an in-memory fake, and web fonts are blocked. Screenshots go to `tests/output/`, which git ignores.

| Suite | Covers |
|---|---|
| `core.test.js` | Connecting and pulling, fill-ups and MPG math (including partial fills), notes on watch items, MX baseline and service logging, document due alerts, project parts, stats, push to repo, `snapshot.md`, persistence, registering a vehicle with a photo, no sideways scroll at 320/390/768 px |
| `inbox.test.js` | Claude's `inbox.json`: every op type, invalid ops skipped and logged, unsynced phone data never overwritten, each patch applied only once, inbox emptied, another device's changes pulled when the app returns to the foreground |
| `phases-sheet.test.js` | Old phase labels migrate to 1–5, all five phases are listed, the locked phase picker, new projects never hidden by a filter, pull-down-to-dismiss (snap back, flick, scroll and textarea cases), Esc and tap-outside |
| `reorder.test.js` | Press-and-hold drag for tasks and parts, no accidental reorders, edits kept, arrow keys, saved order |
| `swipe.test.js` | Swipe left to delete tasks and parts (partial swipe snaps back, armed at halfway, Undo, no stray checkbox toggles, Delete key), the visual cue at each line-crossing moment, and that haptics stay shelved |
| `quick-specs.test.js` | Quick reference vs. All other specs, the toggle on the edit card, inbox updates respecting placement, snapshot order |
| `update.test.js` | A new deploy shows up on the next open even inside GitHub Pages' 10-minute cache window, and the offline copy is the new version (serves the app the way Pages does, with the service worker on) |
| `desktop.test.js` | Wide windows (≥ 1024 px): Fleet Overview columns and critical-only alert strip, opening a vehicle's Workbench, drag a project card to another phase or status, edit cards as a right-hand side panel, logging from the rail, every tab, the vehicle switcher, and the phone layout below 1024 px (upright iPad) with a live switch back |
| `fonts.test.js` | Every input, select and textarea is at least 16px, so iOS never zooms on focus |

## Fixtures

- `fixtures/seed.json` is the Notion import **with the VINs, plates and documents replaced by fake values**. This repo is public, so real vehicle data never goes in it.
- `fixtures/fsm-specs-patch.json` is the service-manual specs patch, in the same format Claude writes to `inbox.json`.

## Adding a test

Create `something.test.js` that exports `async ({browser, base, check}) => { … }`. Use the helpers in `helpers.js` (`newPage`, `loadData`, `mockGitHub`, `connect`, `touchDrag`, `shot`), and call `check(condition, 'what it proves')` for each assertion. The runner picks the new file up automatically.
