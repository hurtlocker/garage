"use strict";
/* ============================================================
   THE GARAGE — core: utils, storage, calculations, sync, snapshot
   ============================================================ */
const APP_VERSION = '1.10.3';

/* ---------- utils ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = p => p + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const num = v => { if (v === '' || v == null) return null; const n = parseFloat(String(v).replace(/[,$\s]/g, '')); return isFinite(n) ? n : null; };
const pad2 = n => String(n).padStart(2, '0');
const toISO = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const today = () => toISO(new Date());
const parseD = s => { if (!s) return null; const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function fmtDate(s, withYear) {
  const d = parseD(s); if (!d) return '—';
  const y = withYear || d.getFullYear() !== new Date().getFullYear();
  return `${MON[d.getMonth()]} ${d.getDate()}` + (y ? `, ${d.getFullYear()}` : '');
}
const fmtLong = s => { const d = parseD(s); return d ? `${DOW[d.getDay()]} · ${MON[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}` : '—'; };
const fmtMi = n => n == null ? '—' : Math.round(n).toLocaleString('en-US');
const money = (n, dec = 2) => n == null ? '—' : '$' + Number(n).toLocaleString('en-US', {minimumFractionDigits: dec, maximumFractionDigits: dec});
function addMonths(s, m) {
  const d = parseD(s); if (!d || m == null) return null;
  const whole = Math.floor(m), frac = m - whole;
  const r = new Date(d.getFullYear(), d.getMonth() + whole, d.getDate());
  if (frac) r.setDate(r.getDate() + Math.round(frac * 30.4));
  return toISO(r);
}
const daysBetween = (a, b) => Math.round((parseD(b) - parseD(a)) / 864e5);
const monthKey = s => s ? s.slice(0, 7) : null;
const cmpDateDesc = (a, b) => (b.date || '').localeCompare(a.date || '') || (b.odo || 0) - (a.odo || 0);

/* ---------- haptics ----------
   Android: navigator.vibrate. iPhone: Safari has no vibration API, so we toggle a hidden
   <input type="checkbox" switch>, which makes iOS play its system "tick". One feel only, and
   it's a workaround Apple could remove, so every haptic moment also has a visual cue.
   Kinds: tap (lift/start), step (light, per slot), threshold (crossed a line), success, error (double). */
const HAPTICS_SHELVED = true;   // 2026-10-26: no tick felt on Josh's iPhone. Flip to false (and restore the Settings row) to bring them back.
const Haptics = (() => {
  const canVibrate = typeof navigator.vibrate === 'function';
  const PATTERN = {tap: 12, step: 6, threshold: 14, success: 18, error: [14, 70, 14]};
  let label = null; const log = [];
  const enabled = () => { try { return localStorage.getItem('garage.haptics') !== 'off'; } catch (e) { return true; } };
  function iosTick() {
    if (!label) {
      const wrap = document.createElement('div');
      wrap.setAttribute('aria-hidden', 'true');
      wrap.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none';
      wrap.innerHTML = '<input type="checkbox" switch id="hapticSwitch" tabindex="-1"><label for="hapticSwitch"></label>';
      document.body.appendChild(wrap); label = wrap.querySelector('label');
    }
    label.click();
  }
  function fire(kind) {
    if (HAPTICS_SHELVED || !enabled()) return;
    log.push(kind); if (log.length > 40) log.shift();
    try {
      if (canVibrate) { navigator.vibrate(PATTERN[kind] || 12); return; }
      iosTick();
      if (kind === 'error') setTimeout(iosTick, 90);
    } catch (e) { /* haptics are best-effort */ }
  }
  return {tap: () => fire('tap'), step: () => fire('step'), threshold: () => fire('threshold'), success: () => fire('success'), error: () => fire('error'),
    enabled, setEnabled: on => { try { localStorage.setItem('garage.haptics', on ? 'on' : 'off'); } catch (e) {} }, log};
})();

/* ---------- state ---------- */
/* DIY savings: hours you worked × what a shop would charge per hour.
   Default: Ohio average independent-shop labor rate, $125/h (Tekmetric, June 2026). Editable in Settings. */
const SHOP_RATE_DEFAULT = 125;
const EMPTY = () => ({app: 'Garage', version: 1, updatedAt: null, vehicles: [], logs: [], schedule: [], services: [], projects: [], tireSets: [],
  settings: {dueSoonMi: 500, dueSoonDays: 30, shopRate: SHOP_RATE_DEFAULT}});
let DATA = EMPTY();
let PHOTOS = {};            // vid -> dataURL (kept out of the JSON; synced as photos/<vid>.jpg)
let SYNC = {token: '', owner: '', repo: '', branch: 'main', shas: {}, dirty: false, photoDirty: [], lastSync: null};

