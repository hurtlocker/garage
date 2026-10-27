"use strict";
/* ============================================================
   THE GARAGE — desktop layout (window ≥ 1024 px)
   Fleet Overview (home) and Workbench (vehicle). Same data, same edit sheets
   (shown as a right-hand side panel); only the arrangement changes.
   ============================================================ */
const VCOLORS = ['#F0675C', '#7FA7BD', '#E0A445', '#9BC4A4', '#B9A3D6', '#C9C4BD'];
const sortedVehicles = () => [...DATA.vehicles].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
const vColor = vid => VCOLORS[Math.max(0, sortedVehicles().findIndex(v => v.id === vid)) % VCOLORS.length];
const openProjects = vid => projOf(vid).filter(p => p.status !== 'Done');
/** Arriving at a vehicle on desktop: its project board, or MX if it has no open projects. */
const deskDefaultTab = vid => openProjects(vid).length ? 'projects' : 'mx';

const STATE_ORDER = {overdue: 0, soon: 1, ok: 2, none: 3};
const STATE_COLOR = {overdue: 'var(--red-hi)', soon: 'var(--amber)', ok: 'var(--steel)', none: 'var(--line-hi)'};
function nextMx(vid, n) {
  return mxSummary(vid).items.filter(x => x.st.state !== 'none')
    .sort((a, b) => STATE_ORDER[a.st.state] - STATE_ORDER[b.st.state] || b.st.pct - a.st.pct).slice(0, n);
}
function mxLine(x, vid) {
  const st = x.st, c = st.state === 'overdue' ? 'var(--red-ink)' : st.state === 'soon' ? 'var(--amber)' : 'var(--ink-dim)';
  return `<button class="d-mx" data-act="editSched" data-id="${x.it.id}"><span class="r"><span>${esc(x.it.name)}</span><span class="mono" style="color:${c}">${esc(dueText(st, x.it))}</span></span>
    <span class="bar"><span style="display:block;height:6px;width:${Math.max(3, st.pct * 100)}%;background:${STATE_COLOR[st.state]}"></span></span></button>`;
}

/** Logs and service records merged into one dated feed. */
function activity(vids, n) {
  const out = [];
  DATA.logs.filter(l => vids.includes(l.vid)).forEach(l => {
    const f = l.fuel;
    const text = [f ? `Fuel ${f.gal != null ? f.gal : '?'} gal · ${money(fuelCost(f))}${f.full ? '' : ' (partial)'}` : '', l.note || (!f && l.tags && l.tags.length ? l.tags.join(' · ') : '')].filter(Boolean).join(' · ') || 'Odometer';
    out.push({date: l.date, odo: l.odo, vid: l.vid, text, act: `data-act="editEntry" data-id="${l.id}"`});
  });
  DATA.services.filter(s => vids.includes(s.vid)).forEach(s => out.push({date: s.date, odo: s.odo, vid: s.vid,
    text: `${s.title}${svcCost(s) ? ' · ' + money(svcCost(s), 0) : ''}`, act: `data-act="editService" data-id="${s.id}"`, svc: true}));
  return out.sort(cmpDateDesc).slice(0, n);
}
const feedDate = d => d ? fmtDate(d, parseD(d).getFullYear() !== new Date().getFullYear()) : 'undated';

/** Critical alerts only: watch items, overdue MX, expired documents. */
function fleetAlerts(vs) {
  const out = [];
  vs.forEach(v => {
    projOf(v.id).filter(p => p.watch && p.status !== 'Done').forEach(p => out.push({lv: 'watch', label: 'WATCH', v, t: p.title, s: p.notes, act: `data-act="editProject" data-id="${p.id}"`}));
    const m = mxSummary(v.id);
    m.items.filter(x => x.st.state === 'overdue').forEach(x => out.push({lv: 'overdue', label: 'OVERDUE', v, t: x.it.name, s: dueText(x.st, x.it), act: `data-act="goMx" data-vid="${v.id}"`}));
    m.docs.filter(d => d.state === 'overdue').forEach(d => out.push({lv: 'overdue', label: 'EXPIRED', v, t: d.name, s: fmtDate(d.date, true), act: `data-act="editDocs" data-vid="${v.id}"`}));
  });
  return out;
}
const alertStrip = list => list.length ? `<section class="d-alerts" aria-label="Critical alerts">${list.map(a => `<button class="d-alert" ${a.act}>
  <span class="lv ${a.lv}">${a.label}</span><span style="min-width:0"><span class="t">${esc(vName(a.v))} · ${esc(a.t)}</span>${a.s ? `<span class="s">${esc(a.s)}</span>` : ''}</span></button>`).join('')}</section>` : '';

