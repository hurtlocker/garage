"use strict";
/* ============================================================
   THE GARAGE — UI: router, screens, sheets, actions
   ============================================================ */
const IC = {
  back: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
  chev: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B757C" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
  plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F0675C" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  car: '<svg width="64" height="40" viewBox="0 0 64 40" fill="none" stroke="#6B757C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 28h52v-6l-6-2-8-9H20l-8 9-6 2z"/><circle cx="18" cy="30" r="5"/><circle cx="46" cy="30" r="5"/></svg>',
  alert: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="10"/></svg>',
  eye: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  fuel: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F0675C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 22V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v17M3 22h12M15 9h2a2 2 0 0 1 2 2v6a2 2 0 0 0 4 0V8l-4-4M7 7h4"/></svg>',
  pen: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F0675C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  gear: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  check: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>',
  x: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  cam: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
  copy: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
};
const CATEGORIES = ['Repair', 'Maintenance', 'Electrical', 'Interior', 'Exterior', 'Suspension', 'Glass', 'Purchase', 'Other'];
const STATUSES = ['To Do', 'Parts Ordered', 'Parts In Hand', 'In Progress', 'Done'];
const STATUS_COLOR = {'To Do': '#6B757C', 'Parts Ordered': '#E0A445', 'Parts In Hand': '#E0A445', 'In Progress': '#F0675C', 'Done': '#7FA7BD'};
const PHASE_COLORS = ['#F0675C', '#7FA7BD', '#E0A445', '#9BC4A4', '#B9A3D6', '#6B757C'];
const SVC_TYPES = ['Oil Change', 'Tires', 'Brakes', 'Fluids', 'Filters', 'Cooling System', 'Engine', 'Drivetrain', 'Electrical', 'Battery', 'Suspension', 'Diagnostic', 'Inspection', 'Project / Mod', 'Other'];
const GRADES = ['87', '89', '91', '93', 'E85', 'Diesel'];
const TAGS = ['Leak', 'Noise', 'Smell', 'Tires', 'Electrical', 'Fluids', 'Trip'];

const UI = {moreSpecs: false, mxView: 'due', projGroup: 'phase', projCat: 'All', showDone: false, range: '6m', draft: null, draftVid: null};
let ROUTE = {view: 'home'};
/* Wide screens (laptop, monitor, iPad landscape) get the desktop Fleet Overview + Workbench (desktop.js).
   Anything narrower, including an upright iPad, keeps the phone layout. */
const WIDE_MQ = window.matchMedia('(min-width: 1024px)');
const isWide = () => WIDE_MQ.matches;

/* ---------- router ---------- */
function parseRoute() {
  const p = location.hash.replace(/^#\/?/, '').split('/');
  if (p[0] === 'v' && V(p[1])) {
    let tab = ['log', 'mx', 'projects', 'stats', 'specs'].includes(p[2]) ? p[2] : (isWide() ? deskDefaultTab(p[1]) : 'log');
    if (tab === 'specs' && !isWide()) { tab = 'mx'; UI.mxView = 'specs'; }            // desktop-only tab → the phone's MX › Specs view
    return {view: 'vehicle', vid: p[1], tab};
  }
  return {view: 'home'};
}
const go = h => { if (location.hash === h) render(); else location.hash = h; };
window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });

function render() {
  ROUTE = parseRoute();
  const app = $('#app'), wide = isWide();
  document.body.classList.toggle('wide', wide);
  if (wide) app.innerHTML = ROUTE.view === 'home' ? renderFleet() : renderBench(ROUTE.vid, ROUTE.tab);
  else app.innerHTML = ROUTE.view === 'home' ? renderHome() : renderVehicle(ROUTE.vid, ROUTE.tab);
  paintSync();
  if ($('#dOdo')) wireDraft();
  if (wide) deskAfterRender();
}

/* ---------- toast + sheet ---------- */
let _toastT;
function toast(msg, action) {
  const t = $('#toast'); clearTimeout(_toastT);
  t.textContent = msg; t.classList.toggle('has-action', !!action);
  if (action) {
    const b = document.createElement('button'); b.className = 'toast-act'; b.textContent = action.label;
    b.onclick = () => { t.classList.remove('on', 'has-action'); action.run(); }; t.appendChild(b);
  }
  t.classList.add('on'); _toastT = setTimeout(() => t.classList.remove('on', 'has-action'), action ? 4500 : 2200);
}
const hideActionToast = () => { const t = $('#toast'); if (t.classList.contains('has-action')) t.classList.remove('on', 'has-action'); };
/** A save was blocked: double tick + message. */
function warn(msg) { Haptics.error(); toast(msg); }
function openSheet(title, body, mount) {
  $('#sheetBody').innerHTML = `<div class="sheet-inner"><div class="grab-zone"><div class="grab"></div><div class="sh"><h2 class="h2" id="sheetTitle">${esc(title)}</h2>${isWide() ? `<button class="sheet-x" data-act="closeSheet" aria-label="Close">${IC.x}</button>` : ''}</div></div><div class="stack">${body}</div></div>`;
  $('#sheet').setAttribute('aria-labelledby', 'sheetTitle');
  $('#scrim').classList.add('open'); $('#sheet').classList.add('open'); $('#sheet').scrollTop = 0;
  if (mount) mount($('#sheet'));
}
function closeSheet() { $('#scrim').classList.remove('open'); $('#sheet').classList.remove('open'); hideActionToast(); }
const sv = (sel) => { const el = $(sel, $('#sheet')); return el ? el.value.trim() : ''; };

/* ============================================================
   HOME
   ============================================================ */
function vehicleChips(vid) {
  const m = mxSummary(vid);
  const watches = projOf(vid).filter(p => p.watch && p.status !== 'Done').length;
  const out = [];
  if (m.overdue) out.push(`<span class="chip red">${IC.alert.replace('18', '12').replace('18', '12')} ${m.overdue} MX overdue</span>`);
  if (m.soon) out.push(`<span class="chip amber">${m.soon} MX due soon</span>`);
  if (watches) out.push(`<span class="chip amber">${watches} watch item${watches > 1 ? 's' : ''}</span>`);
  if (!out.length && m.none) out.push(`<span class="chip grey">${m.none} MX need baseline</span>`);
  if (!out.length) out.push(`<span class="chip steel">All clear</span>`);
  return out.join('');
}
/* Plate / VIN badge on the home cards. Tapping it copies the value (and doesn't open the vehicle). */
const idBadge = (val, label, cls = '') => val ? `<span class="plate copyable ${cls}" data-act="copyId" data-v="${esc(val)}" data-l="${label}" role="button" aria-label="Copy ${label} ${esc(val)}">${cls.includes('vin') ? '<span class="tag">VIN</span>' : ''}${esc(val)}</span>` : '';
async function copyText(t) {
  try { await navigator.clipboard.writeText(t); return true; } catch (e) {
    const ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0;top:0';
    document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, t.length);
    let ok = false; try { ok = document.execCommand('copy'); } catch (_) {} ta.remove(); return ok;
  }
}

function renderHome() {
  const vs = [...DATA.vehicles].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const head = `<div class="home-top"><div><div class="kicker">The Garage</div><div class="count">${vs.length} vehicle${vs.length === 1 ? '' : 's'}</div></div>
    <div style="display:flex;gap:8px"><button class="icon-btn" data-act="settings" aria-label="Sync and settings"><span class="sync-dot"></span><span class="sync-txt"></span></button>
    <button class="icon-btn" data-act="settings" aria-label="Settings">${IC.gear}</button></div></div>`;
  if (!vs.length) return `<div class="home wrap">${head}
    <div class="empty">No vehicles yet. Register one, or connect your data repo in Settings to restore your garage.</div>
    <button class="dashed" data-act="addVehicle">${IC.plus} REGISTER VEHICLE</button>
    <button class="btn2" data-act="settings">Connect data repo</button></div>`;
  const [first, ...rest] = vs;
  const odo = currentOdo(first.id), fills = logsOf(first.id).filter(l => l.fuel).sort(cmpDateDesc);
  const mpg = fuelSeries(first.id); const avg = mpg.length ? mpg.reduce((a, x) => a + x.mpg, 0) / mpg.length : null;
  const big = `<button class="vcard" data-act="openV" data-vid="${first.id}">
    <div class="hero">${PHOTOS[first.id] ? `<img src="${PHOTOS[first.id]}" alt="">` : IC.car}</div>
    <div class="body"><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start">
      <div style="min-width:0"><div class="nm">${esc(vName(first))}</div><div class="sub">${esc(vSub(first))}</div>${idBadge(first.vin, 'VIN', 'vin')}</div>${idBadge(first.plate, 'Plate')}</div>
      <div class="kv3"><div><div class="lbl">Odometer</div><div class="v">${fmtMi(odo)}</div></div>
        <div><div class="lbl">Last fill</div><div class="v">${fills[0] ? fmtDate(fills[0].date) : '—'}</div></div>
        <div><div class="lbl">Avg MPG</div><div class="v">${avg ? avg.toFixed(1) : '—'}</div></div></div>
      <div class="chips">${vehicleChips(first.id)}</div></div></button>`;
  const rows = rest.map(v => `<button class="vrow" data-act="openV" data-vid="${v.id}">
    <div class="thumb">${PHOTOS[v.id] ? `<img src="${PHOTOS[v.id]}" alt="">` : IC.car.replace('64', '36').replace('40', '24')}</div>
    <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><div class="nm" style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(vName(v))}</div>${idBadge(v.plate, 'Plate')}</div>
      <div class="meta">${v.nickname ? esc(`${v.year || ''} ${v.make || ''} ${v.model || ''}`.trim()) + ' · ' : ''}${fmtMi(currentOdo(v.id))} mi</div>${idBadge(v.vin, 'VIN', 'vin')}
      <div class="chips">${vehicleChips(v.id)}</div></div>${IC.chev}</button>`).join('');
  return `<div class="home wrap">${head}${big}${rows}<button class="dashed" data-act="addVehicle">${IC.plus} REGISTER VEHICLE</button></div>`;
}

/* ============================================================
   VEHICLE SHELL
   ============================================================ */
function renderVehicle(vid, tab) {
  const v = V(vid), b = badgeCount(vid);
  const tabs = [['log', 'LOG'], ['mx', 'MX'], ['projects', 'PROJECTS'], ['stats', 'STATS']].map(([k, l]) =>
    `<a class="tab ${tab === k ? 'on' : ''}" href="#/v/${vid}/${k}" ${tab === k ? 'aria-current="page"' : ''}>${l}${k === 'mx' && b ? ` <span class="badge" aria-label="${b} due">${b}</span>` : ''}</a>`).join('');
  const body = {log: renderLog, mx: renderMx, projects: renderProjects, stats: renderStats}[tab](vid);
  return `<header class="vhead"><div class="row wrap"><a class="back" href="#/" aria-label="Back to garage">${IC.back}</a>
    <div class="t"><div class="nm">${esc(vName(v))}</div><div class="sub">${fmtMi(currentOdo(vid))} mi${v.plate ? ' · ' + esc(v.plate) : ''}</div></div>
    <button class="mini" data-act="editVehicle" data-vid="${vid}" aria-label="Edit vehicle">${PHOTOS[vid] ? `<img src="${PHOTOS[vid]}" alt="">` : ''}</button></div>
    <nav class="tabs wrap" aria-label="Vehicle sections">${tabs}</nav></header><main class="page wrap">${body}</main>`;
}

/* ============================================================
   LOG
   ============================================================ */