/* ---------- IndexedDB ---------- */
const DB_NAME = 'garage', STORE = 'kv';
let _db = null;
function openDB() {
  return new Promise((res, rej) => {
    if (_db) return res(_db);
    const rq = indexedDB.open(DB_NAME, 1);
    rq.onupgradeneeded = () => rq.result.createObjectStore(STORE);
    rq.onsuccess = () => { _db = rq.result; res(_db); };
    rq.onerror = () => rej(rq.error);
  });
}
async function idbGet(k) {
  const db = await openDB();
  return new Promise((res, rej) => { const rq = db.transaction(STORE).objectStore(STORE).get(k); rq.onsuccess = () => res(rq.result); rq.onerror = () => rej(rq.error); });
}
async function idbPut(k, v) {
  const db = await openDB();
  return new Promise((res, rej) => { const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).put(v, k); tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
}
async function load() {
  try {
    const d = await idbGet('data'); if (d && d.vehicles) { DATA = Object.assign(EMPTY(), d); if (normalizeData()) save(); }
    PHOTOS = (await idbGet('photos')) || {};
    PHOTO_SRC = (await idbGet('photoSrc')) || {};
    const s = await idbGet('sync'); if (s) SYNC = Object.assign(SYNC, s);
  } catch (e) { console.warn('load failed', e); }
}
let _saveT = null;
function save(opts = {}) {
  if (!opts.quiet) { DATA.updatedAt = new Date().toISOString(); SYNC.dirty = true; }
  clearTimeout(_saveT);
  _saveT = setTimeout(async () => {
    try { await idbPut('data', DATA); await idbPut('sync', SYNC); paintSync(); if (!opts.quiet) Cloud.schedulePush(); }
    catch (e) { setSyncState('err'); }
  }, 120);
}
const saveSync = () => idbPut('sync', SYNC).catch(() => {});
const savePhotos = () => idbPut('photos', PHOTOS).catch(() => {});
/* The uncropped original of each hero photo, kept on this device only so the crop can be re-adjusted later. */
let PHOTO_SRC = {};
const savePhotoSrc = () => idbPut('photoSrc', PHOTO_SRC).catch(() => {});

/* ---------- specs: quick reference vs. the rest ----------
   Spec rows are [label, value, source, quick?]. quick === true/false is the user's choice;
   undefined falls back to this default list, which is also the display order of the Quick reference. */
const QUICK_DEFAULT = ['engine oil', 'oil capacity', 'oil filter', 'oil drain plug', 'oil change interval',
  'tire pressure', 'tire size', 'lug nuts', 'wipers (d / p)', 'spark plugs', 'fuel tank'];
const specKey = s => String(s[0] || '').trim().toLowerCase();
const isQuick = s => s[3] === true || (s[3] !== false && QUICK_DEFAULT.includes(specKey(s)));
const quickRank = s => { const i = QUICK_DEFAULT.indexOf(specKey(s)); return i < 0 ? 999 : i; };

/* ---------- phases: strict 1–5 (or none) ---------- */
const PHASES = [1, 2, 3, 4, 5];
function normPhase(v) {
  if (v == null || v === '') return null;
  const n = typeof v === 'number' ? v : parseInt(String(v).trim().match(/^\D*(\d)/)?.[1], 10);
  return PHASES.includes(n) ? n : null;
}
const phaseLabel = n => n ? `Phase ${n}` : 'No phase';
function normalizeData() {                 // returns true if anything changed (older data stored free-text phases)
  let changed = false;
  for (const p of DATA.projects) { const n = normPhase(p.phase); if (n !== p.phase) { p.phase = n; changed = true; } }
  if (!Array.isArray(DATA.tireSets)) DATA.tireSets = [];     // added in v1.8.0
  if (DATA.settings && DATA.settings.shopRate == null) DATA.settings.shopRate = SHOP_RATE_DEFAULT;   // added in v1.9.0
  return changed;
}

/* ---------- tire sets ----------
   A set's rotation miles = miles banked while it was on the car before + miles since it went on (if it's on now).
   The vehicle's "Tire rotation" schedule item is kept in step with whichever set is on the car. */
const TIRE_POS = ['LF', 'RF', 'LR', 'RR'];
const tireSetsOf = vid => (DATA.tireSets || []).filter(t => t.vid === vid);
const setOnCar = vid => tireSetsOf(vid).find(t => t.onCar) || null;
const setRotMi = t => (t.rotMi || 0) + (t.onCar && t.mountOdo != null ? Math.max(0, (currentOdo(t.vid) || 0) - t.mountOdo) : 0);
const setTotalMi = t => (t.totalMi || 0) + (t.onCar && t.mountOdo != null ? Math.max(0, (currentOdo(t.vid) || 0) - t.mountOdo) : 0);
const tireSched = vid => schedOf(vid).find(s => /tire\s*rotation/i.test(s.name)) || null;
const latestTread = tire => { const r = (tire.treads || []).filter(x => x.d != null); return r.length ? r[r.length - 1] : null; };

/* ---------- DIY labor ---------- */
const isDIY = by => !by || by === 'DIY';
const shopRate = () => num(DATA.settings.shopRate) ?? SHOP_RATE_DEFAULT;
/** Jobs with hours logged: DIY service records (not ones made from a project; the project holds its hours) and projects. */
function diyJobs(vid, inR = () => true) {
  const out = [];
  svcOf(vid).forEach(s => { if (s.hours > 0 && isDIY(s.doneBy) && !(s.projectId && DATA.projects.some(p => p.id === s.projectId)) && inR(s.date)) out.push({kind: 'svc', id: s.id, title: s.title, date: s.date, hours: s.hours}); });
  projOf(vid).forEach(p => { if (p.hours > 0 && inR(p.doneAt || p.createdAt)) out.push({kind: 'proj', id: p.id, title: p.title, date: p.doneAt || p.createdAt, hours: p.hours, open: p.status !== 'Done'}); });
  return out.map(j => Object.assign(j, {saved: j.hours * shopRate()}));
}

/* ---------- lookups ---------- */
const V = id => DATA.vehicles.find(v => v.id === id);
const vName = v => v.nickname || v.model || 'Vehicle';
const vSub = v => [v.year, v.make, v.model, v.trim].filter(Boolean).join(' ') + (v.transmission && /manual/i.test(v.transmission) ? ' · MT' : '');
const logsOf = vid => DATA.logs.filter(l => l.vid === vid);
const svcOf = vid => DATA.services.filter(s => s.vid === vid);
const schedOf = vid => DATA.schedule.filter(s => s.vid === vid);
const projOf = vid => DATA.projects.filter(p => p.vid === vid);

function currentOdo(vid) {
  const v = V(vid); let m = v && v.purchaseMi || 0;
  for (const l of DATA.logs) if (l.vid === vid && l.odo > m) m = l.odo;
  for (const s of DATA.services) if (s.vid === vid && s.odo > m) m = s.odo;
  return m || null;
}
function lastLogged(vid) {
  return logsOf(vid).filter(l => l.odo != null).sort(cmpDateDesc)[0] || null;
}

/* ---------- maintenance status ---------- */
function schedStatus(item, odo, set = DATA.settings) {
  const r = {state: 'none', miLeft: null, daysLeft: null, dueMi: null, dueDate: null, pct: 0};
  if (item.lastMi == null && !item.lastDate) return r;
  const fr = [];
  if (item.everyMi && item.lastMi != null && odo != null) {
    r.dueMi = item.lastMi + item.everyMi; r.miLeft = r.dueMi - odo; fr.push((odo - item.lastMi) / item.everyMi);
  }
  if (item.everyMo && item.lastDate) {
    r.dueDate = addMonths(item.lastDate, item.everyMo); r.daysLeft = daysBetween(today(), r.dueDate);
    fr.push(daysBetween(item.lastDate, today()) / Math.max(1, daysBetween(item.lastDate, r.dueDate)));
  }
  if (!fr.length) return r;   // has a baseline but not one we can measure against (e.g. date-only for a mileage item)
  r.pct = Math.max(0, Math.min(1, Math.max(...fr)));
  const over = (r.miLeft != null && r.miLeft < 0) || (r.daysLeft != null && r.daysLeft < 0);
  const soon = (r.miLeft != null && r.miLeft <= set.dueSoonMi) || (r.daysLeft != null && r.daysLeft <= set.dueSoonDays);
  r.state = over ? 'overdue' : soon ? 'soon' : 'ok';
  return r;
}
function docItems(v) {
  const out = [];
  const d = v.docs || {};
  [['Registration', d.registrationExpires], ['Insurance renewal', d.insuranceRenews]].forEach(([n, date]) => {
    if (!date) return;
    const days = daysBetween(today(), date);
    out.push({name: n, date, daysLeft: days, state: days < 0 ? 'overdue' : days <= DATA.settings.dueSoonDays ? 'soon' : 'ok'});
  });
  tireSetsOf(v.id).filter(t => !t.onCar && t.swapBy).forEach(t => {        // seasonal swap reminder you set on a stored set
    const days = daysBetween(today(), t.swapBy);
    out.push({name: `Seasonal swap · to ${t.name}`, date: t.swapBy, daysLeft: days, kind: 'swap', setId: t.id, state: days < 0 ? 'overdue' : days <= DATA.settings.dueSoonDays ? 'soon' : 'ok'});
  });
  return out;
}
function mxSummary(vid) {
  const odo = currentOdo(vid), v = V(vid);
  const items = schedOf(vid).map(it => ({it, st: schedStatus(it, odo)}));
  const docs = docItems(v);
  const count = s => items.filter(x => x.st.state === s).length + docs.filter(x => x.state === s).length;
  return {odo, items, docs, overdue: count('overdue'), soon: count('soon'), none: items.filter(x => x.st.state === 'none').length};
}
const badgeCount = vid => { const m = mxSummary(vid); return m.overdue + m.soon; };
function dueText(st, it) {
  const parts = [];
  if (st.miLeft != null) parts.push(st.miLeft < 0 ? `${fmtMi(-st.miLeft)} mi over` : `in ${fmtMi(st.miLeft)} mi`);
  if (st.daysLeft != null) parts.push(st.daysLeft < 0 ? `${-st.daysLeft}d late` : `by ${fmtDate(st.dueDate)}`);
  if (!parts.length) return intervalText(it);
  return parts.join(' · ');
}
function intervalText(it) {
  const a = [];
  if (it.everyMi) a.push(`${fmtMi(it.everyMi)} mi`);
  if (it.everyMo) a.push(it.everyMo % 12 === 0 && it.everyMo >= 12 ? `${it.everyMo / 12} yr` : `${it.everyMo} mo`);
  return a.length ? 'every ' + a.join(' / ') : 'no interval';
}

/* ---------- fuel + stats ---------- */
function fuelSeries(vid) {
  const fills = logsOf(vid).filter(l => l.fuel && l.odo != null).sort((a, b) => a.odo - b.odo || (a.date || '').localeCompare(b.date || ''));
  const out = []; let lastFull = null, galAcc = 0;
  for (const f of fills) {
    galAcc += f.fuel.gal || 0;
    if (f.fuel.full) {
      if (lastFull != null && galAcc > 0 && f.odo > lastFull) out.push({id: f.id, date: f.date, odo: f.odo, mpg: (f.odo - lastFull) / galAcc});
      lastFull = f.odo; galAcc = 0;
    }
  }
  return out;
}
const mpgFor = (vid, logId) => (fuelSeries(vid).find(x => x.id === logId) || {}).mpg;
const fuelCost = f => f.total != null ? f.total : (f.ppg != null && f.gal != null ? f.ppg * f.gal : 0);
const svcCost = s => (s.parts || 0) + (s.labor || 0);

function rangeStart(r) {
  if (r === 'all') return null;
  const d = new Date(); const map = {'30d': 30, '90d': 90, '6m': 182, '1y': 365};
  d.setDate(d.getDate() - map[r]); return toISO(d);
}
function stats(vid, range) {
  const v = V(vid), from = rangeStart(range), inR = d => d && (!from || d >= from);
  const owned = s => !v.purchaseDate || !s.date || s.date >= v.purchaseDate;      // prior-owner records are history, not your spending or driving
  const logs = logsOf(vid);
  const fuel = logs.filter(l => l.fuel && inR(l.date));
  const svc = svcOf(vid).filter(s => inR(s.date) && owned(s));
  // a finished project's MX record repeats its parts cost, which is already counted from the project: count only its labor
  const svcSpend = s => s.projectId && DATA.projects.some(p => p.id === s.projectId) ? (s.labor || 0) : svcCost(s);
  const parts = [];
  projOf(vid).forEach(p => (p.parts || []).forEach(pt => { if (pt.have && pt.cost && inR(pt.date)) parts.push({date: pt.date, cost: pt.cost}); }));
  const fuelSpend = fuel.reduce((a, l) => a + fuelCost(l.fuel), 0);
  const mxSpend = svc.reduce((a, s) => a + svcSpend(s), 0);
  const projSpend = parts.reduce((a, p) => a + p.cost, 0);
  const odoPts = logs.filter(l => l.odo != null && inR(l.date)).map(l => l.odo).concat(svcOf(vid).filter(s => s.odo != null && inR(s.date) && owned(s)).map(s => s.odo));
  let miles = odoPts.length > 1 ? Math.max(...odoPts) - Math.min(...odoPts) : 0;
  if (range === 'all') { const c = currentOdo(vid); if (v.purchaseMi && c) miles = c - v.purchaseMi; }
  const mpgAll = fuelSeries(vid);
  const mpg = mpgAll.filter(x => inR(x.date));
  const avgMpg = mpg.length ? mpg.reduce((a, x) => a + x.mpg, 0) / mpg.length : null;
  const gal = fuel.reduce((a, l) => a + (l.fuel.gal || 0), 0);
  const ppg = gal ? fuel.reduce((a, l) => a + (l.fuel.ppg || 0) * (l.fuel.gal || 0), 0) / gal : null;
  // previous equal-length window for MPG delta
  let prevAvg = null;
  if (from) {
    const span = daysBetween(from, today()); const pd = parseD(from); pd.setDate(pd.getDate() - span); const pFrom = toISO(pd);
    const prev = mpgAll.filter(x => x.date && x.date >= pFrom && x.date < from);
    if (prev.length) prevAvg = prev.reduce((a, x) => a + x.mpg, 0) / prev.length;
  }
  // monthly buckets
  const months = {};
  const bump = (d, k, v) => { const m = monthKey(d); if (!m || !v) return; months[m] = months[m] || {fuel: 0, mx: 0, proj: 0}; months[m][k] += v; };
  fuel.forEach(l => bump(l.date, 'fuel', fuelCost(l.fuel)));
  svc.forEach(s => bump(s.date, 'mx', svcSpend(s)));
  parts.forEach(p => bump(p.date, 'proj', p.cost));
  const total = fuelSpend + mxSpend + projSpend;
  const firstD = [...fuel.map(l => l.date), ...svc.map(s => s.date)].filter(Boolean).sort()[0];
  const monthsSpan = from ? Math.max(1, daysBetween(from, today()) / 30.4) : (firstD ? Math.max(1, daysBetween(firstD, today()) / 30.4) : 1);
  const diy = diyJobs(vid, d => !from || (d && d >= from));
  const diyHours = diy.reduce((a, j) => a + j.hours, 0);
  const diyMonths = {};
  diy.forEach(j => { const m = monthKey(j.date); if (m && j.saved) diyMonths[m] = (diyMonths[m] || 0) + j.saved; });
  return {diy, diyHours, diyMonths, diySaved: diyHours * shopRate(), fuelSpend, mxSpend, projSpend, total, miles, avgMpg, prevAvg, mpg, gal, ppg, months, perMile: miles ? total / miles : null,
    fuelPerMile: miles ? fuelSpend / miles : null, mxPerMile: miles ? mxSpend / miles : null, projPerMile: miles ? projSpend / miles : null,
    milesPerMonth: miles ? miles / monthsSpan : null, fills: fuel.length};
}

/* ---------- images ---------- */
async function shrinkImage(file, maxEdge = 1280, maxBytes = 260000) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const s = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    let q = 0.82, out = c.toDataURL('image/jpeg', q);
    while (out.length * 0.75 > maxBytes && q > 0.45) { q -= 0.08; out = c.toDataURL('image/jpeg', q); }
    return out;
  } finally { URL.revokeObjectURL(url); }
}