const topActions = () => `<button class="icon-btn" data-act="settings" aria-label="Sync and settings"><span class="sync-dot"></span><span class="sync-txt"></span></button>
  <button class="icon-btn" data-act="settings" aria-label="Settings">${IC.gear}</button>`;

/* ============================================================
   FLEET OVERVIEW (home)
   ============================================================ */
function renderFleet() {
  const vs = sortedVehicles();
  if (!vs.length) return `<div class="d-wrap"><div class="d-top"><div><div class="d-kicker">The Garage</div><div class="d-title">No vehicles yet</div></div><div class="d-actions">${topActions()}</div></div>
    <div class="empty">Register one, or connect your data repo in Settings to restore your garage.</div>
    <div class="d-actions"><button class="d-btn-red" data-act="addVehicle">+ Register vehicle</button><button class="btn2" data-act="settings">Connect data repo</button></div></div>`;
  const alerts = fleetAlerts(vs);
  const sp = vs.map(v => ({v, s: stats(v.id, 'all')})), maxSpend = Math.max(1, ...sp.map(x => x.s.total));
  const feed = activity(vs.map(v => v.id), 12);
  return `<div class="d-wrap">
    <header class="d-top"><div><div class="d-kicker">The Garage · Fleet</div>
      <h1 class="d-title">${vs.length} vehicle${vs.length === 1 ? '' : 's'}${alerts.length ? ` · <span style="color:var(--red-ink)">${alerts.length} alert${alerts.length === 1 ? '' : 's'}</span>` : ''}</h1></div>
      <div class="d-actions"><button class="btn2" data-act="addVehicle">+ Register vehicle</button>${topActions()}</div></header>
    ${alertStrip(alerts)}
    <section class="d-fleet" aria-label="Vehicles">${vs.map((v, i) => fleetCol(v, i === 0)).join('')}</section>
    <div class="d-grid2">
      <section class="d-panel" aria-label="Fleet activity"><div class="d-ph"><h2 class="h2">Fleet activity</h2><span class="lbl">Log + service · all vehicles</span></div>
        ${feed.length ? `<div class="d-feed">${feed.map(a => `<span class="dt">${feedDate(a.date)}</span><span style="color:${vColor(a.vid)};font-weight:600">${esc(vName(V(a.vid)))}</span>
          <button ${a.act}>${a.svc ? '<span class="tag" style="margin-right:6px">Service</span>' : ''}${esc(a.text)}${a.odo != null ? ` <span class="mono muted" style="font-size:12px">· ${fmtMi(a.odo)} mi</span>` : ''}</button>`).join('')}</div>` : '<div class="empty">Nothing logged yet.</div>'}</section>
      <section class="d-panel" aria-label="Spend since purchase"><div class="d-ph"><h2 class="h2">Spend · since purchase</h2><span class="lbl">Fuel · MX · Projects</span></div>
        ${sp.map(({v, s}) => `<div><div class="d-ph" style="font-size:14px"><span>${esc(vName(v))}</span><span class="mono">${money(s.total, 0)}${s.perMile ? ` <span class="muted" style="font-size:12px">· ${money(s.perMile)}/mi</span>` : ''}</span></div>
          <div class="d-stack" role="img" aria-label="${esc(vName(v))}: fuel ${money(s.fuelSpend, 0)}, MX ${money(s.mxSpend, 0)}, projects ${money(s.projSpend, 0)}">
          <span style="width:${s.fuelSpend / maxSpend * 100}%;background:#7FA7BD"></span><span style="width:${s.mxSpend / maxSpend * 100}%;background:#E0A445"></span><span style="width:${s.projSpend / maxSpend * 100}%;background:#C2302B"></span></div></div>`).join('')}
        <div class="legend"><span><i style="background:#7FA7BD"></i>Fuel</span><span><i style="background:#E0A445"></i>MX</span><span><i style="background:#C2302B"></i>Projects</span></div></section>
    </div></div>`;
}
function fleetCol(v, main) {
  const vid = v.id, s = stats(vid, 'all'), m = mxSummary(vid), mx = nextMx(vid, 3), feed = activity([vid], 3);
  return `<article class="d-vcol ${main ? 'main' : ''}">
    <button class="d-hero" data-act="openV" data-vid="${vid}" aria-label="Open ${esc(vName(v))}">${PHOTOS[vid] ? `<img src="${PHOTOS[vid]}" alt="">` : IC.car}</button>
    <div class="d-vbody">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start">
        <div style="min-width:0"><button class="d-name" data-act="openV" data-vid="${vid}">${esc(vName(v))}</button><div class="sub" style="font-size:14px;color:var(--ink-dim)">${esc(vSub(v))}</div></div>
        ${idBadge(v.plate, 'Plate')}</div>
      ${v.vin ? idBadge(v.vin, 'VIN', 'vin') : `<button class="d-addvin" data-act="editVehicle" data-vid="${vid}">+ Add VIN</button>`}
      <div class="chips">${vehicleChips(vid)}</div>
      <div class="d-kpis"><div><div class="lbl">Odo</div><div class="v">${fmtMi(currentOdo(vid))}</div></div>
        <div><div class="lbl">Avg MPG</div><div class="v">${s.avgMpg ? s.avgMpg.toFixed(1) : '—'}</div></div>
        <div><div class="lbl">$ / mi</div><div class="v">${s.perMile ? s.perMile.toFixed(2) : '—'}</div></div>
        <div><div class="lbl">Projects</div><div class="v">${openProjects(vid).length}</div></div></div>
      <div class="d-sec"><div class="lbl">Next MX</div>
        ${mx.length ? mx.map(x => mxLine(x, vid)).join('') : '<div class="help">No schedule with a baseline yet.</div>'}
        ${m.none ? `<button class="help" data-act="goMx" data-vid="${vid}" style="text-align:left;color:var(--amber)">${m.none} item${m.none === 1 ? ' needs' : 's need'} a baseline ›</button>` : ''}</div>
      <div class="d-sec"><div class="lbl">Recent</div>
        ${feed.length ? feed.map(a => `<button class="d-recent" ${a.act}><span class="mono muted">${feedDate(a.date)}</span> ${esc(a.text)}</button>`).join('') : '<div class="help">Nothing logged yet.</div>'}</div>
      <button class="btn2" data-act="openV" data-vid="${vid}" style="display:flex;justify-content:space-between;align-items:center">Open workbench ${IC.chev}</button>
    </div></article>`;
}