function newDraft(vid) {
  const lastFuel = logsOf(vid).filter(l => l.fuel).sort(cmpDateDesc)[0];
  return {date: today(), odo: '', fuelOn: true, grade: lastFuel ? lastFuel.fuel.grade : '87', ppg: '', gal: '', total: '', autoTotal: true, full: true,
    station: lastFuel ? lastFuel.fuel.station || '' : '', note: '', tags: [], projectId: null};
}
function logAlerts(vid) {
  const m = mxSummary(vid), out = [];
  projOf(vid).filter(p => p.watch && p.status !== 'Done').forEach(p => out.push(`<button class="alert red" data-act="editProject" data-id="${p.id}">
    <span style="color:var(--red-ink)">${IC.eye}</span><div><div class="a-t">Watch: ${esc(p.title)}</div>${p.notes ? `<div class="a-s">${esc(p.notes)}</div>` : ''}</div></button>`));
  if (m.overdue) out.push(`<a class="alert red" href="#/v/${vid}/mx" style="text-decoration:none;color:inherit"><span style="color:var(--red-ink)">${IC.alert}</span><div class="a-t" style="flex:1">${m.overdue} MX item${m.overdue > 1 ? 's' : ''} overdue</div>${IC.chev}</a>`);
  if (m.soon) out.push(`<a class="alert amber" href="#/v/${vid}/mx" style="text-decoration:none;color:inherit"><span style="color:var(--amber)">${IC.alert}</span><div class="a-t" style="flex:1">${m.soon} MX item${m.soon > 1 ? 's' : ''} due soon</div>${IC.chev}</a>`);
  if (m.none) out.push(`<a class="alert amber" href="#/v/${vid}/mx" style="text-decoration:none;color:inherit"><span style="color:var(--amber)">${IC.alert}</span><div style="flex:1"><div class="a-t">${m.none} schedule item${m.none > 1 ? 's have' : ' has'} no history</div><div class="a-s">Set a baseline so due dates can be tracked.</div></div>${IC.chev}</a>`);
  return out.length ? `<div style="display:flex;flex-direction:column;gap:8px">${out.join('')}</div>` : '';
}
function renderLog(vid) {
  const recent = logsOf(vid).sort(cmpDateDesc).slice(0, 10);
  return `${logAlerts(vid)}${logForm(vid)}
  <section style="display:flex;flex-direction:column;gap:8px"><div class="lbl">Recent</div>
    ${recent.length ? recent.map(l => entryRow(vid, l)).join('') : '<div class="empty">No entries yet.</div>'}</section>`;
}
/** The new-entry form (phone Log tab, and the desktop Workbench rail). */
function logForm(vid) {
  if (!UI.draft || UI.draftVid !== vid) { UI.draft = newDraft(vid); UI.draftVid = vid; }
  const d = UI.draft, last = lastLogged(vid);
  const watches = projOf(vid).filter(p => p.watch && p.status !== 'Done');
  const tags = [...new Set([...TAGS, ...d.tags])];
  return `<section class="card" aria-label="New entry">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
      <div style="font-family:var(--cond);font-weight:700;font-size:20px;letter-spacing:.06em">NEW ENTRY</div>
      <label class="sr" for="dDate">Date</label><input id="dDate" type="date" data-d="date" value="${d.date}" class="mono" style="background:transparent;border:none;color:var(--ink-dim);font-size:16px;text-align:right;min-height:36px">
    </div>
    <div class="field"><label class="lbl" for="dOdo">Odometer</label>
      <div class="odo"><input id="dOdo" class="fld" inputmode="numeric" data-d="odo" value="${esc(d.odo)}" placeholder="${last ? fmtMi(last.odo) : '0'}" autocomplete="off"><span class="mono muted">mi</span></div>
      <div class="help" id="dOdoHelp">${last ? `Last: ${fmtMi(last.odo)} mi on ${fmtDate(last.date)}` : 'First entry for this vehicle'}</div></div>
    <div class="sec">
      <div class="sec-h"><div class="ttl">${IC.fuel} FUEL</div><button class="switch" role="switch" aria-checked="${d.fuelOn}" aria-label="Fuel fill-up" data-act="dToggle" data-k="fuelOn"></button></div>
      <div id="fuelBox" class="${d.fuelOn ? '' : 'hidden'}" style="display:flex;flex-direction:column;gap:12px">
        <div class="pills" role="group" aria-label="Fuel grade">${GRADES.map(g => `<button class="pill ${d.grade === g ? 'on' : ''}" data-act="dGrade" data-g="${g}">${g}</button>`).join('')}</div>
        <div class="g2"><div class="field"><label class="lbl" for="dPpg">$ / Gallon</label><input id="dPpg" class="fld" inputmode="decimal" data-d="ppg" value="${esc(d.ppg)}" placeholder="0.000"></div>
          <div class="field"><label class="lbl" for="dGal">Gallons</label><input id="dGal" class="fld" inputmode="decimal" data-d="gal" value="${esc(d.gal)}" placeholder="0.000"></div></div>
        <div class="totalrow"><label class="lbl" for="dTotal">Total</label><input id="dTotal" class="mono" inputmode="decimal" data-d="total" value="${esc(d.total)}" placeholder="auto"
          style="background:transparent;border:none;color:var(--ink);font-size:20px;font-weight:600;text-align:right;width:140px;min-height:36px"></div>
        <div class="switchrow"><div>Filled to full<span class="s">Needed for accurate MPG</span></div><button class="switch" role="switch" aria-checked="${d.full}" aria-label="Filled to full" data-act="dToggle" data-k="full"></button></div>
        <div class="field"><label class="lbl" for="dStn">Station</label><input id="dStn" class="fld txt" data-d="station" value="${esc(d.station)}" placeholder="Optional"></div>
      </div>
    </div>
    <div class="sec">
      <div class="sec-h"><div class="ttl">${IC.pen} NOTE / OBSERVATION</div></div>
      <label class="sr" for="dNote">Note</label><textarea id="dNote" class="fld" data-d="note" placeholder="Anything worth remembering…">${esc(d.note)}</textarea>
      <div class="pills" role="group" aria-label="Tags">${tags.map(t => `<button class="pill sm ${d.tags.includes(t) ? 'on' : ''}" data-act="dTag" data-t="${esc(t)}">${esc(t)}</button>`).join('')}<button class="pill sm" data-act="dTagNew">+ Tag</button></div>
      ${watches.length ? `<div class="field"><div class="lbl">Attach to watch item</div><div class="pills">${watches.map(p => `<button class="pill sm ${d.projectId === p.id ? 'on' : ''}" data-act="dWatch" data-id="${p.id}">${esc(p.title)}</button>`).join('')}</div></div>` : ''}
    </div>
    <button class="btn" data-act="saveEntry">SAVE ENTRY</button>
  </section>`;
}
function entryRow(vid, l) {
  const d = parseD(l.date), f = l.fuel; const mp = f ? mpgFor(vid, l.id) : null;
  const title = f ? `Fuel · ${f.gal != null ? f.gal : '?'} gal · ${money(fuelCost(f))}` : (l.tags && l.tags.length ? l.tags.join(' · ') : 'Note');
  const proj = l.projectId && DATA.projects.find(p => p.id === l.projectId);
  return `<button class="entry" data-act="editEntry" data-id="${l.id}"><div class="date-chip">${d ? MON[d.getMonth()] + '<br>' + d.getDate() : '—'}</div>
    <div style="flex:1;min-width:0"><div class="t">${esc(title)}</div>
    <div class="s">${l.odo != null ? fmtMi(l.odo) + ' mi' : '—'}${mp ? ' · ' + mp.toFixed(1) + ' mpg' : ''}${f && !f.full ? ' · partial' : ''}${f && f.grade ? ' · ' + esc(f.grade) : ''}</div>
    ${l.note ? `<div class="n">${esc(l.note)}</div>` : ''}${proj ? `<div class="s" style="color:var(--red-ink)">↳ ${esc(proj.title)}</div>` : ''}</div></button>`;
}
function wireDraft() {
  const d = UI.draft;
  $$('[data-d]').forEach(el => el.addEventListener('input', () => {
    const k = el.dataset.d; d[k] = el.value;
    if (k === 'total') d.autoTotal = el.value === '';
    if (k === 'ppg' || k === 'gal' || k === 'total') recalcFuel(k);
    if (k === 'odo') {
      const last = lastLogged(UI.draftVid), n = num(d.odo), h = $('#dOdoHelp');
      if (h && last) h.textContent = n == null ? `Last: ${fmtMi(last.odo)} mi on ${fmtDate(last.date)}` :
        n < last.odo ? `⚠ Lower than last entry (${fmtMi(last.odo)})` : `+${fmtMi(n - last.odo)} mi since last entry`;
    }
  }));
}
function recalcFuel(changed) {
  const d = UI.draft, p = num(d.ppg), g = num(d.gal), t = num(d.total);
  if (changed !== 'total' && d.autoTotal && p != null && g != null) { d.total = (p * g).toFixed(2); $('#dTotal').value = d.total; }
  else if (changed !== 'gal' && !d.autoTotal && p && t != null && (d.gal === '' || d._autoGal)) { d.gal = (t / p).toFixed(3); d._autoGal = true; $('#dGal').value = d.gal; }
  if (changed === 'gal') d._autoGal = false;
}
function saveEntry() {
  const vid = ROUTE.vid, d = UI.draft, odo = num(d.odo), last = lastLogged(vid);
  const hasNote = d.note.trim() || d.tags.length;
  let fuel = null;
  if (d.fuelOn) {
    const ppg = num(d.ppg), gal = num(d.gal), total = num(d.total);
    if (ppg == null && gal == null && total == null) { if (!hasNote && odo == null) { warn('Nothing to save yet'); return; } }
    else {
      if (odo == null) { warn('Odometer is needed for a fill-up'); $('#dOdo').focus(); return; }
      fuel = {grade: d.grade, ppg, gal: gal != null ? gal : (total != null && ppg ? +(total / ppg).toFixed(3) : null),
        total: total != null ? total : (ppg != null && gal != null ? +(ppg * gal).toFixed(2) : null), full: d.full, station: d.station.trim()};
    }
  }
  if (!fuel && !hasNote && odo == null) { warn('Nothing to save yet'); return; }
  if (odo != null && last && odo < last.odo && (Haptics.error(), !confirm(`Odometer ${fmtMi(odo)} is lower than the last entry (${fmtMi(last.odo)}). Save anyway?`))) return;
  const entry = {id: uid('l'), vid, date: d.date || today(), odo, fuel, note: d.note.trim(), tags: [...d.tags], projectId: d.projectId};
  DATA.logs.push(entry); save();
  const mp = fuel ? mpgFor(vid, entry.id) : null;
  UI.draft = newDraft(vid); render(); Haptics.success();
  toast(mp ? `Saved · ${mp.toFixed(1)} mpg` : 'Entry saved');
}
function editEntry(id) {
  const l = DATA.logs.find(x => x.id === id); if (!l) return; const f = l.fuel || {};
  openSheet('Edit entry', `
    <div class="g2"><div class="field"><label class="lbl" for="eDate">Date</label><input id="eDate" type="date" class="fld" value="${l.date || ''}"></div>
      <div class="field"><label class="lbl" for="eOdo">Odometer</label><input id="eOdo" class="fld" inputmode="numeric" value="${l.odo ?? ''}"></div></div>
    <div class="switchrow"><div>Fuel fill-up</div><button class="switch" role="switch" id="eFuelOn" aria-checked="${!!l.fuel}" aria-label="Fuel fill-up" data-act="flip"></button></div>
    <div class="g2"><div class="field"><label class="lbl" for="eGrade">Grade</label><select id="eGrade" class="fld">${GRADES.map(g => `<option ${f.grade === g ? 'selected' : ''}>${g}</option>`).join('')}</select></div>
      <div class="field"><label class="lbl" for="ePpg">$ / Gallon</label><input id="ePpg" class="fld" inputmode="decimal" value="${f.ppg ?? ''}"></div></div>
    <div class="g2"><div class="field"><label class="lbl" for="eGal">Gallons</label><input id="eGal" class="fld" inputmode="decimal" value="${f.gal ?? ''}"></div>
      <div class="field"><label class="lbl" for="eTotal">Total $</label><input id="eTotal" class="fld" inputmode="decimal" value="${f.total ?? ''}"></div></div>
    <div class="switchrow"><div>Filled to full</div><button class="switch" role="switch" id="eFull" aria-checked="${f.full !== false}" aria-label="Filled to full" data-act="flip"></button></div>
    <div class="field"><label class="lbl" for="eStn">Station</label><input id="eStn" class="fld txt" value="${esc(f.station || '')}"></div>
    <div class="field"><label class="lbl" for="eNote">Note</label><textarea id="eNote" class="fld">${esc(l.note || '')}</textarea></div>
    <div class="field"><label class="lbl" for="eTags">Tags (comma separated)</label><input id="eTags" class="fld txt" value="${esc((l.tags || []).join(', '))}"></div>
    <button class="btn" data-act="saveEditEntry" data-id="${id}">SAVE</button>
    <button class="btn2 danger" data-act="delEntry" data-id="${id}">Delete entry</button>`);
}
function saveEditEntry(id) {
  const l = DATA.logs.find(x => x.id === id), sh = $('#sheet');
  l.date = sv('#eDate') || null; l.odo = num(sv('#eOdo')); l.note = sv('#eNote');
  l.tags = sv('#eTags').split(',').map(s => s.trim()).filter(Boolean);
  if ($('#eFuelOn', sh).getAttribute('aria-checked') === 'true') {
    const ppg = num(sv('#ePpg')), gal = num(sv('#eGal')), tot = num(sv('#eTotal'));
    l.fuel = {grade: sv('#eGrade'), ppg, gal, total: tot != null ? tot : (ppg != null && gal != null ? +(ppg * gal).toFixed(2) : null),
      full: $('#eFull', sh).getAttribute('aria-checked') === 'true', station: sv('#eStn')};
  } else l.fuel = null;
  save(); closeSheet(); render(); toast('Entry updated');
}

/* ============================================================
   MX
   ============================================================ */
