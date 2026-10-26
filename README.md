# The Garage

A tracker for my vehicles, built for quick phone entry: fill-ups, odometer, observations, maintenance due, projects, and stats. Its look is based on the Rocinante (dark red, gunmetal, near-black). It's built the same way as Apollo: plain HTML/CSS/JS, IndexedDB on the device, and it works offline once installed.

## Screens

- **Garage**: a photo card for each vehicle with odometer, last fill, average MPG, and alert chips.
- **Log**: shows critical alerts first (watch items, overdue MX, expiring registration/insurance). Below that is quick entry: odometer, auto-filled date, fuel (grade, $/gal, gallons, auto total, full-tank toggle, station), and a note with tags. A note can be attached to a watch item.
- **MX** (the badge counts items that are overdue or due within 500 mi / 30 days):
  - **Due**: mileage- and date-based countdowns.
  - **History**: the service log.
  - **Specs & Docs**: specs, VIN/plate, policy, title, and registration dates.
- **Projects**: grouped by phase or status, with parts (cost, have it?) and task checklists. Marking a project done can also log it to MX history.
- **Stats**: MPG trend (full-to-full tanks), cost per mile, monthly spend split into fuel/MX/projects, and miles driven.

## Data and sync

Data lives on the phone (IndexedDB). It also syncs to a **separate private repo** (`hurtlocker/garage-data`), where three things are written:

| File | What |
|---|---|
| `garage-data.json` | Full data: vehicles, logs, schedule, services, projects |
| `snapshot.md` | A readable summary, regenerated on every sync, so Claude can pick up Roci context |
| `photos/<vehicle-id>.jpg` | The hero photo for each vehicle (resized to about 250 KB) |
| `inbox.json` | Changes Claude queues, e.g. specs from the service manual. The app applies them, logs them under Settings → Updates from Claude, and empties the file. |

Sync runs about 2.5 s after each change. If you're offline, changes are queued. On launch and whenever the app comes back to the foreground, it pulls changes from other devices and applies the inbox. If both changed, the most recent push wins.

**This app repo holds no personal data.** It stays public so GitHub Pages can host it for free.

## Setup

1. **App repo** (public): commit this folder to `hurtlocker/garage`. Then go to **Settings → Pages → Deploy from a branch → main / (root)**.
2. **Data repo** (private): create `hurtlocker/garage-data` and set it to **Private**. Commit the provided `garage-data.json` (it holds the import from Notion).
3. **Token**: create a fine-grained token at github.com/settings/personal-access-tokens/new:
   - Repository access: **Only select repositories → garage-data**.
   - Permissions: **Contents: Read and write**. Nothing else is needed.
   - Pick a long expiration.
4. On the iPhone, open `https://hurtlocker.github.io/garage/` in Safari, then **Share → Add to Home Screen**.
5. In the app, tap the sync button on the home screen, paste the token, and tap **Connect**. Because the device starts empty, it loads the data from the repo.

## Updating the app

Bump `CACHE` in `service-worker.js` whenever any file changes, so installed copies pick up the new version.