/* ============================================================
   WORKBENCH (vehicle)
   ============================================================ */
function renderBench(vid, tab) {
  const v = V(vid), b = badgeCount(vid), vs = sortedVehicles();
  const tabs = [['projects', 'Board'], ['mx', 'MX'], ['log', 'Log'], ['stats', 'Stats'], ['specs', 'Specs']].map(([k, l]) =>
    `<a class="${tab === k ? 'on' : ''}" href="#/v/${vid}/${k}" ${tab === k ? 'aria-current="page"' : ''}>${l}${k === 'mx' && b ? ` <span class="badge" aria-label="${b} due">${b}</span>` : ''}${k === 'projects' ? ` <span class="mono muted" style="font-size:12px;letter-spacing:0">${openProjects(vid).length}</span>` : ''}</a>`).join('');
  const sw = vs.map(x => { const t = tab === 'projects' && !openProjects(x.id).length ? 'mx' : tab;
    return `<a class="${x.id === vid ? 'on' : ''}" href="#/v/${x.id}/${t}" ${x.id === vid ? 'aria-current="page"' : ''}>${esc(vName(x))}${badgeCount(x.id) ? ` <span class="badge">${badgeCount(x.id)}</span>` : ''}</a>`; }).join('');
  const body = {projects: deskBoard, mx: deskMx, log: deskLog, stats: v2 => `<div class="d-stats">${renderStats(v2)}</div>`, specs: deskSpecs}[tab](vid);
  const alerts = logAlerts(vid);
  return `<div class="d-wrap">
    <header class="d-top">
      <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap">
        <a href="#/" class="d-home">The Garage <span style="color:var(--red-ink)">/</span></a>
        <nav class="d-switch" aria-label="Vehicle">${sw}</nav></div>
      <div class="d-actions">
        <span class="mono" style="font-size:15px">${fmtMi(currentOdo(vid))} <span class="muted">mi</span></span>${idBadge(v.plate, 'Plate')}${v.vin ? idBadge(v.vin, 'VIN', 'vin d-inline') : ''}
        <button class="d-mini" data-act="editVehicle" data-vid="${vid}" aria-label="Edit vehicle">${PHOTOS[vid] ? `<img src="${PHOTOS[vid]}" alt="">` : IC.pen}</button>${topActions()}</div>
    </header>
    ${alerts ? `<div class="d-valerts">${alerts}</div>` : ''}
    <div class="d-bench">
      <aside class="d-rail" aria-label="Quick entry and status">
        ${logForm(vid)}
        ${railUpNext(vid)}
        ${railSpend(vid)}
      </aside>
      <main class="d-main">
        <nav class="d-tabs" aria-label="Vehicle sections">${tabs}</nav>
        ${body}
      </main>
    </div></div>`;
}
function railUpNext(vid) {
  const mx = nextMx(vid, 4), others = sortedVehicles().filter(x => x.id !== vid)
    .flatMap(x => mxSummary(x.id).items.filter(i => i.st.state === 'overdue').map(i => ({v: x, i})));
  return `<section class="panel" aria-label="Up next"><div class="d-ph"><h2 class="h2">Up next</h2><a href="#/v/${vid}/mx" class="lbl" style="text-decoration:none">All MX ›</a></div>
    ${mx.length ? mx.map(x => mxLine(x, vid)).join('') : '<div class="help">Nothing scheduled with a baseline yet.</div>'}
    ${others.length ? `<div class="d-sec" style="gap:6px"><div class="lbl">Other vehicles</div>${others.map(o => `<a class="d-other" href="#/v/${o.v.id}/mx"><span>${esc(vName(o.v))} · ${esc(o.i.it.name)}</span><span class="mono" style="color:var(--red-ink)">${esc(dueText(o.i.st, o.i.it).split(' · ').pop())}</span></a>`).join('')}</div>` : ''}</section>`;
}
function railSpend(vid) {
  const s = stats(vid, 'all');
  return `<section class="panel" aria-label="Since purchase"><div class="d-ph"><h2 class="h2">Since purchase</h2><span class="lbl">${fmtMi(s.miles)} mi</span></div>
    <div class="g3"><div><div class="lbl">Fuel</div><div class="mono">${money(s.fuelSpend, 0)}</div></div><div><div class="lbl">MX</div><div class="mono">${money(s.mxSpend, 0)}</div></div>
      <div><div class="lbl">Projects</div><div class="mono">${money(s.projSpend, 0)}</div></div></div>
    <div class="d-ph" style="border-top:1px solid var(--line-lo);padding-top:8px"><span class="lbl">Total${s.perMile != null ? ' · ' + money(s.perMile) + '/mi' : ''}</span><span class="mono" style="font-weight:600">${money(s.total, 0)}</span></div></section>`;
}