function renderMx(vid) {
  const seg = `<div class="seg" role="tablist" aria-label="Maintenance views" style="grid-template-columns:repeat(4,minmax(0,1fr))">
    ${[['due', 'Due'], ['history', 'History'], ['tires', 'Tires'], ['specs', 'Specs']].map(([k, l]) => `<button role="tab" aria-selected="${UI.mxView === k}" class="${UI.mxView === k ? 'on' : ''}" data-act="mxView" data-k="${k}">${l}</button>`).join('')}</div>`;
  return seg + ({due: mxDue, history: mxHistory, tires: mxTires, specs: mxSpecs}[UI.mxView] || mxDue)(vid);
}
function dueCard(it, st) {
  const label = {overdue: 'OVERDUE', soon: 'DUE SOON', ok: 'OK', none: 'NO HISTORY'}[st.state];
  const color = {overdue: 'var(--red-hi)', soon: 'var(--amber)', ok: 'var(--steel)', none: 'var(--line-hi)'}[st.state];
  const right = st.state === 'none' ? intervalText(it) : dueText(st, it);
  return `<button class="due ${st.state === 'overdue' ? 'overdue' : st.state === 'soon' ? 'soon' : ''}" data-act="editSched" data-id="${it.id}">
    <div class="top"><span class="stat ${st.state}">${label}</span><span class="mono muted" style="font-size:12px;text-align:right">${esc(right)}</span></div>
    <div class="nm">${esc(it.name)}${it.action === 'inspect' ? ' <span class="faint" style="font-weight:400;font-size:13px">· inspect</span>' : ''}</div>
    ${st.state !== 'none' ? `<div class="bar"><div style="width:${Math.max(3, st.pct * 100)}%;background:${color}"></div></div>` : ''}
    <div class="src">${it.lastMi != null || it.lastDate ? `Last: ${it.lastMi != null ? fmtMi(it.lastMi) + ' mi' : ''}${it.lastMi != null && it.lastDate ? ' · ' : ''}${it.lastDate ? fmtDate(it.lastDate, true) : ''} · ` : ''}${esc(it.source || '')}</div></button>`;
}
function mxDue(vid) {
  const m = mxSummary(vid), v = V(vid);
  const order = {overdue: 0, soon: 1, ok: 2, none: 3};
  const items = [...m.items].sort((a, b) => order[a.st.state] - order[b.st.state] || (a.st.miLeft ?? 1e9) - (b.st.miLeft ?? 1e9));
  const docCards = m.docs.filter(d => d.state !== 'ok').map(d => `<button class="due ${d.state === 'overdue' ? 'overdue' : 'soon'}" ${d.kind === 'swap' ? `data-act="tireSwap" data-vid="${vid}" data-in="${d.setId}"` : `data-act="editDocs" data-vid="${vid}"`}>
    <div class="top"><span class="stat ${d.state}">${d.kind === 'swap' ? (d.state === 'overdue' ? 'SWAP DUE' : 'SWAP SOON') : d.state === 'overdue' ? 'EXPIRED' : 'DUE SOON'}</span><span class="mono muted" style="font-size:12px">${d.daysLeft < 0 ? -d.daysLeft + 'd ago' : 'in ' + d.daysLeft + 'd'}</span></div>
    <div class="nm">${esc(d.name)}</div><div class="src">${fmtDate(d.date, true)}</div></button>`);
  const active = items.filter(x => x.st.state !== 'none'), none = items.filter(x => x.st.state === 'none');
  const tsc = tireSched(vid), card = x => x.it === tsc && setOnCar(vid) ? tireDueCard(x.it, x.st) : dueCard(x.it, x.st);
  return `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><h2 class="h2">Due</h2>
      <div style="display:flex;gap:8px"><button class="btn2 sm" data-act="addSched" data-vid="${vid}">+ Item</button><button class="btn2 sm" data-act="addService" data-vid="${vid}">+ Log service</button></div></div>
    ${docCards.join('')}
    ${active.length ? active.map(card).join('') : (none.length ? '' : '<div class="empty">No schedule yet. Add items with intervals to track what\'s due.</div>')}
    ${none.length ? `<div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px"><div class="lbl">Needs baseline · ${none.length}</div>
      ${v.purchaseMi ? `<button class="btn2 sm" data-act="baselineAll" data-vid="${vid}">Start all at purchase</button>` : ''}</div>
      <div class="help">No record of when these were last done. Tap one to enter it, or start counting from purchase (${fmtMi(v.purchaseMi)} mi) if you don't know.</div>
      ${none.map(card).join('')}` : ''}`;
}
function mxHistory(vid) {
  const s = svcOf(vid).sort(cmpDateDesc);
  const total = s.reduce((a, x) => a + svcCost(x), 0);
  return `<div style="display:flex;justify-content:space-between;align-items:center"><h2 class="h2">History</h2><button class="btn2 sm" data-act="addService" data-vid="${vid}">+ Log service</button></div>
    ${s.length ? `<div class="help">${s.length} records · ${money(total)} logged</div>` + s.map(x => { const d = parseD(x.date); return `<button class="entry" data-act="editService" data-id="${x.id}">
      <div class="date-chip">${d ? MON[d.getMonth()] + '<br>' + d.getDate() + '<br><span class="faint">' + String(d.getFullYear()).slice(2) + '</span>' : '—'}</div>
      <div style="flex:1;min-width:0"><div style="display:flex;justify-content:space-between;gap:8px"><span class="t">${esc(x.title)}</span><span class="mono" style="font-size:14px">${svcCost(x) ? money(svcCost(x)) : ''}</span></div>
      <div class="s">${x.odo != null ? fmtMi(x.odo) + ' mi' : '— mi'}${x.doneBy ? ' · ' + esc(x.doneBy) : ''}${x.type ? ' · ' + esc(x.type) : ''}${x.hours ? ` · ${x.hours} h${isDIY(x.doneBy) && !x.projectId ? ' ≈ ' + money(x.hours * shopRate(), 0) + ' saved' : ''}` : ''}</div>${x.notes ? `<div class="n">${esc(x.notes)}</div>` : ''}</div></button>`; }).join('')
      : '<div class="empty">No service records yet.</div>'}`;
}
function kv(k, v, act, data = '', copy, src) {
  const long = (v && String(v).length > 26) || (src && String(src).length > 34);                 // long values get their own full-width line under the label
  return `<div class="kvrow ${long ? 'long' : ''}" style="padding-right:${copy ? 6 : 14}px"><button data-act="${act}" ${data} style="display:flex;justify-content:space-between;gap:12px;flex:1;min-width:0;text-align:left;min-height:28px;align-items:center">
    <span class="k">${esc(k)}</span><span class="v mono ${v ? '' : 'unset'}" style="${v ? '' : 'font-family:var(--sans)'}">${v ? esc(v) : 'Not set'}${src ? `<span class="faint" style="display:block;font-family:var(--sans);font-size:11px">${esc(src)}</span>` : ''}</span></button>
    ${copy && v ? `<button class="x" data-act="copy" data-v="${esc(v)}" aria-label="Copy ${esc(k)}">${IC.copy}</button>` : ''}</div>`;
}
function mxSpecs(vid) { return specVehicle(vid) + specRef(vid) + specDocs(vid); }
function specVehicle(vid) {
  const v = V(vid);
  return `<div style="display:flex;justify-content:space-between;align-items:center"><h2 class="h2">Vehicle</h2><button class="btn2 sm" data-act="editVehicle" data-vid="${vid}">Edit</button></div>
    <div class="list">${kv('Year / make / model', [v.year, v.make, v.model].filter(Boolean).join(' '), 'editVehicle', `data-vid="${vid}"`)}
      ${kv('Trim', v.trim, 'editVehicle', `data-vid="${vid}"`)}${kv('Transmission', v.transmission, 'editVehicle', `data-vid="${vid}"`)}
      ${kv('Plate', v.plate, 'editVehicle', `data-vid="${vid}"`, true)}${kv('VIN', v.vin, 'editVehicle', `data-vid="${vid}"`, true)}
      ${kv('Purchased', v.purchaseDate || v.purchaseMi ? `${v.purchaseDate ? fmtDate(v.purchaseDate, true) : ''}${v.purchaseMi ? ' · ' + fmtMi(v.purchaseMi) + ' mi' : ''}` : '', 'editVehicle', `data-vid="${vid}"`)}</div>`;
}
function specRef(vid) {
  const v = V(vid);
  return `<div style="display:flex;justify-content:space-between;align-items:center"><h2 class="h2">Specs &amp; reference</h2><button class="btn2 sm" data-act="editSpec" data-vid="${vid}" data-i="-1">+ Spec</button></div>
    ${specLists(vid, v)}`;
}
function specDocs(vid) {
  const d = V(vid).docs || {};
  return `<div style="display:flex;justify-content:space-between;align-items:center"><h2 class="h2">Documents</h2><button class="btn2 sm" data-act="editDocs" data-vid="${vid}">Edit</button></div>
    <div class="list">${kv('Insurer', d.insurer, 'editDocs', `data-vid="${vid}"`)}${kv('Policy number', d.policy, 'editDocs', `data-vid="${vid}"`, true)}
      ${kv('Insurance renews', d.insuranceRenews ? fmtDate(d.insuranceRenews, true) : '', 'editDocs', `data-vid="${vid}"`)}
      ${kv('Registration expires', d.registrationExpires ? fmtDate(d.registrationExpires, true) : '', 'editDocs', `data-vid="${vid}"`)}
      ${kv('Title number', d.title, 'editDocs', `data-vid="${vid}"`, true)}${d.notes ? kv('Notes', d.notes, 'editDocs', `data-vid="${vid}"`) : ''}</div>`;
}
function editSched(id, vid) {
  const it = id ? DATA.schedule.find(s => s.id === id) : {vid, name: '', everyMi: null, everyMo: null, action: 'replace', lastMi: null, lastDate: null, source: ''};
  const v = V(it.vid), odo = currentOdo(it.vid);
  openSheet(id ? 'Maintenance item' : 'New schedule item', `
    <div class="field"><label class="lbl" for="sName">Item</label><input id="sName" class="fld txt" value="${esc(it.name)}" placeholder="e.g. Oil & filter"></div>
    <div class="g3"><div class="field"><label class="lbl" for="sMi">Every mi</label><input id="sMi" class="fld" inputmode="numeric" value="${it.everyMi ?? ''}"></div>
      <div class="field"><label class="lbl" for="sMo">Every mo</label><input id="sMo" class="fld" inputmode="decimal" value="${it.everyMo ?? ''}"></div>
      <div class="field"><label class="lbl" for="sAct">Action</label><select id="sAct" class="fld"><option value="replace" ${it.action === 'replace' ? 'selected' : ''}>Replace</option><option value="inspect" ${it.action === 'inspect' ? 'selected' : ''}>Inspect</option></select></div></div>
    <div class="lbl" style="margin-top:4px">Last done</div>
    <div class="g2"><div class="field"><label class="lbl" for="sLMi">Odometer</label><input id="sLMi" class="fld" inputmode="numeric" value="${it.lastMi ?? ''}"></div>
      <div class="field"><label class="lbl" for="sLD">Date</label><input id="sLD" type="date" class="fld" value="${it.lastDate || ''}"></div></div>
    <div class="pills"><button class="pill sm" data-act="fillLast" data-mi="${odo ?? ''}" data-d="${today()}">Today · ${fmtMi(odo)} mi</button>
      ${v.purchaseMi ? `<button class="pill sm" data-act="fillLast" data-mi="${v.purchaseMi}" data-d="${v.purchaseDate || ''}">At purchase · ${fmtMi(v.purchaseMi)}</button>` : ''}
      <button class="pill sm" data-act="fillLast" data-mi="" data-d="">Clear</button></div>
    <div class="field"><label class="lbl" for="sSrc">Source / notes</label><input id="sSrc" class="fld txt" value="${esc(it.source || '')}"></div>
    <button class="btn" data-act="saveSched" data-id="${id || ''}" data-vid="${it.vid}">SAVE</button>
    ${id ? `<button class="btn2" data-act="addService" data-vid="${it.vid}" data-sched="${id}">Log this service now</button><button class="btn2 danger" data-act="delSched" data-id="${id}">Delete item</button>` : ''}`);
}
function saveSched(id, vid) {
  const name = sv('#sName'); if (!name) { warn('Name the item'); return; }
  let it = id && DATA.schedule.find(s => s.id === id);
  if (!it) { it = {id: uid('s'), vid}; DATA.schedule.push(it); }
  Object.assign(it, {name, everyMi: num(sv('#sMi')), everyMo: num(sv('#sMo')), action: sv('#sAct'), lastMi: num(sv('#sLMi')), lastDate: sv('#sLD') || null, source: sv('#sSrc')});
  save(); closeSheet(); render(); toast('Saved');
}
function editService(id, vid, schedId) {
  const s = id ? DATA.services.find(x => x.id === id) : {vid, date: today(), odo: currentOdo(vid), title: '', type: '', parts: null, labor: null, doneBy: 'DIY', notes: '', scheduleId: schedId || null};
  if (!id && schedId) { const it = DATA.schedule.find(x => x.id === schedId); s.title = it.name; s.type = /oil/i.test(it.name) ? 'Oil Change' : ''; }
  const sched = schedOf(s.vid);
  openSheet(id ? 'Service record' : 'Log service', `
    <div class="field"><label class="lbl" for="mTitle">Work done</label><input id="mTitle" class="fld txt" value="${esc(s.title)}" placeholder="e.g. Oil & filter"></div>
    <div class="g2"><div class="field"><label class="lbl" for="mDate">Date</label><input id="mDate" type="date" class="fld" value="${s.date || ''}"></div>
      <div class="field"><label class="lbl" for="mOdo">Odometer</label><input id="mOdo" class="fld" inputmode="numeric" value="${s.odo ?? ''}"></div></div>
    <div class="g2"><div class="field"><label class="lbl" for="mType">Type</label><select id="mType" class="fld"><option value="">—</option>${SVC_TYPES.map(t => `<option ${s.type === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
      <div class="field"><label class="lbl" for="mBy">Done by</label><select id="mBy" class="fld">${['DIY', 'Shop', 'Mobile Mechanic', 'Dealer'].map(t => `<option ${s.doneBy === t ? 'selected' : ''}>${t}</option>`).join('')}<option value="" ${!s.doneBy ? 'selected' : ''}>—</option></select></div></div>
    <div class="g3"><div class="field"><label class="lbl" for="mParts">Parts $</label><input id="mParts" class="fld" inputmode="decimal" value="${s.parts ?? ''}"></div>
      <div class="field"><label class="lbl" for="mLabor">Labor $</label><input id="mLabor" class="fld" inputmode="decimal" value="${s.labor ?? ''}"></div>
      <div class="field"><label class="lbl" for="mHours">Hours</label><input id="mHours" class="fld" inputmode="decimal" value="${s.hours ?? ''}" placeholder="0.0"></div></div>
    <div class="help" id="mSaveHelp">${hoursHelp(s.hours, s.doneBy)}</div>
    ${sched.length ? `<div class="field"><label class="lbl" for="mSched">Counts as schedule item</label><select id="mSched" class="fld"><option value="">None</option>${sched.map(it => `<option value="${it.id}" ${s.scheduleId === it.id ? 'selected' : ''}>${esc(it.name)}</option>`).join('')}</select>
      <div class="help">Resets that item's due countdown from this date and odometer.</div></div>` : ''}
    <div class="field"><label class="lbl" for="mNotes">Notes (parts used, part numbers…)</label><textarea id="mNotes" class="fld">${esc(s.notes || '')}</textarea></div>
    <button class="btn" data-act="saveService" data-id="${id || ''}" data-vid="${s.vid}">SAVE</button>
    ${id ? `<button class="btn2 danger" data-act="delService" data-id="${id}">Delete record</button>` : ''}`);
}
function saveService(id, vid) {
  const title = sv('#mTitle'); if (!title) { warn('Describe the work'); return; }
  let s = id && DATA.services.find(x => x.id === id);
  if (!s) { s = {id: uid('m'), vid, projectId: null}; DATA.services.push(s); }
  Object.assign(s, {title, date: sv('#mDate') || null, odo: num(sv('#mOdo')), type: sv('#mType'), doneBy: sv('#mBy'), parts: num(sv('#mParts')), labor: num(sv('#mLabor')), hours: num(sv('#mHours')),
    notes: sv('#mNotes'), scheduleId: $('#mSched', $('#sheet')) ? sv('#mSched') || null : s.scheduleId || null});
  let cleared = false;
  if (s.scheduleId) {
    const it = DATA.schedule.find(x => x.id === s.scheduleId);
    const before = it ? schedStatus(it, currentOdo(it.vid)).state : null;
    if (it && ((s.odo != null && (it.lastMi == null || s.odo >= it.lastMi)) || (s.date && (!it.lastDate || s.date >= it.lastDate)))) {
      if (s.odo != null) it.lastMi = s.odo; if (s.date) it.lastDate = s.date;
    }
    cleared = it && ['overdue', 'soon', 'none'].includes(before) && schedStatus(it, currentOdo(it.vid)).state === 'ok';
  }
  save(); closeSheet(); render();
  if (cleared) { Haptics.success(); toast(`Service logged · ${DATA.schedule.find(x => x.id === s.scheduleId).name} is current`); } else toast('Service logged');
}
function specLists(vid, v) {
  const all = (v.specs || []).map((s, i) => ({s, i}));
  if (!all.length) return '<div class="list"><div class="kvrow"><span class="k">No specs yet</span></div></div>';
  const row = x => kv(x.s[0], x.s[1], 'editSpec', `data-vid="${vid}" data-i="${x.i}"`, false, x.s[2]);
  const quick = all.filter(x => isQuick(x.s)).sort((a, b) => quickRank(a.s) - quickRank(b.s) || a.i - b.i);
  const rest = all.filter(x => !isQuick(x.s));
  const open = UI.moreSpecs;
  return `<div class="lbl" style="margin-bottom:-6px">Quick reference</div>
    <div class="list">${quick.map(row).join('') || '<div class="kvrow"><span class="k" style="max-width:none">Nothing pinned. Open a spec and turn on “Quick reference”.</span></div>'}</div>
    ${rest.length ? `<button class="more-toggle" data-act="toggleSpecs" aria-expanded="${open}" aria-controls="moreSpecs">
      <span>All other specs <span class="n">${rest.length}</span></span>${IC.chev}</button>
      <div id="moreSpecs" class="list ${open ? '' : 'hidden'}">${rest.map(row).join('')}</div>` : ''}`;
}
function editSpec(vid, i) {
  const v = V(vid), s = i >= 0 ? v.specs[i] : ['', ''];
  openSheet(i >= 0 ? 'Edit spec' : 'New spec', `
    <div class="field"><label class="lbl" for="pK">Label</label><input id="pK" class="fld txt" value="${esc(s[0])}" placeholder="e.g. Tire size"></div>
    <div class="field"><label class="lbl" for="pV">Value</label><input id="pV" class="fld txt" value="${esc(s[1])}" placeholder="e.g. 205/55R16 · 32 psi"></div>
    <div class="field"><label class="lbl" for="pS">Source</label><input id="pS" class="fld txt" value="${esc(s[2] || '')}" placeholder="Optional — e.g. FSM p. 2-14"></div>
    <div class="switchrow"><div>Show in Quick reference<span class="s">Off moves it under “All other specs”</span></div>
      <button class="switch" role="switch" id="pQ" aria-checked="${i >= 0 ? isQuick(s) : true}" aria-label="Show in Quick reference" data-act="flip"></button></div>
    <button class="btn" data-act="saveSpec" data-vid="${vid}" data-i="${i}">SAVE</button>
    ${i >= 0 ? `<button class="btn2 danger" data-act="delSpec" data-vid="${vid}" data-i="${i}">Delete spec</button>` : ''}`, sh => $('#pV', sh).focus());
}
function editDocs(vid) {
  const d = V(vid).docs || {};
  openSheet('Documents', `
    <div class="field"><label class="lbl" for="oIns">Insurer</label><input id="oIns" class="fld txt" value="${esc(d.insurer)}"></div>
    <div class="field"><label class="lbl" for="oPol">Policy number</label><input id="oPol" class="fld" value="${esc(d.policy)}"></div>
    <div class="g2"><div class="field"><label class="lbl" for="oInsD">Insurance renews</label><input id="oInsD" type="date" class="fld" value="${d.insuranceRenews || ''}"></div>
      <div class="field"><label class="lbl" for="oReg">Registration expires</label><input id="oReg" type="date" class="fld" value="${d.registrationExpires || ''}"></div></div>
    <div class="field"><label class="lbl" for="oTitle">Title number</label><input id="oTitle" class="fld" value="${esc(d.title)}"></div>
    <div class="field"><label class="lbl" for="oNotes">Notes</label><textarea id="oNotes" class="fld">${esc(d.notes)}</textarea></div>
    <button class="btn" data-act="saveDocs" data-vid="${vid}">SAVE</button>`);
}

/* ============================================================
   PROJECTS
   ============================================================ */

function projCard(p, group) {
  const parts = p.parts || [], tasks = p.tasks || [];
  const ph = parts.filter(x => x.have).length, td = tasks.filter(t => t.done).length;
  const cost = parts.reduce((a, x) => a + (x.cost || 0), 0);
  const tags = [p.category, group === 'phase' ? p.status : (normPhase(p.phase) ? phaseLabel(normPhase(p.phase)) : ''), p.watch ? 'Watch item' : ''].filter(Boolean);
  return `<button class="pcard ${p.priority === 'High' && p.status !== 'Done' ? 'hot' : ''}" data-act="editProject" data-id="${p.id}">
    <div class="top"><div class="ttl">${esc(p.title)}</div>${p.priority && p.priority !== 'Normal' ? `<span class="pri ${p.priority}">${p.priority.toUpperCase()}</span>` : ''}</div>
    <div class="chips" style="gap:6px">${tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
    ${p.notes ? `<div class="n">${esc(p.notes)}</div>` : ''}
    ${parts.length || tasks.length || p.hours ? `<div class="mono muted" style="font-size:12px">${[parts.length && `Parts ${ph}/${parts.length}${cost ? ' · ' + money(cost, 0) : ''}`, tasks.length && `Tasks ${td}/${tasks.length}`, p.hours && `${p.hours} h`].filter(Boolean).join(' · ')}</div>` : ''}</button>`;
}
function renderProjects(vid) {
  const all = projOf(vid), open = all.filter(p => p.status !== 'Done'), done = all.filter(p => p.status === 'Done');
  const cats = [...new Set(all.map(p => p.category).filter(Boolean))];
  const shown = open.filter(p => UI.projCat === 'All' || p.category === UI.projCat);
  const remaining = open.reduce((a, p) => a + (p.parts || []).filter(x => !x.have).reduce((b, x) => b + (x.cost || 0), 0), 0);
  let groups;
  if (UI.projGroup === 'phase') {
    groups = [...PHASES, null].map((n, i) => ({name: phaseLabel(n), color: PHASE_COLORS[i], always: n != null, items: shown.filter(p => normPhase(p.phase) === n)}));   // normPhase: any stray value lands in a group, never vanishes
  } else groups = STATUSES.filter(s => s !== 'Done').map(s => ({name: s, color: STATUS_COLOR[s], items: shown.filter(p => p.status === s)}));
  const byOrder = (a, b) => (a.priority === 'High' ? -1 : 0) - (b.priority === 'High' ? -1 : 0) || (a.order ?? 0) - (b.order ?? 0);
  return `<div style="display:flex;justify-content:space-between;align-items:center">
      <div><div style="font-family:var(--cond);font-weight:700;font-size:24px;letter-spacing:.04em">${open.length} open</div>
      <div class="mono muted" style="font-size:12px">${remaining ? 'Parts still to buy: ' + money(remaining, 0) : 'Add part costs to see the budget'}</div></div>
      <button class="btn-red-sm" data-act="editProject" data-vid="${vid}">+ NEW</button></div>
    <div class="seg" style="grid-template-columns:repeat(2,minmax(0,1fr))" role="group" aria-label="Group by">
      <button class="${UI.projGroup === 'phase' ? 'on' : ''}" data-act="projGroup" data-k="phase">By phase</button><button class="${UI.projGroup === 'status' ? 'on' : ''}" data-act="projGroup" data-k="status">By status</button></div>
    ${cats.length > 1 ? `<div class="pills" role="group" aria-label="Filter by category">${['All', ...cats].map(c => `<button class="pill sm ${UI.projCat === c ? 'on' : ''}" data-act="projCat" data-k="${esc(c)}">${esc(c)}</button>`).join('')}</div>` : ''}
    ${groups.filter(g => g.items.length || g.always).map(g => `<section style="display:flex;flex-direction:column;gap:10px"><h2 class="grp"><span class="dot" style="background:${g.color}"></span>${esc(g.name)} <span class="n">${g.items.length}</span></h2>
      ${g.items.length ? g.items.sort(byOrder).map(p => projCard(p, UI.projGroup)).join('') : `<div class="help faint" style="padding:0 2px 4px">Nothing here${UI.projCat !== 'All' ? ' in ' + esc(UI.projCat) : ''}.</div>`}</section>`).join('') || '<div class="empty">No open projects.</div>'}
    <button class="btn2" data-act="toggleDone" style="display:flex;justify-content:space-between;align-items:center;font-family:var(--cond);font-weight:600;letter-spacing:.1em;color:var(--ink-dim)">
      DONE · ${done.length}<span style="font-family:var(--sans);letter-spacing:0;font-size:13px">${UI.showDone ? 'Hide' : 'Show'}</span></button>
    ${UI.showDone ? done.sort((a, b) => (b.doneAt || '').localeCompare(a.doneAt || '')).map(p => projCard(p, 'phase')).join('') : ''}`;
}
let PDRAFT = null;
function editProject(id, vid) {
  const p = id ? DATA.projects.find(x => x.id === id) : {vid, title: '', category: 'Repair', phase: null, status: 'To Do', priority: 'Normal', notes: '', parts: [], tasks: [], watch: false};
  PDRAFT = JSON.parse(JSON.stringify(p));
  openSheet(id ? 'Project' : 'New project', `
    <div class="field"><label class="lbl" for="jTitle">Title</label><input id="jTitle" class="fld txt" value="${esc(p.title)}"></div>
    <div class="g2"><div class="field"><label class="lbl" for="jCat">Category</label><select id="jCat" class="fld">${[...new Set([...CATEGORIES, p.category].filter(Boolean))].map(c => `<option ${p.category === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div>
      <div class="field"><label class="lbl" for="jStatus">Status</label><select id="jStatus" class="fld">${STATUSES.map(s => `<option ${p.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div></div>
    <div class="g2"><div class="field"><label class="lbl" for="jPhase">Phase</label><select id="jPhase" class="fld"><option value="" ${!p.phase ? 'selected' : ''}>No phase</option>${PHASES.map(n => `<option value="${n}" ${p.phase === n ? 'selected' : ''}>Phase ${n}</option>`).join('')}</select></div>
      <div class="field"><label class="lbl" for="jPri">Priority</label><select id="jPri" class="fld">${['High', 'Normal', 'Low'].map(x => `<option ${p.priority === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div></div>
    <div class="field"><label class="lbl" for="jHours">Hours worked</label><input id="jHours" class="fld" inputmode="decimal" value="${p.hours ?? ''}" placeholder="0.0">
      <div class="help" id="jSaveHelp">${hoursHelp(p.hours)}</div></div>
    <div class="switchrow"><div>Watch item<span class="s">Shows on the Log page until done; notes can attach to it</span></div><button class="switch" role="switch" id="jWatch" aria-checked="${!!p.watch}" aria-label="Watch item" data-act="flip"></button></div>
    <div class="field"><label class="lbl" for="jNotes">Notes</label><textarea id="jNotes" class="fld">${esc(p.notes)}</textarea></div>
    <div class="lbl">Parts</div><div id="jParts" style="display:flex;flex-direction:column;gap:8px"></div>
    <button class="ghost-add" data-act="pAddPart">${IC.plus} Add part</button>
    <div class="lbl">Tasks</div><div id="jTasks" style="display:flex;flex-direction:column;gap:6px"></div>
    <button class="ghost-add" data-act="pAddTask">${IC.plus} Add task</button>
    ${id ? projectNotes(id) : ''}
    <button class="btn" data-act="saveProject" data-id="${id || ''}">SAVE</button>
    ${id && p.status !== 'Done' ? `<button class="btn2" data-act="finishProject" data-id="${id}">Mark done…</button>` : ''}
    ${id ? `<button class="btn2 danger" data-act="delProject" data-id="${id}">Delete project</button>` : ''}`, () => paintPDraft());
}
function projectNotes(id) {
  const l = DATA.logs.filter(x => x.projectId === id).sort(cmpDateDesc);
  if (!l.length) return '';
  return `<div class="lbl">Log notes · ${l.length}</div>` + l.map(x => `<div class="entry" style="cursor:default"><div class="date-chip">${x.date ? fmtDate(x.date) : '—'}</div><div class="grow"><div class="n" style="margin:0">${esc(x.note || x.tags.join(', '))}</div><div class="s">${x.odo != null ? fmtMi(x.odo) + ' mi' : ''}</div></div></div>`).join('');
}
const GRIP = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>';
const grip = (list, i, n, what) => `<span class="grip" role="button" tabindex="0" data-list="${list}" data-i="${i}" aria-label="${esc(what || list)}: press and hold to drag. Arrow keys move it; Delete removes it." aria-roledescription="drag handle" title="Press and hold to drag">${GRIP}</span>`;
function paintPDraft() {
  const pb = $('#jParts'), tb = $('#jTasks'); if (!pb) return;
  pb.innerHTML = PDRAFT.parts.map((x, i) => `<div class="swipe-row" data-list="parts" data-i="${i}">${SWIPE_BG}<div class="row-edit parts"><button class="box ${x.have ? 'on' : ''}" data-act="pPartHave" data-i="${i}" aria-label="Have this part" aria-pressed="${!!x.have}">${x.have ? IC.check : ''}</button>
    <input class="fld txt" data-pp="name" data-i="${i}" value="${esc(x.name)}" placeholder="Part" aria-label="Part name">
    <input class="fld" data-pp="cost" data-i="${i}" value="${x.cost ?? ''}" inputmode="decimal" placeholder="$" aria-label="Cost">
    ${grip('parts', i, PDRAFT.parts.length, x.name || 'part')}</div></div>`).join('');
  tb.innerHTML = PDRAFT.tasks.map((t, i) => `<div class="swipe-row" data-list="tasks" data-i="${i}">${SWIPE_BG}<div class="row-edit tasks"><button class="box ${t.done ? 'on' : ''}" data-act="pTaskDone" data-i="${i}" aria-label="Task done" aria-pressed="${!!t.done}">${t.done ? IC.check : ''}</button>
    <input class="fld txt" data-pt="t" data-i="${i}" value="${esc(t.t)}" placeholder="Task" aria-label="Task">
    ${grip('tasks', i, PDRAFT.tasks.length, t.t || 'task')}</div></div>`).join('');
  $$('[data-pp]', pb).forEach(el => el.oninput = () => { const x = PDRAFT.parts[+el.dataset.i]; x[el.dataset.pp] = el.dataset.pp === 'cost' ? num(el.value) : el.value; });
  $$('[data-pt]', tb).forEach(el => el.oninput = () => { PDRAFT.tasks[+el.dataset.i].t = el.value; });
  $$('.grip', pb).concat($$('.grip', tb)).forEach(wireGrip);
  $$('.swipe-row', pb).concat($$('.swipe-row', tb)).forEach(wireSwipe);
}
/* ---------- swipe left to delete (parts / tasks) ----------
   Drag a row right-to-left: a red Delete banner shows behind it. Past halfway the banner arms
   ("Release to delete", haptic tick). Release armed = delete (with Undo); otherwise it snaps back. */
const TRASH = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>';
const SWIPE_BG = `<div class="swipe-bg" aria-hidden="true"><span class="swipe-lbl">${TRASH} <b>Delete</b></span></div>`;
function removeItem(list, i) {
  const arr = PDRAFT[list]; if (!arr[i]) return;
  const [it] = arr.splice(i, 1); paintPDraft(); Haptics.success();
  const what = (list === 'tasks' ? it.t : it.name) || (list === 'tasks' ? 'Task' : 'Part');
  toast(`Deleted “${what.length > 24 ? what.slice(0, 23) + '…' : what}”`, {label: 'Undo', run: () => {
    if (!$('#sheet').classList.contains('open') || !PDRAFT) return;
    PDRAFT[list].splice(Math.min(i, PDRAFT[list].length), 0, it); paintPDraft();
  }});
}
function wireSwipe(rowWrap) {
  const fg = rowWrap.querySelector('.row-edit'), bg = rowWrap.querySelector('.swipe-bg'), lbl = bg.querySelector('b');
  const list = rowWrap.dataset.list, i = +rowWrap.dataset.i;
  let x0 = null, y0 = 0, dx = 0, mode = null, armed = false, w = 0, justSwiped = false;
  rowWrap.addEventListener('click', e => { if (justSwiped) { e.stopPropagation(); e.preventDefault(); } }, true);   // a swipe that ends on the checkbox must not toggle it
  rowWrap.addEventListener('pointerdown', e => {
    if (e.button > 0 || $('.sorting')) return;          // a quick sideways move on the handle is a swipe; a hold is a reorder
    x0 = e.clientX; y0 = e.clientY; dx = 0; mode = null; armed = false; w = rowWrap.offsetWidth;
  });
  rowWrap.addEventListener('pointermove', e => {
    if (x0 == null) return;
    const mx = e.clientX - x0, my = e.clientY - y0;
    if (!mode) {
      if (Math.abs(mx) < 10 && Math.abs(my) < 10) return;
      mode = (!$('.sorting') && mx < 0 && Math.abs(mx) > Math.abs(my) * 1.2) ? 'swipe' : 'none';      // left & mostly horizontal, not mid-reorder
      if (mode !== 'swipe') { x0 = null; return; }
      try { rowWrap.setPointerCapture(e.pointerId); } catch (_) {}
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      rowWrap.classList.add('swiping'); fg.style.transition = 'none';
    }
    dx = Math.min(0, mx);
    fg.style.transform = `translateX(${dx}px)`;
    const nowArmed = -dx > w * 0.5;
    if (nowArmed !== armed) {
      armed = nowArmed; rowWrap.classList.toggle('armed', armed);
      lbl.textContent = armed ? 'Release to delete' : 'Delete';
      if (armed) Haptics.threshold();
    }
  });
  const end = () => {
    if (x0 == null) return; x0 = null;
    if (mode !== 'swipe') return;
    justSwiped = true; setTimeout(() => { justSwiped = false; }, 350);
    fg.style.transition = '';
    if (armed) {
      fg.style.transform = `translateX(${-w - 20}px)`;
      rowWrap.style.height = rowWrap.offsetHeight + 'px';
      requestAnimationFrame(() => rowWrap.classList.add('collapsing'));
      setTimeout(() => removeItem(list, i), 220);
    } else {
      fg.style.transform = ''; rowWrap.classList.remove('swiping', 'armed'); lbl.textContent = 'Delete';
    }
  };
  rowWrap.addEventListener('pointerup', end); rowWrap.addEventListener('pointercancel', end);
}

/* ---------- press-and-hold to reorder (parts / tasks) ---------- */
function moveItem(list, from, to) {
  const arr = PDRAFT[list]; if (to < 0 || to >= arr.length || to === from) return false;
  const [it] = arr.splice(from, 1); arr.splice(to, 0, it); return true;
}
function wireGrip(g) {
  const list = g.dataset.list, i = +g.dataset.i;
  g.addEventListener('keydown', e => {                       // keyboard: arrow keys move the item, Delete removes it
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); removeItem(list, i); const ng = $(`.grip[data-list="${list}"][data-i="${Math.max(0, i - 1)}"]`); if (ng) ng.focus(); return; }
    const to = e.key === 'ArrowUp' ? i - 1 : e.key === 'ArrowDown' ? i + 1 : null;
    if (to == null) return; e.preventDefault();
    if (moveItem(list, i, to)) { paintPDraft(); const ng = $(`.grip[data-list="${list}"][data-i="${to}"]`); if (ng) ng.focus(); }
  });
  g.addEventListener('pointerdown', e => {
    if (e.button > 0) return;
    e.preventDefault();
    const sh = $('#sheet'), row = g.closest('.swipe-row'), box = row.parentElement;
    const startY = e.clientY, startX = e.clientX, startScroll = sh.scrollTop;
    let started = false, cur = i, rows, step;
    try { g.setPointerCapture(e.pointerId); } catch (_) {}
    const begin = () => {
      started = true; rows = $$('.swipe-row', box);
      step = rows.length > 1 ? rows[1].getBoundingClientRect().top - rows[0].getBoundingClientRect().top : row.offsetHeight + 8;
      row.classList.add('dragging'); box.classList.add('sorting');
      Haptics.tap();
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    };
    const timer = setTimeout(begin, e.pointerType === 'mouse' ? 120 : 260);   // the "hold"
    const move = ev => {
      if (!started) { if (Math.abs(ev.clientY - startY) > 10 || Math.abs(ev.clientX - startX) > 10) finish(false); return; }   // moved before the hold: not a reorder
      ev.preventDefault();
      const r = sh.getBoundingClientRect();                  // auto-scroll near the sheet edges
      if (ev.clientY < r.top + 70) sh.scrollTop -= 10; else if (ev.clientY > window.innerHeight - 70) sh.scrollTop += 10;
      const dy = ev.clientY - startY + (sh.scrollTop - startScroll);
      row.style.transform = `translateY(${dy}px)`;
      const nc = Math.max(0, Math.min(rows.length - 1, i + Math.round(dy / step)));
      if (nc !== cur) { cur = nc; Haptics.step(); }
      rows.forEach((rw, j) => {
        if (j === i) return;
        const s = (i < cur && j > i && j <= cur) ? -step : (i > cur && j < i && j >= cur) ? step : 0;
        rw.style.transform = s ? `translateY(${s}px)` : '';
      });
    };
    const finish = commit => {
      clearTimeout(timer);
      g.removeEventListener('pointermove', move); g.removeEventListener('pointerup', up); g.removeEventListener('pointercancel', cancel);
      if (!started) return;
      box.classList.remove('sorting');
      if (commit && moveItem(list, i, cur)) paintPDraft();
      else { rows.forEach(rw => rw.style.transform = ''); row.classList.remove('dragging'); }
    };
    const up = () => finish(true), cancel = () => finish(false);
    g.addEventListener('pointermove', move); g.addEventListener('pointerup', up); g.addEventListener('pointercancel', cancel);
  });
}
function collectProject() {
  const sh = $('#sheet');
  Object.assign(PDRAFT, {title: sv('#jTitle'), category: sv('#jCat'), status: sv('#jStatus'), phase: normPhase(sv('#jPhase')), priority: sv('#jPri'), notes: sv('#jNotes'), hours: num(sv('#jHours')),
    watch: $('#jWatch', sh).getAttribute('aria-checked') === 'true'});
  PDRAFT.parts = PDRAFT.parts.filter(x => (x.name || '').trim()); PDRAFT.tasks = PDRAFT.tasks.filter(t => (t.t || '').trim());
  return PDRAFT;
}
function saveProject(id) {
  const d = collectProject(); if (!d.title) { warn('Give it a title'); return null; }
  let p = id && DATA.projects.find(x => x.id === id);
  if (!p) { p = {id: uid('p'), createdAt: today(), doneAt: null, order: DATA.projects.length}; DATA.projects.push(p); }
  Object.assign(p, d, {id: p.id});
  if (p.status === 'Done' && !p.doneAt) p.doneAt = today();
  if (p.status !== 'Done') p.doneAt = null;
  save(); return p;
}
function finishProject(id) {
  const p = saveProject(id); if (!p) return;
  p.status = 'Done'; p.doneAt = today(); p.watch = false;
  const cost = (p.parts || []).reduce((a, x) => a + (x.cost || 0), 0);
  if (confirm(`Mark "${p.title}" done.\n\nAlso add it to MX history${cost ? ` with ${money(cost)} in parts` : ''}?`)) {
    DATA.services.push({id: uid('m'), vid: p.vid, date: today(), odo: currentOdo(p.vid), title: p.title, type: p.category === 'Repair' ? 'Other' : 'Project / Mod',
      parts: cost || null, labor: null, doneBy: 'DIY', notes: [p.notes, (p.parts || []).map(x => x.name).join(', ')].filter(Boolean).join(' · '), scheduleId: null, projectId: p.id});
  }
  save(); closeSheet(); render(); Haptics.success(); toast('Project done');
}

/* ============================================================
   STATS
   ============================================================ */
function mpgChart(pts) {
  if (pts.length < 2) return `<div class="empty">${pts.length ? 'One more full-tank fill-up to start the trend.' : 'MPG appears after two full-tank fill-ups.'}</div>`;
  const W = 358, H = 170, L = 28, R = 10, T = 16, B = 26;
  const ys = pts.map(p => p.mpg), avg = ys.reduce((a, b) => a + b, 0) / ys.length;
  let lo = Math.floor(Math.min(...ys) - 1), hi = Math.ceil(Math.max(...ys) + 1); if (hi - lo < 4) { lo -= 1; hi += 1; }
  const X = i => L + (i / (pts.length - 1)) * (W - L - R), Y = v => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  const grid = [lo, (lo + hi) / 2, hi].map(v => `<line x1="${L}" y1="${Y(v)}" x2="${W - R}" y2="${Y(v)}" stroke="#2C3236"/><text x="0" y="${Y(v) + 4}" fill="#A3AAAF" font-family="JetBrains Mono, monospace" font-size="10">${Math.round(v)}</text>`).join('');
  const line = pts.map((p, i) => `${X(i).toFixed(1)},${Y(p.mpg).toFixed(1)}`).join(' ');
  const dots = pts.map((p, i) => i === pts.length - 1 ? `<circle cx="${X(i)}" cy="${Y(p.mpg)}" r="5" fill="#F0675C"/>` : `<circle cx="${X(i)}" cy="${Y(p.mpg)}" r="3.5" fill="#121416" stroke="#F0675C" stroke-width="2"/>`).join('');
  const lab = (p, x, a) => p.date ? `<text x="${x}" y="${H - 6}" text-anchor="${a}" fill="#A3AAAF" font-family="JetBrains Mono, monospace" font-size="10">${MON[parseD(p.date).getMonth()]} ${parseD(p.date).getDate()}</text>` : '';
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="MPG across ${pts.length} fill-ups, average ${avg.toFixed(1)}">${grid}
    <line x1="${L}" y1="${Y(avg)}" x2="${W - R}" y2="${Y(avg)}" stroke="#7FA7BD" stroke-dasharray="4 4"/><text x="${L + 4}" y="${Y(avg) - 6}" text-anchor="start" fill="#7FA7BD" font-family="JetBrains Mono, monospace" font-size="10">avg ${avg.toFixed(1)}</text>
    <polyline points="${line}" fill="none" stroke="#F0675C" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>${dots}${lab(pts[0], L, 'start')}${lab(pts[pts.length - 1], W - R, 'end')}</svg>`;
}
function spendChart(months) {
  const have = Object.keys(months).sort();
  if (!have.length) return '<div class="empty">No dated spending in this range.</div>';
  // consecutive months (empty ones included) up to this month, at most 12, starting no earlier than the first spending
  const keys = []; const d = new Date(); d.setDate(1);
  for (let i = 0; i < 12; i++) { const k = toISO(d).slice(0, 7); if (k < have[0]) break; keys.unshift(k); d.setMonth(d.getMonth() - 1); }
  keys.forEach(k => { months[k] = months[k] || {fuel: 0, mx: 0, proj: 0}; });
  if (!keys.length) return '<div class="empty">No dated spending in this range.</div>';
  const W = 358, H = 180, B = 26, T = 18, gap = 8, n = keys.length, bw = Math.min(40, (W - gap * (n + 1)) / n);
  const max = Math.max(...keys.map(k => months[k].fuel + months[k].mx + months[k].proj)) || 1;
  const sc = v => (v / max) * (H - B - T);
  const startX = (W - (n * bw + (n - 1) * gap)) / 2;
  const bars = keys.map((k, i) => {
    const m = months[k], x = startX + i * (bw + gap); let y = H - B; let s = '';
    [['fuel', '#7FA7BD'], ['mx', '#E0A445'], ['proj', '#C2302B']].forEach(([f, c]) => { const h = sc(m[f]); if (h > 0) { y -= h; s += `<rect x="${x}" y="${y}" width="${bw}" height="${Math.max(1, h - 1)}" rx="2" fill="${c}"/>`; } });
    const tot = m.fuel + m.mx + m.proj;
    return s + `<text x="${x + bw / 2}" y="${H - 8}" text-anchor="middle" fill="${i === n - 1 ? '#E8E4DE' : '#A3AAAF'}" font-family="JetBrains Mono, monospace" font-size="10">${MON[+k.slice(5) - 1]}</text>` +
      (tot === max ? `<text x="${x + bw / 2}" y="${y - 5}" text-anchor="middle" fill="#E8E4DE" font-family="JetBrains Mono, monospace" font-size="10">${money(tot, 0)}</text>` : '');
  }).join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Monthly spend, stacked by fuel, maintenance and projects"><line x1="8" y1="${H - B}" x2="${W - 8}" y2="${H - B}" stroke="#343B40"/>${bars}</svg>`;
}
function renderStats(vid) {
  const s = stats(vid, UI.range);
  const ranges = [['30d', '30D'], ['90d', '90D'], ['6m', '6M'], ['1y', '1Y'], ['all', 'ALL']];
  const delta = s.avgMpg && s.prevAvg ? s.avgMpg - s.prevAvg : null;
  const best = s.mpg.length ? Math.max(...s.mpg.map(x => x.mpg)) : null, worst = s.mpg.length ? Math.min(...s.mpg.map(x => x.mpg)) : null;
  const maxPm = Math.max(s.fuelPerMile || 0, s.mxPerMile || 0, s.projPerMile || 0) || 1;
  const hb = (k, v, c) => `<div class="hbar"><span class="k">${k}</span><div class="t"><div style="width:${v ? Math.max(3, v / maxPm * 100) : 0}%;background:${c}"></div></div><span class="v">${v != null ? money(v) : '—'}</span></div>`;
  return `<div class="seg" style="grid-template-columns:repeat(5,minmax(0,1fr))" role="group" aria-label="Time range">${ranges.map(([k, l]) => `<button class="${UI.range === k ? 'on' : ''}" data-act="range" data-k="${k}">${l}</button>`).join('')}</div>
    <div class="kpis">
      <div class="kpi"><span class="lbl">Avg MPG</span><span class="v">${s.avgMpg ? s.avgMpg.toFixed(1) : '—'}</span><span class="s" style="${delta ? `color:${delta >= 0 ? 'var(--steel)' : 'var(--amber)'}` : ''}">${delta ? `${delta >= 0 ? '▲' : '▼'} ${Math.abs(delta).toFixed(1)} vs prior` : s.mpg.length + ' full tanks'}</span></div>
      <div class="kpi"><span class="lbl">Cost / mile</span><span class="v">${s.perMile != null ? money(s.perMile) : '—'}</span><span class="s">all-in</span></div>
      <div class="kpi"><span class="lbl">Miles driven</span><span class="v">${fmtMi(s.miles)}</span><span class="s">${s.milesPerMonth ? '~' + fmtMi(s.milesPerMonth) + ' / month' : '&nbsp;'}</span></div>
      <div class="kpi"><span class="lbl">Total spent</span><span class="v">${money(s.total, 0)}</span><span class="s">fuel + MX + projects</span></div></div>
    <div class="panel"><div style="display:flex;justify-content:space-between;align-items:baseline"><h2 class="h2">MPG trend</h2><span class="mono muted" style="font-size:12px">full tanks only</span></div>
      ${mpgChart(s.mpg)}
      <div class="g3" style="padding-top:6px;border-top:1px solid var(--line-lo)"><div><div class="lbl">Best tank</div><div class="mono">${best ? best.toFixed(1) : '—'}</div></div>
        <div><div class="lbl">Worst tank</div><div class="mono">${worst ? worst.toFixed(1) : '—'}</div></div><div><div class="lbl">Avg $/gal</div><div class="mono">${s.ppg ? money(s.ppg, 3) : '—'}</div></div></div></div>
    <div class="panel"><h2 class="h2">Monthly spend</h2>
      <div class="legend"><span><i style="background:#7FA7BD"></i>Fuel ${money(s.fuelSpend, 0)}</span><span><i style="background:#E0A445"></i>MX ${money(s.mxSpend, 0)}</span><span><i style="background:#C2302B"></i>Projects ${money(s.projSpend, 0)}</span></div>
      ${spendChart(s.months)}</div>
    <div class="panel"><h2 class="h2">Cost per mile</h2>${hb('Fuel', s.fuelPerMile, '#7FA7BD')}${hb('MX', s.mxPerMile, '#E0A445')}${hb('Projects', s.projPerMile, '#C2302B')}
      <div style="display:flex;justify-content:space-between;padding-top:8px;border-top:1px solid var(--line-lo)"><span class="lbl">${fmtMi(s.miles)} mi · ${s.fills} fill-ups · ${s.gal ? s.gal.toFixed(1) : 0} gal</span><span class="mono" style="font-weight:600">${s.perMile != null ? money(s.perMile) : '—'}</span></div></div>
    ${diyPanel(s)}`;
}
/** DIY labor: hours you worked, priced at the shop rate from Settings. */
function diyPanel(s) {
  const jobs = [...s.diy].sort((a, b) => b.saved - a.saved);
  return `<div class="panel" aria-label="DIY labor saved"><div style="display:flex;justify-content:space-between;align-items:baseline"><h2 class="h2">DIY labor saved</h2><button class="mono muted" style="font-size:12px" data-act="settings">at ${money(shopRate(), 0)}/h ›</button></div>
    ${jobs.length ? `<div style="display:flex;align-items:baseline;gap:12px"><span class="mono" style="font-size:28px;font-weight:600;color:var(--steel)">${money(s.diySaved, 0)}</span>
      <span class="muted" style="font-size:13px">${+s.diyHours.toFixed(2)} h · ${jobs.length} job${jobs.length === 1 ? '' : 's'}</span></div>
      ${jobs.slice(0, 5).map(j => `<button class="hbar" data-act="${j.kind === 'svc' ? 'editService' : 'editProject'}" data-id="${j.id}" style="text-align:left;width:100%"><span class="k" style="width:auto;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(j.title)}${j.open ? ' <span class="faint">(in progress)</span>' : ''}</span><span class="mono muted" style="font-size:12px">${j.hours} h</span><span class="v" style="width:64px">${money(j.saved, 0)}</span></button>`).join('')}`
    : `<div class="help">Log hours on a DIY service record or a project and this shows what a shop would have charged for that labor.</div>`}</div>`;
}
const hoursHelp = (h, by) => num(h) > 0 && isDIY(by) ? `≈ ${money(num(h) * shopRate(), 0)} in shop labor saved at ${money(shopRate(), 0)}/h` : `Your time on it. DIY hours × ${money(shopRate(), 0)}/h shop rate = labor saved.`;

/* ============================================================
   VEHICLE REGISTER / EDIT
   ============================================================ */
let NEWPHOTO = null;
function editVehicle(vid) {
  const v = vid ? V(vid) : {nickname: '', year: '', make: '', model: '', trim: '', transmission: '', plate: '', vin: '', status: 'Active', purchaseDate: '', purchaseMi: null};
  NEWPHOTO = null;
  openSheet(vid ? 'Edit vehicle' : 'Register vehicle', `
    <label class="photo-pick"><span id="vPhotoPrev" style="display:contents">${vid && PHOTOS[vid] ? `<img src="${PHOTOS[vid]}" alt="">` : `${IC.cam} Add hero photo`}</span>
      <input id="vPhoto" type="file" accept="image/*" class="sr"></label>
    <div class="field"><label class="lbl" for="vNick">Name / nickname</label><input id="vNick" class="fld txt" value="${esc(v.nickname)}" placeholder="e.g. Rocinante"></div>
    <div class="g3"><div class="field"><label class="lbl" for="vYear">Year</label><input id="vYear" class="fld" inputmode="numeric" value="${v.year ?? ''}"></div>
      <div class="field"><label class="lbl" for="vMake">Make</label><input id="vMake" class="fld txt" value="${esc(v.make)}"></div>
      <div class="field"><label class="lbl" for="vModel">Model</label><input id="vModel" class="fld txt" value="${esc(v.model)}"></div></div>
    <div class="g2"><div class="field"><label class="lbl" for="vTrim">Trim</label><input id="vTrim" class="fld txt" value="${esc(v.trim)}"></div>
      <div class="field"><label class="lbl" for="vTrans">Transmission</label><input id="vTrans" class="fld txt" value="${esc(v.transmission)}" placeholder="e.g. 5-speed manual"></div></div>
    <div class="g2"><div class="field"><label class="lbl" for="vPlate">Plate</label><input id="vPlate" class="fld" value="${esc(v.plate)}" autocapitalize="characters"></div>
      <div class="field"><label class="lbl" for="vStatus">Status</label><select id="vStatus" class="fld">${['Active', 'Project', 'Stored', 'Sold'].map(s => `<option ${v.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div></div>
    <div class="field"><label class="lbl" for="vVin">VIN</label><input id="vVin" class="fld" value="${esc(v.vin)}" autocapitalize="characters" style="font-size:16px"></div>
    <div class="g2"><div class="field"><label class="lbl" for="vPD">Purchase date</label><input id="vPD" type="date" class="fld" value="${v.purchaseDate || ''}"></div>
      <div class="field"><label class="lbl" for="vPM">Purchase mi</label><input id="vPM" class="fld" inputmode="numeric" value="${v.purchaseMi ?? ''}"></div></div>
    ${vid ? '' : `<div class="field"><label class="lbl" for="vOdo">Current odometer</label><input id="vOdo" class="fld" inputmode="numeric"></div>`}
    <button class="btn" data-act="saveVehicle" data-vid="${vid || ''}">SAVE</button>
    ${vid ? `<div class="g2"><button class="btn2" data-act="moveVehicle" data-vid="${vid}">Make main card</button><button class="btn2 danger" data-act="delVehicle" data-vid="${vid}">Delete vehicle</button></div>` : ''}`,
    sh => { $('#vPhoto', sh).onchange = async e => { const f = e.target.files[0]; if (!f) return; try { NEWPHOTO = await shrinkImage(f); $('#vPhotoPrev', sh).innerHTML = `<img src="${NEWPHOTO}" alt="">`; } catch (er) { toast('Could not read that image'); } }; });
}
function saveVehicle(vid) {
  const nick = sv('#vNick'), model = sv('#vModel'); if (!nick && !model) { warn('Add a name or model'); return; }
  let v = vid && V(vid);
  if (!v) { v = {id: uid('v'), specs: [['Engine oil', ''], ['Oil filter', ''], ['Tire size', ''], ['Wipers (D / P)', '']], docs: {}, order: DATA.vehicles.length, photo: null}; DATA.vehicles.push(v); }
  Object.assign(v, {nickname: nick, year: num(sv('#vYear')), make: sv('#vMake'), model, trim: sv('#vTrim'), transmission: sv('#vTrans'), plate: sv('#vPlate').toUpperCase(),
    vin: sv('#vVin').toUpperCase(), status: sv('#vStatus'), purchaseDate: sv('#vPD'), purchaseMi: num(sv('#vPM'))});
  if (!vid) {
    const odo = num(sv('#vOdo')) ?? v.purchaseMi;
    if (odo != null) DATA.logs.push({id: uid('l'), vid: v.id, date: today(), odo, fuel: null, note: 'Registered in The Garage. Baseline odometer.', tags: ['Baseline'], projectId: null});
    DATA.schedule.push({id: uid('s'), vid: v.id, name: 'Oil & filter', everyMi: 5000, everyMo: 6, action: 'replace', lastMi: null, lastDate: null, source: 'Default — edit to match the manual'});
  }
  if (NEWPHOTO) { PHOTOS[v.id] = NEWPHOTO; v.photo = `photos/${v.id}.jpg`; SYNC.photoDirty.push(v.id); savePhotos(); }
  save(); closeSheet(); if (!vid) go(`#/v/${v.id}/log`); else render(); toast(vid ? 'Vehicle updated' : 'Vehicle registered');
}

/* ============================================================
   SETTINGS
   ============================================================ */
function openSettings() {
  const c = Cloud.connected();
  openSheet('Settings', `
    <div class="lbl">Cloud sync · private GitHub repo</div>
    ${c ? `<div class="list"><div class="kvrow"><span class="k">Repo</span><span class="v mono">${esc(SYNC.owner)}/${esc(SYNC.repo)}</span></div>
        <div class="kvrow"><span class="k">Status</span><span class="v" style="display:flex;gap:8px;align-items:center"><span class="sync-dot"></span><span class="sync-txt"></span></span></div></div>
      <div class="g2"><button class="btn2" data-act="syncNow">Sync now</button><button class="btn2" data-act="pullNow">Pull from repo</button></div>
      <div class="g2"><button class="btn2" data-act="copySnap">Copy Claude snapshot</button><button class="btn2" data-act="copyToken">Copy sync token</button></div>
      <div class="help">Copy the token to connect another device: paste it there under Settings → Token. Anyone with it can read and change your garage data, so only paste it into The Garage.</div>
      ${(DATA.patchLog || []).length ? `<div class="lbl" style="margin-top:4px">Updates from Claude</div><div class="list">${DATA.patchLog.slice(0, 8).map(x => `<div class="kvrow" style="flex-direction:column;align-items:flex-start;gap:2px">
        <span style="font-size:14px">${esc(x.note || 'Update')}</span><span class="mono faint" style="font-size:12px">${x.appliedAt ? fmtDate(x.appliedAt.slice(0, 10), true) : ''} · ${x.ok} change${x.ok === 1 ? '' : 's'}${x.skipped && x.skipped.length ? ` · ${x.skipped.length} skipped` : ''}</span></div>`).join('')}</div>` : ''}
      <button class="btn2 danger" data-act="disconnect">Disconnect</button>`
    : `<p class="help">Backs up everything to <code>garage-data.json</code> in a private repo, plus <code>snapshot.md</code> (a readable summary Claude can use) and your vehicle photos.
        Create a <b>fine-grained</b> token with access to <b>only that repo</b> and <b>Contents: Read and write</b>. The token stays on this device.</p>
      <div class="g2"><div class="field"><label class="lbl" for="cOwner">Owner</label><input id="cOwner" class="fld txt" value="${esc(SYNC.owner || 'hurtlocker')}" autocapitalize="none"></div>
        <div class="field"><label class="lbl" for="cRepo">Repo</label><input id="cRepo" class="fld txt" value="${esc(SYNC.repo || 'garage-data')}" autocapitalize="none"></div></div>
      <div class="field"><label class="lbl" for="cTok">Token</label><input id="cTok" class="fld" type="password" autocomplete="off" placeholder="github_pat_…"></div>
      <button class="btn" data-act="connect">CONNECT</button>
      <a class="help" href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener" style="color:var(--red-ink)">Create a fine-grained token on GitHub ›</a>`}
    <div class="lbl" style="margin-top:8px">Alerts</div>
    <div class="g2"><div class="field"><label class="lbl" for="aMi">Due soon within mi</label><input id="aMi" class="fld" inputmode="numeric" value="${DATA.settings.dueSoonMi}"></div>
      <div class="field"><label class="lbl" for="aDays">…or days</label><input id="aDays" class="fld" inputmode="numeric" value="${DATA.settings.dueSoonDays}"></div></div>
    <button class="btn2" data-act="saveAlerts">Save alert thresholds</button>
    <div class="lbl" style="margin-top:8px">DIY savings</div>
    <div class="field"><label class="lbl" for="aRate">Shop labor rate, $ / hour</label><input id="aRate" class="fld" inputmode="decimal" value="${shopRate()}">
      <div class="help">Default ${money(SHOP_RATE_DEFAULT, 0)}: Ohio average for independent shops (Tekmetric, June 2026). Dealers run higher. Use a local quote if you have one.</div></div>
    <button class="btn2" data-act="saveRate">Save shop rate</button>
    ${HAPTICS_SHELVED ? '' : `<div class="lbl" style="margin-top:8px">This device</div>
    <div class="switchrow"><div>Haptic feedback<span class="s">Ticks when you cross a line or finish something. On iPhone this is a light system tick.</span></div>
      <button class="switch" role="switch" id="hapOn" aria-checked="${Haptics.enabled()}" aria-label="Haptic feedback" data-act="toggleHaptics"></button></div>`}
    <div class="lbl" style="margin-top:8px">Backup file</div>
    <div class="g2"><button class="btn2" data-act="exportJSON">Export JSON</button><button class="btn2" data-act="importJSON">Import JSON</button></div>
    <button class="btn2" data-act="updateApp">Check for app update</button>
    <p class="help faint" style="text-align:center">The Garage v${APP_VERSION}</p>`);
  paintSync();
}
async function doConnect() {
  const tok = sv('#cTok'), owner = sv('#cOwner'), repo = sv('#cRepo');
  if (!tok || !owner || !repo) { warn('Fill in owner, repo and token'); return; }
  const btn = $('[data-act=connect]', $('#sheet')); btn.disabled = true; btn.textContent = 'CONNECTING…';
  try {
    const {remote} = await Cloud.connect(tok, owner, repo);
    if (remote && (!DATA.vehicles.length || confirm('The repo already has Garage data.\n\nOK = load the repo copy onto this device (replaces local data)\nCancel = overwrite the repo with this device'))) {
      await Cloud.pull(); toast('Loaded from repo');
    } else { SYNC.dirty = true; SYNC.photoDirty = Object.keys(PHOTOS); await Cloud.push(); toast('Connected · synced'); }
    closeSheet(); render();
  } catch (e) { btn.disabled = false; btn.textContent = 'CONNECT'; toast(e.status === 401 ? 'Token rejected' : e.status === 403 ? 'Token lacks access to that repo' : (e.message || 'Connection failed')); }
}
function exportJSON() {
  const blob = new Blob([JSON.stringify({...DATA, photos: PHOTOS}, null, 2)], {type: 'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `garage-backup-${today()}.json`; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
function importJSON() {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'application/json,.json';
  inp.onchange = async () => {
    try {
      const d = JSON.parse(await inp.files[0].text());
      if (!d.vehicles) throw new Error('bad');
      if (DATA.vehicles.length && !confirm('Replace all data on this device with the file?')) return;
      if (d.photos) { PHOTOS = d.photos; SYNC.photoDirty = Object.keys(PHOTOS); await savePhotos(); }
      delete d.photos; DATA = Object.assign(EMPTY(), d); normalizeData(); save(); closeSheet(); go('#/'); toast('Imported');
    } catch (e) { toast('That file isn’t a Garage backup'); }
  };
  inp.click();
}

function flashCard(id) {
  const el = $(`.pcard[data-id="${id}"]`); if (!el) return;
  el.scrollIntoView({block: 'center', behavior: 'smooth'}); el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 1600);
}

/* ---------- sheet: pull down to dismiss ---------- */
(function sheetDrag() {
  const sh = $('#sheet'), scrim = $('#scrim');
  let y0 = null, dy = 0, dragging = false, samples = [], armed = false;
  const limit = () => Math.min(140, sh.offsetHeight * 0.25);
  sh.addEventListener('touchstart', e => {
    if (!sh.classList.contains('open') || e.touches.length > 1 || document.body.classList.contains('wide')) { y0 = null; return; }   // the desktop side panel doesn't pull down
    const onHandle = !!e.target.closest('.grab-zone');
    // From the body, only start a pull when the sheet is scrolled to the top and the finger isn't in a text box.
    if (e.target.closest('.grip, .swipe-row')) { y0 = null; return; }   // reorder handles and swipe rows own their touches
    if (!onHandle && (sh.scrollTop > 0 || e.target.closest('textarea, select'))) { y0 = null; return; }
    y0 = e.touches[0].clientY; dy = 0; dragging = false; samples = []; armed = false;
  }, {passive: true});
  sh.addEventListener('touchmove', e => {
    if (y0 == null) return;
    const d = e.touches[0].clientY - y0;
    if (!dragging) {
      if (d > 8) { dragging = true; sh.style.transition = 'none'; scrim.style.transition = 'none'; if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); }
      else if (d < -8) { y0 = null; return; }      // upward: let the sheet scroll normally
      else return;
    }
    e.preventDefault();
    dy = Math.max(0, d - 8);
    const now = performance.now(); samples.push([now, dy]); while (samples.length > 2 && now - samples[0][0] > 120) samples.shift();
    sh.style.transform = `translateY(${dy}px)`;
    const nowArmed = dy > limit();
    if (nowArmed !== armed) { armed = nowArmed; sh.classList.toggle('will-close', armed); if (armed) Haptics.threshold(); }
    scrim.style.opacity = String(Math.max(0, 1 - dy / (sh.offsetHeight * 0.9)));
  }, {passive: false});
  const end = () => {
    if (y0 == null) return; y0 = null;
    if (!dragging) return; dragging = false;
    // release velocity over the last ~120 ms (a flick after a pause still counts)
    const s0 = samples[0], v = s0 ? (dy - s0[1]) / Math.max(16, performance.now() - s0[0]) : 0;   // px per ms
    sh.style.transition = ''; scrim.style.transition = ''; scrim.style.opacity = '';
    sh.classList.remove('will-close'); armed = false;
    if (dy > limit() || (v > 0.45 && dy > 24)) closeSheet();
    sh.style.transform = '';                                 // animates to closed (class) or back open
  };
  sh.addEventListener('touchend', end); sh.addEventListener('touchcancel', end);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && sh.classList.contains('open')) closeSheet(); });
})();

/* ============================================================
   ACTIONS (event delegation)
   ============================================================ */
const ACT = {
  closeSheet, settings: openSettings, addVehicle: () => editVehicle(null), openV: d => go(isWide() ? `#/v/${d.vid}/${deskDefaultTab(d.vid)}` : `#/v/${d.vid}/log`), goMx: d => go(`#/v/${d.vid}/mx`),
  editVehicle: d => editVehicle(d.vid), saveVehicle: d => saveVehicle(d.vid),
  moveVehicle: d => { const vs = [...DATA.vehicles].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)); const v = V(d.vid); vs.splice(vs.indexOf(v), 1); vs.unshift(v); vs.forEach((x, i) => x.order = i); save(); closeSheet(); toast('Now the main card'); },
  delVehicle: d => { const v = V(d.vid); if (!confirm(`Delete ${vName(v)} and all of its log, MX and project data? This can't be undone.`)) return;
    ['logs', 'schedule', 'services', 'projects'].forEach(k => DATA[k] = DATA[k].filter(x => x.vid !== d.vid)); DATA.vehicles = DATA.vehicles.filter(x => x.id !== d.vid);
    delete PHOTOS[d.vid]; savePhotos(); save(); closeSheet(); go('#/'); },
  flip: (d, el) => el.setAttribute('aria-checked', el.getAttribute('aria-checked') !== 'true'),
  copyId: async (d, el) => {
    const ok = await copyText(d.v);
    el.classList.remove('copied'); void el.offsetWidth; el.classList.add('copied');
    clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('copied'), 1300);
    toast(ok ? `${d.l} copied` : d.v);
  },
  copy: d => { navigator.clipboard && navigator.clipboard.writeText(d.v).then(() => toast('Copied'), () => toast(d.v)); },
  // log draft
  dToggle: (d, el) => { UI.draft[d.k] = !UI.draft[d.k]; el.setAttribute('aria-checked', UI.draft[d.k]); if (d.k === 'fuelOn') $('#fuelBox').classList.toggle('hidden', !UI.draft.fuelOn); },
  dGrade: (d, el) => { UI.draft.grade = d.g; $$('[data-act=dGrade]').forEach(b => b.classList.toggle('on', b === el)); },
  dTag: (d, el) => { const t = UI.draft.tags, i = t.indexOf(d.t); i >= 0 ? t.splice(i, 1) : t.push(d.t); el.classList.toggle('on', i < 0); },
  dTagNew: () => { const t = (prompt('New tag') || '').trim(); if (t && !UI.draft.tags.includes(t)) { UI.draft.tags.push(t); render(); } },
  dWatch: (d, el) => { UI.draft.projectId = UI.draft.projectId === d.id ? null : d.id; $$('[data-act=dWatch]').forEach(b => b.classList.toggle('on', b.dataset.id === UI.draft.projectId)); },
  saveEntry, editEntry: d => editEntry(d.id), saveEditEntry: d => saveEditEntry(d.id),
  delEntry: d => { if (!confirm('Delete this entry?')) return; DATA.logs = DATA.logs.filter(x => x.id !== d.id); save(); closeSheet(); render(); },
  // mx
  mxView: d => { UI.mxView = d.k; render(); },
  editSched: d => editSched(d.id), addSched: d => editSched(null, d.vid), saveSched: d => saveSched(d.id, d.vid),
  delSched: d => { if (!confirm('Delete this schedule item?')) return; DATA.schedule = DATA.schedule.filter(x => x.id !== d.id); save(); closeSheet(); render(); },
  fillLast: d => { $('#sLMi', $('#sheet')).value = d.mi; $('#sLD', $('#sheet')).value = d.d; },
  baselineAll: d => { const v = V(d.vid); if (!confirm(`Start every item with no history at purchase (${fmtMi(v.purchaseMi)} mi${v.purchaseDate ? ', ' + fmtDate(v.purchaseDate, true) : ''})?\n\nOnly do this if you have no records — items past their interval at purchase won't show as overdue.`)) return;
    schedOf(d.vid).filter(it => it.lastMi == null && !it.lastDate).forEach(it => { it.lastMi = v.purchaseMi; it.lastDate = v.purchaseDate || null; it.source = (it.source ? it.source + ' · ' : '') + 'baseline = purchase'; }); save(); render(); },
  addService: d => editService(null, d.vid, d.sched), editService: d => editService(d.id), saveService: d => saveService(d.id, d.vid),
  delService: d => { if (!confirm('Delete this record?')) return; DATA.services = DATA.services.filter(x => x.id !== d.id); save(); closeSheet(); render(); },
  editSpec: d => editSpec(d.vid, +d.i),
  saveSpec: d => { const v = V(d.vid), k = sv('#pK'), val = sv('#pV'); if (!k) { warn('Add a label'); return; } const src = sv('#pS'); const q = $('#pQ', $('#sheet')).getAttribute('aria-checked') === 'true'; const row = [k, val, src, q]; v.specs = v.specs || []; if (+d.i >= 0) v.specs[+d.i] = row; else v.specs.push(row); save(); closeSheet(); render(); },
  delSpec: d => { V(d.vid).specs.splice(+d.i, 1); save(); closeSheet(); render(); },
  toggleSpecs: (d, el) => { UI.moreSpecs = !UI.moreSpecs; el.setAttribute('aria-expanded', UI.moreSpecs); $('#moreSpecs').classList.toggle('hidden', !UI.moreSpecs); },
  editDocs: d => editDocs(d.vid),
  saveDocs: d => { V(d.vid).docs = {insurer: sv('#oIns'), policy: sv('#oPol'), insuranceRenews: sv('#oInsD'), registrationExpires: sv('#oReg'), title: sv('#oTitle'), notes: sv('#oNotes')}; save(); closeSheet(); render(); toast('Saved'); },
  // projects
  projGroup: d => { UI.projGroup = d.k; render(); }, projCat: d => { UI.projCat = d.k; render(); }, toggleDone: () => { UI.showDone = !UI.showDone; render(); },
  editProject: d => editProject(d.id, d.vid || ROUTE.vid),
  saveProject: d => { const p = saveProject(d.id); if (!p) return; closeSheet();
    if (p.status !== 'Done' && UI.projCat !== 'All' && p.category !== UI.projCat) UI.projCat = 'All';   // never hide what was just saved
    if (p.status === 'Done') UI.showDone = true;
    render(); flashCard(p.id); toast('Saved'); },
  finishProject: d => finishProject(d.id),
  delProject: d => { if (!confirm('Delete this project?')) return; DATA.projects = DATA.projects.filter(x => x.id !== d.id); DATA.logs.forEach(l => { if (l.projectId === d.id) l.projectId = null; }); save(); closeSheet(); render(); },
  pAddPart: () => { collectProject(); PDRAFT.parts.push({name: '', cost: null, have: false, date: null}); paintPDraft(); const ins = $$('[data-pp=name]'); ins[ins.length - 1].focus(); },
  pAddTask: () => { collectProject(); PDRAFT.tasks.push({t: '', done: false}); paintPDraft(); const ins = $$('[data-pt=t]'); ins[ins.length - 1].focus(); },
  pPartHave: d => { const x = PDRAFT.parts[+d.i]; x.have = !x.have; if (x.have && !x.date) x.date = today(); if (x.have) Haptics.success(); paintPDraft(); },
  pTaskDone: d => { const t = PDRAFT.tasks[+d.i]; t.done = !t.done; if (t.done) Haptics.success(); paintPDraft(); },
  // stats
  range: d => { UI.range = d.k; render(); },
  // settings
  connect: doConnect, syncNow: async () => { await foregroundSync(); if (!LAST_INBOX) { SYNC.dirty = true; await Cloud.push(); } paintSync(); openSettings(); toast(_syncState === 'synced' ? 'Synced' : 'Sync failed'); },
  pullNow: async () => { if (!confirm('Replace all data on this device with the copy in your repo?')) return; try { await Cloud.pull(); closeSheet(); go('#/'); toast('Pulled from repo'); } catch (e) { toast(e.message); } },
  disconnect: () => { if (!confirm('Disconnect sync? Your repo is untouched; the token is removed from this device.')) return; Cloud.disconnect(); openSettings(); },
  copyToken: async () => { if (!SYNC.token) { toast('No token on this device'); return; } toast(await copyText(SYNC.token) ? 'Token copied · paste it on the other device' : 'Couldn’t copy the token'); },
  copySnap: () => navigator.clipboard.writeText(buildSnapshot()).then(() => toast('Snapshot copied')),
  saveRate: () => { const r = num(sv('#aRate')); if (!(r > 0)) { warn('Enter a rate in dollars per hour'); return; } DATA.settings.shopRate = r; save(); render(); toast(`Shop rate ${money(r, 0)}/h`); },
  saveAlerts: () => { DATA.settings.dueSoonMi = num(sv('#aMi')) ?? 500; DATA.settings.dueSoonDays = num(sv('#aDays')) ?? 30; save(); render(); toast('Saved'); },
  toggleHaptics: (d, el) => { const on = el.getAttribute('aria-checked') !== 'true'; Haptics.setEnabled(on); el.setAttribute('aria-checked', on); if (on) Haptics.tap(); },
  updateApp: async () => { toast('Checking…'); try { const r = SW_REG || await navigator.serviceWorker.getRegistration(); if (r) await r.update(); } catch (e) {} location.reload(); },
  exportJSON, importJSON,
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const fn = ACT[el.dataset.act]; if (!fn) return;
  e.preventDefault(); fn(el.dataset, el, e);
});
$('#scrim').addEventListener('click', closeSheet);
['input', 'change'].forEach(ev => document.addEventListener(ev, e => {      // live "≈ $ saved" under the hours fields
  const id = e.target.id;
  if (id === 'mHours' || id === 'mBy') { const h = $('#mSaveHelp'); if (h) h.textContent = hoursHelp(sv('#mHours'), sv('#mBy')); }
  if (id === 'jHours') { const h = $('#jSaveHelp'); if (h) h.textContent = hoursHelp(sv('#jHours')); }
}));
WIDE_MQ.addEventListener('change', () => render());     // window resized across 1024 px: switch layouts in place

/* ---------- boot ---------- */
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
/* Service worker: never let the browser's HTTP cache serve a stale copy of the SW script itself,
   and look for a new version every time the app comes back to the foreground. */
let SW_REG = null;
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('service-worker.js', {updateViaCache: 'none'}).then(r => { SW_REG = r; }).catch(() => {});
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // A new version took over while the app was open. Don't yank the screen mid-entry: offer it.
    if (hadController) toast('App updated', {label: 'Reload', run: () => location.reload()});
  });
}
const checkForAppUpdate = () => { if (SW_REG) SW_REG.update().catch(() => {}); };
(async () => {
  await load(); render();
  await foregroundSync();
  setInterval(paintSync, 30000);
})();
let _lastFg = 0;
async function foregroundSync() {
  _lastFg = Date.now(); checkForAppUpdate();
  const changed = await Cloud.reconcile().catch(() => false);
  if (changed && !$('#sheet').classList.contains('open')) render();
  if (LAST_INBOX) { toast(`Applied ${LAST_INBOX} update${LAST_INBOX > 1 ? 's' : ''} from Claude`); LAST_INBOX = 0; }
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && Date.now() - _lastFg > 10000) foregroundSync(); });
window.addEventListener('pageshow', e => { if (e.persisted && Date.now() - _lastFg > 10000) foregroundSync(); });