/* ---------- base64 (UTF-8 safe) ---------- */
function b64enc(str) {
  const bytes = new TextEncoder().encode(str); let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
function b64dec(b64) {
  const bin = atob(b64.replace(/\s/g, '')); const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/* ---------- sync indicator ---------- */
let _syncState = 'local';
function setSyncState(s) { _syncState = s; paintSync(); }
function paintSync() {
  $$('.sync-dot').forEach(el => el.className = 'sync-dot ' + ({synced: 'synced', syncing: 'syncing', queued: 'queued', err: 'err'}[_syncState] || ''));
  $$('.sync-txt').forEach(el => el.textContent = syncLabel());
}
function syncLabel() {
  if (!Cloud.connected()) return 'On device';
  if (_syncState === 'syncing') return 'Syncing…';
  if (_syncState === 'err') return 'Sync error';
  if (!navigator.onLine || SYNC.dirty) return 'Queued';
  return SYNC.lastSync ? 'Synced ' + ago(SYNC.lastSync) : 'Synced';
}
function ago(t) {
  const s = (Date.now() - t) / 1000;
  if (s < 60) return 'just now'; if (s < 3600) return Math.round(s / 60) + 'm ago'; if (s < 86400) return Math.round(s / 3600) + 'h ago';
  return Math.round(s / 86400) + 'd ago';
}
function restingSync() { setSyncState(!Cloud.connected() ? 'local' : (!navigator.onLine || SYNC.dirty) ? 'queued' : 'synced'); }

/* ============================================================
   CLOUD — private GitHub repo via the Contents API
   garage-data.json (full data) · snapshot.md (Claude context) · photos/<vid>.jpg
   Fine-grained PAT, Contents read/write on that one repo. Last-write-wins.
   ============================================================ */
const DATA_FILE = 'garage-data.json', SNAP_FILE = 'snapshot.md', INBOX_FILE = 'inbox.json';
const Cloud = (() => {
  let pushing = false, timer = null;
  const base = () => `https://api.github.com/repos/${SYNC.owner}/${SYNC.repo}`;
  const H = () => ({Authorization: 'Bearer ' + SYNC.token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28'});
  async function api(path, opts = {}) {
    const r = await fetch(base() + path, {...opts, headers: {...H(), ...(opts.headers || {})}, cache: 'no-store'});
    if (r.status === 404) return null;
    if (!r.ok) { const e = new Error('GitHub ' + r.status); e.status = r.status; throw e; }
    return r.status === 204 ? {} : r.json();
  }
  const connected = () => !!(SYNC.token && SYNC.owner && SYNC.repo);
  async function getFile(path) {
    const j = await api(`/contents/${path}?ref=${encodeURIComponent(SYNC.branch)}`);
    if (!j) return null;
    SYNC.shas[path] = j.sha;
    let content = j.content;
    if (!content && j.git_url) { const b = await fetch(j.git_url, {headers: H()}).then(r => r.json()); content = b.content; }
    return {sha: j.sha, b64: content};
  }
  async function putFile(path, b64, msg, retry = true) {
    const body = {message: msg, content: b64, branch: SYNC.branch};
    if (SYNC.shas[path]) body.sha = SYNC.shas[path];
    try {
      const j = await api(`/contents/${path}`, {method: 'PUT', body: JSON.stringify(body)});
      SYNC.shas[path] = j.content.sha;
    } catch (e) {
      if (retry && (e.status === 409 || e.status === 422)) {   // stale sha: refresh and overwrite (last write wins)
        const meta = await api(`/contents/${path}?ref=${encodeURIComponent(SYNC.branch)}`);
        SYNC.shas[path] = meta ? meta.sha : undefined; return putFile(path, b64, msg, false);
      }
      throw e;
    }
  }
  async function connect(token, owner, repo) {
    const prev = {...SYNC};
    Object.assign(SYNC, {token, owner, repo, shas: {}});
    try {
      const info = await api('');
      if (!info) throw new Error('Repo not found — check owner/name and token access');
      if (!info.private && !confirm(`${owner}/${repo} is PUBLIC. Your VIN, plates and policy numbers would be visible to anyone. Continue anyway?`)) throw new Error('Cancelled');
      SYNC.branch = info.default_branch || 'main';
      const remote = await getFile(DATA_FILE);
      await saveSync();
      return {remote: !!remote};
    } catch (e) { Object.assign(SYNC, prev); throw e; }
  }
  function disconnect() { Object.assign(SYNC, {token: '', owner: '', repo: '', shas: {}, dirty: false, lastSync: null}); saveSync(); restingSync(); }
  function schedulePush() {
    if (!connected()) { restingSync(); return; }
    clearTimeout(timer); timer = setTimeout(push, 2500); setSyncState('queued');
  }
  async function push() {
    if (!connected() || pushing) return;
    if (!navigator.onLine) { setSyncState('queued'); return; }
    pushing = true; setSyncState('syncing');
    const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
    try {
      for (const vid of [...new Set(SYNC.photoDirty)]) {
        const p = `photos/${vid}.jpg`;
        if (PHOTOS[vid]) {
          if (!SYNC.shas[p]) { const m = await api(`/contents/${p}?ref=${encodeURIComponent(SYNC.branch)}`); if (m) SYNC.shas[p] = m.sha; }
          await putFile(p, PHOTOS[vid].split(',')[1], `Photo: ${vName(V(vid) || {})}`);
        }
      }
      SYNC.photoDirty = [];
      await putFile(DATA_FILE, b64enc(JSON.stringify(DATA, null, 2)), `Garage data · ${stamp}`);
      await putFile(SNAP_FILE, b64enc(buildSnapshot()), `Snapshot · ${stamp}`);
      SYNC.dirty = false; SYNC.lastSync = Date.now(); await saveSync(); setSyncState('synced');
    } catch (e) { console.warn(e); await saveSync(); setSyncState(navigator.onLine ? 'err' : 'queued'); }
    finally { pushing = false; }
  }
  async function pull() {
    const f = await getFile(DATA_FILE);
    if (!f) throw new Error('No garage-data.json in the repo yet');
    const d = JSON.parse(b64dec(f.b64));
    if (!d.vehicles) throw new Error('Not a Garage data file');
    DATA = Object.assign(EMPTY(), d);
    const migrated = normalizeData();
    await getFile(SNAP_FILE).catch(() => null);
    for (const v of DATA.vehicles) {
      try { const p = await getFile(`photos/${v.id}.jpg`); if (p) PHOTOS[v.id] = 'data:image/jpeg;base64,' + p.b64.replace(/\s/g, ''); } catch (e) {}
    }
    SYNC.dirty = migrated; SYNC.photoDirty = []; SYNC.lastSync = Date.now();
    await idbPut('data', DATA); await savePhotos(); await saveSync(); setSyncState('synced');
  }
  // Inbox: changes Claude (or anything else) queues in inbox.json. Applied here, then the file is emptied.
  // Never conflicts with garage-data.json, because nothing but this app writes that file.
  async function applyInbox() {
    const f = await getFile(INBOX_FILE);
    if (!f) return 0;
    let box; try { box = JSON.parse(b64dec(f.b64)); } catch (e) { console.warn('inbox unreadable', e); return 0; }
    const pending = (box.patches || []).filter(p => p && p.id && !(DATA.appliedPatches || []).includes(p.id));
    let applied = 0;
    for (const p of pending) {
      const res = applyPatch(p);
      DATA.appliedPatches = [...(DATA.appliedPatches || []), p.id].slice(-200);
      DATA.patchLog = [{id: p.id, note: p.note || '', by: p.by || 'claude', at: p.at || null, appliedAt: new Date().toISOString(),
        ok: res.ok, skipped: res.skipped}, ...(DATA.patchLog || [])].slice(0, 30);
      applied++;
    }
    if (applied) normalizeData();
    if (applied) { DATA.updatedAt = new Date().toISOString(); SYNC.dirty = true; await idbPut('data', DATA); }
    if ((box.patches || []).length) {          // empty the inbox (patch ids are remembered, so a failed clear can't double-apply)
      try { await putFile(INBOX_FILE, b64enc(JSON.stringify({patches: []}, null, 2) + '\n'), 'Inbox applied by app'); } catch (e) { console.warn('inbox clear failed', e); }
    }
    return applied;
  }
  // On launch and whenever the app returns to the foreground: pull other devices' changes,
  // apply the inbox, then push anything local.
  let reconciling = false;
  async function reconcile() {
    if (!connected() || !navigator.onLine) { restingSync(); return false; }
    if (reconciling || pushing) return false;
    reconciling = true; let changed = false;
    try {
      if (!SYNC.dirty) {
        const meta = await api(`/contents/${DATA_FILE}?ref=${encodeURIComponent(SYNC.branch)}`);
        if (meta && meta.sha !== SYNC.shas[DATA_FILE]) { await pull(); changed = true; }
      }
      const n = await applyInbox();
      if (n) { changed = true; LAST_INBOX = n; }
      if (SYNC.dirty) await push(); else restingSync();
    } catch (e) { console.warn(e); setSyncState('err'); }
    finally { reconciling = false; }
    return changed;
  }
  return {connected, connect, disconnect, schedulePush, push, pull, reconcile};
})();
let LAST_INBOX = 0;

/* ---------- inbox patch ops ---------- */
const PATCH_COLLS = ['logs', 'schedule', 'services', 'projects', 'tireSets'];
const VEHICLE_FIELDS = ['nickname', 'year', 'make', 'model', 'trim', 'body', 'transmission', 'plate', 'vin', 'status', 'purchaseDate', 'purchaseMi', 'order'];
function applyPatch(p) {
  let ok = 0; const skipped = [];
  for (const op of (p.ops || [])) {
    try {
      const v = op.vid ? V(op.vid) : null;
      switch (op.op) {
        case 'setSpec': {
          if (!v || !op.key) throw 'vehicle/key';
          v.specs = v.specs || [];
          const i = v.specs.findIndex(s => s[0].toLowerCase() === String(op.key).toLowerCase());
          const row = [i >= 0 ? v.specs[i][0] : String(op.key), String(op.value ?? ''), op.source ? String(op.source) : ''];   // keep the existing label as written
          const q = op.quick !== undefined ? !!op.quick : (i >= 0 ? v.specs[i][3] : undefined);   // keep Josh's placement
          if (q !== undefined) row[3] = q;
          if (i >= 0) v.specs[i] = row; else v.specs.push(row);
          break;
        }
        case 'delSpec': {
          if (!v) throw 'vehicle';
          v.specs = (v.specs || []).filter(s => s[0].toLowerCase() !== String(op.key).toLowerCase());
          break;
        }
        case 'updateVehicle': {
          if (!v) throw 'vehicle';
          for (const [k, val] of Object.entries(op.fields || {})) if (VEHICLE_FIELDS.includes(k)) v[k] = val;
          if (op.docs) v.docs = Object.assign({}, v.docs || {}, op.docs);
          break;
        }
        case 'upsert': {
          if (!PATCH_COLLS.includes(op.coll) || !op.item || !op.item.id) throw 'coll/item.id';
          const arr = DATA[op.coll], cur = arr.find(x => x.id === op.item.id);
          if (cur) Object.assign(cur, op.item);
          else { if (!V(op.item.vid)) throw 'item.vid'; arr.push(op.item); }
          break;
        }
        case 'delete': {
          if (!PATCH_COLLS.includes(op.coll)) throw 'coll';
          DATA[op.coll] = DATA[op.coll].filter(x => x.id !== op.id);
          break;
        }
        case 'settings': Object.assign(DATA.settings, op.fields || {}); break;
        default: throw 'unknown op';
      }
      ok++;
    } catch (e) { skipped.push(`${op.op || '?'} (${e})`); }
  }
  return {ok, skipped};
}
window.addEventListener('online', () => { if (Cloud.connected() && SYNC.dirty) Cloud.push(); else restingSync(); });
window.addEventListener('offline', restingSync);

/* ============================================================
   SNAPSHOT — markdown summary for Claude (written to the repo on each sync)
   ============================================================ */
function buildSnapshot() {
  const L = [];
  L.push(`# The Garage — snapshot`, ``, `Generated ${new Date().toLocaleString('en-US')} by The Garage app (v${APP_VERSION}). Read-only summary; the source of truth is \`${DATA_FILE}\`.`, ``);
  const vs = [...DATA.vehicles].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  for (const v of vs) {
    const m = mxSummary(v.id), odo = currentOdo(v.id);
    L.push(`## ${vName(v)}${v.nickname && v.model ? ` — ${v.year} ${v.make} ${v.model} ${v.trim || ''}`.trimEnd() : ''}`, ``);
    L.push(`- Odometer: **${fmtMi(odo)} mi**` + (lastLogged(v.id) ? ` (last logged ${fmtDate(lastLogged(v.id).date, true)})` : ''));
    L.push(`- Plate ${v.plate || '—'} · VIN ${v.vin || '—'} · ${v.transmission || ''} · status ${v.status || 'Active'}`);
    if (v.purchaseDate || v.purchaseMi) L.push(`- Purchased ${fmtDate(v.purchaseDate, true)} at ${fmtMi(v.purchaseMi)} mi`);
    const d = v.docs || {};
    const docLine = [d.insurer && `insurer ${d.insurer}`, d.policy && `policy ${d.policy}`, d.insuranceRenews && `insurance renews ${fmtDate(d.insuranceRenews, true)}`,
      d.registrationExpires && `registration expires ${fmtDate(d.registrationExpires, true)}`, d.title && `title ${d.title}`].filter(Boolean).join(' · ');
    if (docLine) L.push(`- Docs: ${docLine}`);
    const specs = (v.specs || []).filter(s => s[1]);
    if (specs.length) {
      const line = s => L.push(`- ${s[0]}: ${s[1]}${s[2] ? ` _(${s[2]})_` : ''}`);
      const q = specs.filter(isQuick).sort((a, b) => quickRank(a) - quickRank(b)), r = specs.filter(s => !isQuick(s));
      if (q.length) { L.push(``, `**Quick reference**`, ``); q.forEach(line); }
      if (r.length) { L.push(``, `**Other specs**`, ``); r.forEach(line); }
    }
    const watches = projOf(v.id).filter(p => p.watch && p.status !== 'Done');
    const crit = m.items.filter(x => x.st.state === 'overdue' || x.st.state === 'soon');
    if (watches.length || crit.length || m.docs.some(x => x.state !== 'ok')) {
      L.push(``, `**Alerts**`, ``);
      watches.forEach(p => L.push(`- WATCH: ${p.title}${p.notes ? ' — ' + p.notes : ''}`));
      crit.forEach(x => L.push(`- MX ${x.st.state.toUpperCase()}: ${x.it.name} (${dueText(x.st, x.it)})`));
      m.docs.filter(x => x.state !== 'ok').forEach(x => L.push(`- ${x.name} ${x.state === 'overdue' ? 'EXPIRED' : 'due'} ${fmtDate(x.date, true)}`));
    }
    if (m.items.length) {
      L.push(``, `**Maintenance schedule**`, ``, `| Item | Interval | Last done | Status |`, `|---|---|---|---|`);
      m.items.forEach(({it, st}) => L.push(`| ${it.name} | ${intervalText(it).replace('every ', '')} | ${it.lastMi != null ? fmtMi(it.lastMi) + ' mi' : ''}${it.lastDate ? ' ' + fmtDate(it.lastDate, true) : ''}${it.lastMi == null && !it.lastDate ? 'unknown' : ''} | ${st.state === 'none' ? 'needs baseline' : st.state + ' — ' + dueText(st, it)} |`));
    }
    const ts = tireSetsOf(v.id);
    if (ts.length) {
      L.push(``, `**Tire sets**`, ``);
      ts.forEach(t => L.push(`- ${t.name}${t.onCar ? ' (ON CAR)' : ' (stored' + (t.storage ? ' · ' + t.storage : '') + ')'} — ${[t.size, t.brand, t.dot && 'DOT ' + t.dot, t.directional ? 'directional' : 'non-directional'].filter(Boolean).join(' · ')}` +
        ` · ${fmtMi(setRotMi(t))} mi since rotation · ${fmtMi(setTotalMi(t))} mi logged on set` +
        ` · ${(t.tires || []).map(x => { const r = latestTread(x); return `${x.l} ${x.pos}${r ? ' ' + r.d + '/32' : ''}`; }).join(', ')}` +
        (t.swapBy && !t.onCar ? ` · swap reminder ${fmtDate(t.swapBy, true)}` : '') + (t.notes ? ` — ${t.notes}` : '')));
    }
    const sv = svcOf(v.id).sort(cmpDateDesc).slice(0, 12);
    if (sv.length) {
      L.push(``, `**Service history** (latest ${sv.length})`, ``);
      sv.forEach(s => L.push(`- ${s.date ? fmtDate(s.date, true) : 'undated'} · ${s.odo != null ? fmtMi(s.odo) + ' mi' : '— mi'} · ${s.title}${svcCost(s) ? ' · ' + money(svcCost(s)) : ''}${s.doneBy ? ' · ' + s.doneBy : ''}${s.hours ? ' · ' + s.hours + ' h' : ''}${s.notes ? ' — ' + s.notes : ''}`));
    }
    const lg = logsOf(v.id).sort(cmpDateDesc).slice(0, 15);
    if (lg.length) {
      L.push(``, `**Recent log**`, ``);
      lg.forEach(l => {
        const f = l.fuel; const mp = f ? mpgFor(v.id, l.id) : null;
        L.push(`- ${l.date ? fmtDate(l.date, true) : 'undated'} · ${l.odo != null ? fmtMi(l.odo) + ' mi' : '—'}` +
          (f ? ` · fuel ${f.gal ?? '?'} gal @ ${f.ppg != null ? money(f.ppg, 3) : '?'}${f.grade ? ' (' + f.grade + ')' : ''}${f.full ? '' : ' partial'}${mp ? ` · ${mp.toFixed(1)} mpg` : ''}` : '') +
          (l.tags && l.tags.length ? ` · [${l.tags.join(', ')}]` : '') + (l.note ? ` — ${l.note.replace(/\n+/g, ' ')}` : '') +
          (l.projectId && DATA.projects.find(p => p.id === l.projectId) ? ` (re: ${DATA.projects.find(p => p.id === l.projectId).title})` : ''));
      });
    }
    const open = projOf(v.id).filter(p => p.status !== 'Done').sort((a, b) => (a.phase || 9) - (b.phase || 9) || (a.order ?? 0) - (b.order ?? 0));
    if (open.length) {
      L.push(``, `**Open projects** (${open.length})`, ``);
      open.forEach(p => {
        const parts = (p.parts || []).map(x => `${x.have ? '✓' : '○'} ${x.name}${x.cost ? ' ' + money(x.cost) : ''}`).join(', ');
        const tasks = (p.tasks || []).map(t => `${t.done ? '✓' : '○'} ${t.t}`).join(', ');
        L.push(`- [${p.status}] ${p.title} — ${p.category || ''}${p.phase ? ' · ' + phaseLabel(p.phase) : ''}${p.priority && p.priority !== 'Normal' ? ' · ' + p.priority + ' priority' : ''}${p.hours ? ' · ' + p.hours + ' h so far' : ''}${p.notes ? ' — ' + p.notes : ''}${parts ? ' · parts: ' + parts : ''}${tasks ? ' · tasks: ' + tasks : ''}`);
      });
    }
    const done = projOf(v.id).filter(p => p.status === 'Done');
    if (done.length) { L.push(``, `**Completed projects**`, ``); done.forEach(p => L.push(`- ${p.title}${p.doneAt ? ' (' + fmtDate(p.doneAt, true) + ')' : ''}${p.hours ? ' · ' + p.hours + ' h' : ''}`)); }
    const st = stats(v.id, 'all');
    if (st.diyHours) L.push(``, `**DIY labor**: ${st.diyHours} h across ${st.diy.length} jobs ≈ ${money(st.diySaved, 0)} saved at ${money(shopRate(), 0)}/h shop rate`);
    if (st.fills || st.total) L.push(``, `**Stats (since purchase)**: ${st.avgMpg ? st.avgMpg.toFixed(1) + ' avg mpg · ' : ''}${fmtMi(st.miles)} mi · spent ${money(st.total)} (fuel ${money(st.fuelSpend)}, MX ${money(st.mxSpend)}, projects ${money(st.projSpend)})${st.perMile ? ' · ' + money(st.perMile) + '/mi' : ''}`);
    L.push(``);
  }
  return L.join('\n');
}