/* ---------- Board: projects as columns (by phase or status), drag a card to move it ---------- */
function deskBoard(vid) {
  const all = projOf(vid), open = all.filter(p => p.status !== 'Done'), done = all.filter(p => p.status === 'Done');
  const cats = [...new Set(all.map(p => p.category).filter(Boolean))];
  const shown = open.filter(p => UI.projCat === 'All' || p.category === UI.projCat);
  const byPhase = UI.projGroup === 'phase';
  const cols = byPhase
    ? [...PHASES.map(n => ({key: String(n), name: phaseLabel(n), color: PHASE_COLORS[n - 1], items: shown.filter(p => normPhase(p.phase) === n)})),
       {key: '', name: 'No phase', color: PHASE_COLORS[5], items: shown.filter(p => normPhase(p.phase) == null)}].filter(c => c.key || c.items.length)
    : STATUSES.filter(s => s !== 'Done').map(s => ({key: s, name: s, color: STATUS_COLOR[s], items: shown.filter(p => p.status === s)}));
  const byOrder = (a, b) => (a.priority === 'High' ? -1 : 0) - (b.priority === 'High' ? -1 : 0) || (a.order ?? 0) - (b.order ?? 0);
  const remaining = open.reduce((a, p) => a + (p.parts || []).filter(x => !x.have).reduce((b, x) => b + (x.cost || 0), 0), 0);
  const card = p => projCard(p, UI.projGroup).replace('<button class="pcard', '<button draggable="true" class="pcard');
  return `<div class="d-ph" style="flex-wrap:wrap">
      <div style="display:flex;align-items:baseline;gap:14px"><span style="font-family:var(--cond);font-weight:700;font-size:24px;letter-spacing:.04em">${open.length} open</span>
        <span class="mono muted" style="font-size:12px">${remaining ? 'Parts still to buy: ' + money(remaining, 0) : ''}</span></div>
      <div class="d-actions">
        <div class="seg" style="grid-template-columns:repeat(2,minmax(0,1fr));min-width:240px" role="group" aria-label="Columns">
          <button class="${byPhase ? 'on' : ''}" data-act="projGroup" data-k="phase">By phase</button><button class="${byPhase ? '' : 'on'}" data-act="projGroup" data-k="status">By status</button></div>
        <button class="btn-red-sm" data-act="editProject" data-vid="${vid}">+ PROJECT</button></div></div>
    ${cats.length > 1 ? `<div class="pills" role="group" aria-label="Filter by category">${['All', ...cats].map(c => `<button class="pill sm ${UI.projCat === c ? 'on' : ''}" data-act="projCat" data-k="${esc(c)}">${esc(c)}</button>`).join('')}</div>` : ''}
    <div class="d-board" style="--cols:${cols.length}" aria-label="Project board. Drag a card to another column to move it.">
      ${cols.map(c => `<section class="d-col" data-drop="${esc(c.key)}" data-mode="${byPhase ? 'phase' : 'status'}" aria-label="${esc(c.name)}">
        <h3 class="d-colh" style="border-color:${c.color}"><span class="dot" style="background:${c.color}"></span>${esc(c.name)}<span class="n">${c.items.length}</span></h3>
        ${c.items.length ? c.items.sort(byOrder).map(card).join('') : `<div class="empty-col">${UI.projCat !== 'All' ? 'Nothing in ' + esc(UI.projCat) : 'Drop a project here'}</div>`}</section>`).join('')}
    </div>
    <button class="btn2" data-act="toggleDone" style="display:flex;justify-content:space-between;align-items:center;font-family:var(--cond);font-weight:600;letter-spacing:.1em;color:var(--ink-dim)">
      DONE · ${done.length}<span style="font-family:var(--sans);letter-spacing:0;font-size:13px">${UI.showDone ? 'Hide' : 'Show'}</span></button>
    ${UI.showDone && done.length ? `<div class="d-entries">${done.sort((a, b) => (b.doneAt || '').localeCompare(a.doneAt || '')).map(p => projCard(p, 'phase')).join('')}</div>` : ''}`;
}
function moveProject(id, mode, key) {
  const p = DATA.projects.find(x => x.id === id); if (!p) return;
  if (mode === 'phase') { const n = normPhase(key); if (normPhase(p.phase) === n) return; p.phase = n; }
  else { if (p.status === key) return; p.status = key; }
  save(); render(); flashCard(id);
  toast(`Moved to ${mode === 'phase' ? phaseLabel(normPhase(key)) : key}`);
}
function wireBoard() {
  let dragId = null;
  $$('.d-board .pcard').forEach(c => {
    c.addEventListener('dragstart', e => { dragId = c.dataset.id; e.dataTransfer.setData('text/plain', dragId); e.dataTransfer.effectAllowed = 'move'; requestAnimationFrame(() => c.classList.add('lifting')); });
    c.addEventListener('dragend', () => { c.classList.remove('lifting'); $$('.d-col.drop').forEach(x => x.classList.remove('drop')); dragId = null; });
  });
  $$('.d-col').forEach(col => {
    col.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; $$('.d-col.drop').forEach(x => x !== col && x.classList.remove('drop')); col.classList.add('drop'); });
    col.addEventListener('dragleave', e => { if (!col.contains(e.relatedTarget)) col.classList.remove('drop'); });
    col.addEventListener('drop', e => { e.preventDefault(); col.classList.remove('drop'); const id = e.dataTransfer.getData('text/plain') || dragId; if (id) moveProject(id, col.dataset.mode, col.dataset.drop); });
  });
}

/* ---------- MX, Log, Specs: the phone views side by side ---------- */
const deskMx = vid => `<div class="d-grid2"><div class="d-cstack">${mxDue(vid)}</div><div class="d-cstack">${mxHistory(vid)}</div></div>`;
function deskLog(vid) {
  const all = logsOf(vid).sort(cmpDateDesc);
  return `<div class="d-ph"><h2 class="h2">Log · ${all.length} entr${all.length === 1 ? 'y' : 'ies'}</h2><span class="help">New entries go in the form on the left.</span></div>
    ${all.length ? `<div class="d-entries">${all.map(l => entryRow(vid, l)).join('')}</div>` : '<div class="empty">No entries yet.</div>'}`;
}
const deskSpecs = vid => `<div class="d-grid2"><div class="d-cstack">${specRef(vid)}</div><div class="d-cstack">${specVehicle(vid)}${specDocs(vid)}</div></div>`;

function deskAfterRender() {
  if ($('.d-board')) wireBoard();
}
