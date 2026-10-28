"use strict";
/* ============================================================
   THE GARAGE — tire sets (MX › Tires)
   Each set has four lettered tires (A–D, E–H, …) with positions and tread readings.
   Rotations and seasonal swaps are logged as ordinary Tires service records, and the
   vehicle's "Tire rotation" schedule item follows whichever set is on the car.
   ============================================================ */
const ROT_PATTERNS = {
  cross: {name: 'Rearward cross', note: 'Fronts straight back, rears cross forward. For non-directional tires.', map: {LF: 'LR', RF: 'RR', LR: 'RF', RR: 'LF'}},
  fr: {name: 'Front ↔ rear', note: 'Same side only. Required for directional tires.', map: {LF: 'LR', RF: 'RR', LR: 'LF', RR: 'RF'}},
  none: {name: 'Tread check only', note: 'Record tread depth without moving the tires.', map: {LF: 'LF', RF: 'RF', LR: 'LR', RR: 'RR'}},
};
const defaultPattern = t => t.directional ? 'fr' : 'cross';
const POS_NAME = {LF: 'left front', RF: 'right front', LR: 'left rear', RR: 'right rear'};
const treadCls = d => d == null ? '' : d <= 2 ? 'worn' : d <= 4 ? 'low' : 'good';
const byPos = tires => [...tires].sort((a, b) => TIRE_POS.indexOf(a.pos) - TIRE_POS.indexOf(b.pos));
const tireSpecSize = vid => { const s = (V(vid).specs || []).find(x => /^tire size$/i.test(x[0])); return s && s[1] ? s[1].split(' · ')[0] : ''; };
const nextLetters = vid => { const n = tireSetsOf(vid).reduce((a, t) => a + (t.tires || []).length, 0); return [0, 1, 2, 3].map(i => String.fromCharCode(65 + ((n + i) % 26))); };

/** Top-down car with four tires. items: [{l, pos, sub, d}] */
function carDiagram(items, label) {
  return `<div class="tdiag" role="img" aria-label="${esc(label)}"><div class="tbody"></div><div class="tfront">FRONT ↑</div>
    ${items.map(t => `<div class="tire p-${t.pos} ${treadCls(t.d)}"><b>${esc(t.l)}</b><span>${esc(t.sub)}</span></div>`).join('')}</div>`;
}
const diagNow = t => carDiagram(byPos(t.tires).map(x => { const r = latestTread(x); return {l: x.l, pos: x.pos, sub: r ? r.d + '/32' : x.pos, d: r ? r.d : null}; }),
  'Tire positions: ' + byPos(t.tires).map(x => `${x.l} ${POS_NAME[x.pos]}`).join(', '));
function diagAfter(t, pat) {
  const m = ROT_PATTERNS[pat].map;
  const items = t.tires.map(x => ({l: x.l, pos: m[x.pos], sub: pat === 'none' ? x.pos : 'from ' + x.pos, d: null}));
  return carDiagram(items, 'After: ' + byPos(items).map(x => `${x.l} ${POS_NAME[x.pos]}`).join(', '));
}
const moveList = (t, pat) => byPos(t.tires).map(x => `<span>${esc(x.l)}  ${x.pos} → ${ROT_PATTERNS[pat].map[x.pos]}</span>`).join('');

/* ---------- MX › Tires ---------- */
function mxTires(vid) {
  const sets = [...tireSetsOf(vid)].sort((a, b) => (b.onCar ? 1 : 0) - (a.onCar ? 1 : 0));
  const sc = tireSched(vid);
  if (!sets.length) return `<div style="display:flex;justify-content:space-between;align-items:center"><h2 class="h2">Tire sets</h2></div>
    <div class="empty" style="display:flex;flex-direction:column;gap:12px;align-items:center">Track each set of tires: positions, tread depth, rotations and seasonal swaps.
      <button class="btn-red-sm" data-act="editTireSet" data-vid="${vid}">SET UP CURRENT TIRES</button></div>`;
  return `<div style="display:flex;justify-content:space-between;align-items:center"><h2 class="h2">Tire sets</h2><button class="btn2 sm" data-act="editTireSet" data-vid="${vid}">+ Set</button></div>
    ${sets.map(t => tireSetCard(t, sc)).join('')}
    <div class="help">Rotate every ${sc && sc.everyMi ? fmtMi(sc.everyMi) : '7,500'} mi per set · lugs 100 N·m (73.8 ft-lb) · see Specs for pressures</div>`;
}
function tireSetCard(t, sc) {
  const rot = setRotMi(t), every = sc && sc.everyMi, left = every ? every - rot : null, pct = every ? Math.min(1, rot / every) : 0;
  const color = left == null ? 'var(--steel)' : left < 0 ? 'var(--red-hi)' : left <= DATA.settings.dueSoonMi ? 'var(--amber)' : 'var(--steel)';
  const treads = t.tires.map(latestTread).filter(Boolean), minT = treads.length ? Math.min(...treads.map(r => r.d)) : null;
  const sub = [t.size, t.directional ? 'directional' : 'non-directional'].filter(Boolean).join(' · ');
  return `<section class="card tset ${t.onCar ? 'on' : ''}" data-set="${t.id}" aria-label="${esc(t.name)}${t.onCar ? ', on car' : ', stored'}">
    <button class="tset-h" data-act="editTireSet" data-id="${t.id}">
      <span style="display:flex;gap:8px;align-items:center"><span class="stat ${t.onCar ? 'oncar' : 'ok'}">${t.onCar ? 'ON CAR' : 'STORED'}</span><span class="nm">${esc(t.name)}</span></span>
      <span class="mono muted" style="font-size:12px">${esc(sub)}</span>
      ${t.brand || t.dot ? `<span style="font-size:13px;color:var(--ink-2)">${esc([t.brand, t.dot && 'DOT ' + t.dot].filter(Boolean).join(' · '))}</span>` : ''}</button>
    <div style="display:flex;gap:16px;align-items:center">${diagNow(t)}
      <div style="flex:1;display:flex;flex-direction:column;gap:10px;min-width:0">
        <div><div class="lbl">Since rotation</div><div class="mono" style="font-size:20px;font-weight:600">${fmtMi(rot)} mi</div>
          ${t.onCar && every ? `<div class="mono" style="font-size:12px;color:${left < 0 ? 'var(--red-ink)' : 'var(--ink-dim)'}">${left < 0 ? fmtMi(-left) + ' mi over' : 'next in ' + fmtMi(left) + ' mi'}</div>
          <div class="bar" style="margin-top:5px"><div style="width:${Math.max(3, pct * 100)}%;background:${color}"></div></div>` : ''}</div>
        <div><div class="lbl">Lowest tread</div><div class="${minT == null ? 'muted' : 'mono'}" style="font-size:${minT == null ? 13 : 15}px;color:${minT != null && minT <= 2 ? 'var(--red-ink)' : minT != null && minT <= 4 ? 'var(--amber)' : ''}">${minT == null ? 'Not measured yet' : minT + '/32"'}</div></div>
        ${t.onCar ? '' : `<div><div class="lbl">Stored</div><div style="font-size:14px">${t.storage ? esc(t.storage) : '<span class="muted">—</span>'}</div></div>`}
      </div></div>
    ${t.onCar ? `<div class="tmoves"><div class="lbl">Next: ${ROT_PATTERNS[defaultPattern(t)].name.toLowerCase()}</div><div class="mono">${moveList(t, defaultPattern(t))}</div></div>
      <div class="g2"><button class="btn-red-sm" data-act="tireRotate" data-id="${t.id}">LOG ROTATION</button><button class="btn2" data-act="tireSwap" data-vid="${t.vid}">Swap sets…</button></div>`
    : `<div><div class="lbl" style="margin-bottom:6px">Marked for next mount</div><div class="pills">${byPos(t.tires).map(x => `<span class="tmark">${esc(x.l)} → ${x.pos}</span>`).join('')}</div></div>
      <div class="g2"><button class="btn2" data-act="tireSwap" data-vid="${t.vid}" data-in="${t.id}">Put this set on…</button><button class="btn2" data-act="tireRotate" data-id="${t.id}" data-pat="none">Log tread</button></div>
      ${t.swapBy ? `<div class="help">Swap reminder: ${fmtDate(t.swapBy, true)}</div>` : ''}`}
    <div class="help">${fmtMi(setTotalMi(t))} mi logged on this set${t.notes ? ' · ' + esc(t.notes) : ''}</div>
  </section>`;
}

/* ---------- MX › Due: the Tire rotation card follows the set on the car ---------- */
function tireDueCard(it, st) {
  const t = setOnCar(it.vid), rot = setRotMi(t);
  const label = {overdue: 'OVERDUE', soon: 'DUE SOON', ok: 'OK', none: 'NO HISTORY'}[st.state];
  const color = {overdue: 'var(--red-hi)', soon: 'var(--amber)', ok: 'var(--steel)', none: 'var(--line-hi)'}[st.state];
  return `<div class="due ${st.state === 'overdue' ? 'overdue' : st.state === 'soon' ? 'soon' : ''}" data-tire-due="1">
    <button data-act="editSched" data-id="${it.id}" style="display:flex;flex-direction:column;gap:8px;text-align:left;width:100%">
      <span class="top" style="width:100%"><span class="stat ${st.state}">${label}</span><span class="mono muted" style="font-size:12px;text-align:right">${esc(dueText(st, it))}</span></span>
      <span style="display:flex;gap:8px;align-items:center"><span class="nm">${esc(it.name)}</span><span class="tag">${esc(t.name)}</span></span>
      ${st.state !== 'none' ? `<span class="bar" style="display:block;width:100%"><span style="display:block;height:6px;width:${Math.max(3, st.pct * 100)}%;background:${color}"></span></span>` : ''}
      <span class="mono" style="font-size:12px;color:var(--ink-2)">${fmtMi(rot)}${it.everyMi ? ' of ' + fmtMi(it.everyMi) : ''} mi on this set · ${ROT_PATTERNS[defaultPattern(t)].name.toLowerCase()} next</span></button>
    <div class="g2"><button class="btn-red-sm" data-act="tireRotate" data-id="${t.id}">LOG ROTATION</button><button class="btn2" data-act="mxView" data-k="tires">View tires</button></div></div>`;
}

/* ---------- add / edit a set ---------- */
function editTireSet(id, vid) {
  const t = id ? DATA.tireSets.find(x => x.id === id) : null;
  vid = t ? t.vid : vid;
  const first = !tireSetsOf(vid).length, onCar = t ? t.onCar : !setOnCar(vid);
  const d = t || {name: first ? 'Summer set' : 'Winter set', size: first ? tireSpecSize(vid) : '', brand: '', dot: '', directional: false, storage: '', notes: '', swapBy: ''};
  const letters = t ? byPos(t.tires).map(x => x.l).join(' ') : nextLetters(vid).join(' ');
  const sc = tireSched(vid);
  openSheet(t ? 'Tire set' : 'New tire set', `
    <div class="field"><label class="lbl" for="tsName">Name</label><input id="tsName" class="fld txt" value="${esc(d.name)}" placeholder="e.g. Summer set"></div>
    <div class="g2"><div class="field"><label class="lbl" for="tsSize">Size</label><input id="tsSize" class="fld" value="${esc(d.size)}" placeholder="205/55 R16"></div>
      <div class="field"><label class="lbl" for="tsDot">DOT date</label><input id="tsDot" class="fld" value="${esc(d.dot)}" placeholder="e.g. 2423"></div></div>
    <div class="field"><label class="lbl" for="tsBrand">Brand / model</label><input id="tsBrand" class="fld txt" value="${esc(d.brand)}"></div>
    <div class="switchrow"><div>Directional tires<span class="s">Arrow on the sidewall. Rotates front ↔ rear on the same side only.</span></div>
      <button class="switch" role="switch" id="tsDir" aria-checked="${!!d.directional}" aria-label="Directional tires" data-act="flip"></button></div>
    ${!t ? `<div class="switchrow"><div>On the car now<span class="s">${setOnCar(vid) ? `${esc(setOnCar(vid).name)} is on the car. Add this one as stored, then use Swap sets.` : 'Starts its mileage from the current odometer.'}</span></div>
      <button class="switch" role="switch" id="tsOn" aria-checked="${onCar}" aria-label="On the car now" data-act="flip" ${setOnCar(vid) ? 'disabled' : ''}></button></div>
      ${onCar && sc && sc.lastMi != null ? `<div class="help">Its rotation count starts from your last rotation at ${fmtMi(sc.lastMi)} mi.</div>` : ''}` : ''}
    <div class="field"><label class="lbl" for="tsStore">Stored at</label><input id="tsStore" class="fld txt" value="${esc(d.storage)}" placeholder="When it's off the car"></div>
    ${!t || !t.onCar ? `<div class="field"><label class="lbl" for="tsSwap">Remind me to put it on</label><input id="tsSwap" type="date" class="fld" value="${d.swapBy || ''}"><div class="help">Shows on MX › Due as the date gets close.</div></div>` : ''}
    <div class="field"><label class="lbl" for="tsNotes">Notes</label><textarea id="tsNotes" class="fld">${esc(d.notes)}</textarea></div>
    <div class="help">Tires in this set: <b class="mono">${esc(letters)}</b>. Mark each tire with its letter.</div>
    <button class="btn" data-act="saveTireSet" data-id="${id || ''}" data-vid="${vid}">SAVE</button>
    ${t ? `<button class="btn2 danger" data-act="delTireSet" data-id="${t.id}">Delete set</button>` : ''}`);
}
function saveTireSet(id, vid) {
  const name = sv('#tsName'); if (!name) { warn('Name the set'); return; }
  const sh = $('#sheet'), f = {name, size: sv('#tsSize'), dot: sv('#tsDot'), brand: sv('#tsBrand'), storage: sv('#tsStore'), notes: sv('#tsNotes'),
    directional: $('#tsDir', sh).getAttribute('aria-checked') === 'true'};
  if ($('#tsSwap', sh)) f.swapBy = sv('#tsSwap') || null;
  let t = id && DATA.tireSets.find(x => x.id === id);
  if (t) Object.assign(t, f);
  else {
    const on = $('#tsOn', sh).getAttribute('aria-checked') === 'true' && !setOnCar(vid), odo = currentOdo(vid), sc = tireSched(vid);
    const letters = nextLetters(vid);
    t = Object.assign({id: uid('t'), vid, onCar: on, mountOdo: on ? odo : null, rotMi: 0, rotDate: null, totalMi: 0,
      tires: TIRE_POS.map((pos, i) => ({l: letters[i], pos, treads: []})), createdAt: today()}, f);
    if (on) { t.swapBy = null; if (sc && sc.lastMi != null && odo != null) { t.rotMi = Math.max(0, odo - sc.lastMi); t.rotDate = sc.lastDate || null; } }
    DATA.tireSets.push(t);
  }
  save(); closeSheet(); UI.mxView = 'tires'; render(); toast(id ? 'Saved' : `${t.name} added`);
}

/* ---------- log rotation / tread check ---------- */
let TDRAFT = null;
function tireRotate(id, pat) {
  const t = DATA.tireSets.find(x => x.id === id); if (!t) return;
  TDRAFT = {id, pat: pat || (t.onCar ? defaultPattern(t) : 'none')};
  const pats = t.onCar ? (t.directional ? ['fr', 'none'] : ['cross', 'fr', 'none']) : ['none'];
  openSheet(TDRAFT.pat === 'none' && !t.onCar ? 'Log tread' : 'Log rotation', `
    <div class="help" style="margin-top:-8px">${esc(t.name)}${t.size ? ' · ' + esc(t.size) : ''} · ${fmtMi(setRotMi(t))} mi since rotation</div>
    <div class="g2"><div class="field"><label class="lbl" for="rDate">Date</label><input id="rDate" type="date" class="fld" value="${today()}"></div>
      <div class="field"><label class="lbl" for="rOdo">Odometer</label><input id="rOdo" class="fld" inputmode="numeric" value="${currentOdo(t.vid) ?? ''}"></div></div>
    ${pats.length > 1 ? `<div class="field"><div class="lbl">Pattern</div><div class="pills" role="group" aria-label="Rotation pattern">${pats.map(k => `<button class="pill ${TDRAFT.pat === k ? 'on' : ''}" data-act="tirePat" data-k="${k}">${ROT_PATTERNS[k].name}</button>`).join('')}</div>
      <div class="help" id="rPatNote">${ROT_PATTERNS[TDRAFT.pat].note}</div></div>
    <div class="tafter" id="rAfter">${diagAfter(t, TDRAFT.pat)}<div class="mono tmovelist">${moveList(t, TDRAFT.pat)}</div></div>` : ''}
    <div class="field"><div class="lbl">Tread depth${TDRAFT.pat === 'none' ? '' : ' before rotating'} · 32nds · optional</div>
      <div class="g4">${byPos(t.tires).map(x => { const r = latestTread(x); return `<div class="field"><label class="lbl" for="tr-${x.l}" style="font-size:11px">${esc(x.l)} · ${x.pos}</label>
        <input id="tr-${x.l}" class="fld" data-tread="${esc(x.l)}" inputmode="decimal" placeholder="${r ? r.d : '—'}" style="text-align:center"></div>`; }).join('')}</div>
      <div class="help">New tires are usually 10–11/32. Replace at 2/32; winter grip falls off well before that.</div></div>
    ${TDRAFT.pat !== 'none' || t.onCar ? `<div class="field" style="gap:0"><div class="lbl" style="margin-bottom:4px">Before you drive</div>
      <button class="check" role="checkbox" aria-checked="false" data-act="tCheck"><span class="box"></span>Lugs torqued to 100 N·m (73.8 ft-lb) <span class="mono faint" style="margin-left:auto;font-size:11px">WT-4</span></button>
      <button class="check" role="checkbox" aria-checked="false" data-act="tCheck"><span class="box"></span>Pressures set cold (see Specs) <span class="mono faint" style="margin-left:auto;font-size:11px">WT-2</span></button>
      <button class="check" role="checkbox" aria-checked="false" data-act="tCheck"><span class="box"></span>Checked for uneven wear or damage</button></div>` : ''}
    <div class="field"><label class="lbl" for="rNote">Notes</label><textarea id="rNote" class="fld" placeholder="Anything you noticed…"></textarea></div>
    <button class="btn" data-act="saveRotation">SAVE</button>
    <div class="help" style="text-align:center;margin-top:-6px" id="rSaveNote">${TDRAFT.pat === 'none' ? 'Saves the readings to this set' : 'Adds a Tires record to History and restarts the rotation countdown'}</div>`);
}
function saveRotation() {
  const t = DATA.tireSets.find(x => x.id === TDRAFT.id); if (!t) return;
  const date = sv('#rDate') || today(), odo = num(sv('#rOdo')), pat = TDRAFT.pat, rotating = pat !== 'none';
  const reads = byPos(t.tires).map(x => ({x, d: num(sv(`#tr-${x.l}`))}));
  if (reads.some(r => r.d != null && (r.d < 0 || r.d > 20))) { warn('Tread is in 32nds, e.g. 7'); return; }
  if (rotating && odo == null) { warn('Odometer is needed for a rotation'); $('#rOdo', $('#sheet')).focus(); return; }
  if (!rotating && !reads.some(r => r.d != null)) { warn('Enter at least one tread reading'); return; }
  if (rotating && t.onCar && t.mountOdo != null && odo < t.mountOdo) { warn(`Odometer is below when this set went on (${fmtMi(t.mountOdo)})`); return; }
  reads.forEach(r => { if (r.d != null) r.x.treads.push({date, odo, d: r.d}); });
  const treadTxt = reads.filter(r => r.d != null).map(r => `${r.x.l} ${r.x.pos} ${r.d}/32`).join(', ');
  const note = sv('#rNote');
  if (rotating) {
    const m = ROT_PATTERNS[pat].map;
    t.tires.forEach(x => { x.pos = m[x.pos]; });
    if (t.onCar && t.mountOdo != null) { t.totalMi = (t.totalMi || 0) + Math.max(0, odo - t.mountOdo); t.mountOdo = odo; }
    t.rotMi = 0; t.rotDate = date;
    const sc = tireSched(t.vid);
    if (t.onCar && sc) { sc.lastMi = odo; sc.lastDate = date; }
    DATA.services.push({id: uid('m'), vid: t.vid, date, odo, title: `Tire rotation · ${t.name}`, type: 'Tires', parts: null, labor: null, doneBy: 'DIY', hours: null,
      notes: [ROT_PATTERNS[pat].name + '.', treadTxt && 'Tread ' + treadTxt + '.', note].filter(Boolean).join(' '), scheduleId: t.onCar && sc ? sc.id : null, projectId: null});
  } else DATA.services.push({id: uid('m'), vid: t.vid, date, odo, title: `Tread check · ${t.name}`, type: 'Inspection', parts: null, labor: null, doneBy: 'DIY', hours: null,
    notes: ['Tread ' + treadTxt + '.', note].filter(Boolean).join(' '), scheduleId: null, projectId: null});
  save(); closeSheet(); UI.mxView = 'tires'; render(); Haptics.success();
  const low = reads.filter(r => r.d != null && r.d <= 4);
  toast(rotating ? `Rotation logged · next in ${fmtMi((tireSched(t.vid) || {}).everyMi || 7500)} mi` : 'Tread saved' + (low.length ? ` · ${low.map(r => r.x.l).join(', ')} low` : ''));
}

/* ---------- seasonal swap ---------- */
let SWDRAFT = null;
function tireSwap(vid, inId) {
  const out = setOnCar(vid), stored = tireSetsOf(vid).filter(t => !t.onCar);
  if (!stored.length) { toast('Add a second set first (+ Set)'); return; }
  const inn = stored.find(t => t.id === inId) || stored[0];
  SWDRAFT = {vid, inId: inn.id, mark: true};
  const mk = out ? ROT_PATTERNS[defaultPattern(out)].map : null;
  openSheet(out ? 'Swap sets' : 'Put a set on', `
    <div class="help" style="margin-top:-8px">${out ? `${esc(out.name)} off · ` : ''}${stored.length > 1 ? '' : esc(inn.name) + ' on'}</div>
    ${stored.length > 1 ? `<div class="field"><label class="lbl" for="swIn">Going on</label><select id="swIn" class="fld" data-act-change="swIn">${stored.map(t => `<option value="${t.id}" ${t.id === inn.id ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select></div>` : ''}
    <div class="g2"><div class="field"><label class="lbl" for="swDate">Date</label><input id="swDate" type="date" class="fld" value="${today()}"></div>
      <div class="field"><label class="lbl" for="swOdo">Odometer</label><input id="swOdo" class="fld" inputmode="numeric" value="${currentOdo(vid) ?? ''}"></div></div>
    ${out ? `<div class="tblk"><div class="d-ph"><span class="lbl">1 · Coming off: ${esc(out.name)}</span><span class="mono muted" style="font-size:12px">${fmtMi(setRotMi(out))} mi since rotation</span></div>
      <div class="switchrow"><div>Mark rotated positions<span class="s">Write the red label on each tire as it comes off: its spot next season, already rotated (${ROT_PATTERNS[defaultPattern(out)].name.toLowerCase()}).</span></div>
        <button class="switch" role="switch" id="swMark" aria-checked="true" aria-label="Mark rotated positions" data-act="swMark"></button></div>
      <div class="tmk" id="swMarks">${byPos(out.tires).map(x => `<div><span>${x.pos}</span><b>${esc(x.l)}</b><em data-rot="${mk[x.pos]}" data-cur="${x.pos}">→ ${mk[x.pos]}</em></div>`).join('')}</div>
      <div class="field"><label class="lbl" for="swStore">Storing at</label><input id="swStore" class="fld txt" value="${esc(out.storage || '')}" placeholder="e.g. garage rack"></div>
      <div class="field"><label class="lbl" for="swBack">Remind me to swap back</label><input id="swBack" type="date" class="fld"></div></div>` : ''}
    <div class="tblk"><div class="d-ph"><span class="lbl">${out ? '2 · ' : ''}Going on: <span id="swInName">${esc(inn.name)}</span></span><span class="mono muted" style="font-size:12px" id="swInMi">${fmtMi(setRotMi(inn))} mi since rotation</span></div>
      <div class="help">Mount each tire where it's marked.</div>
      <div class="tmk" id="swInMarks">${swapInMarks(inn)}</div></div>
    <div class="field" style="gap:0"><div class="lbl" style="margin-bottom:4px">Before you drive</div>
      <button class="check" role="checkbox" aria-checked="false" data-act="tCheck"><span class="box"></span>Lugs torqued to 100 N·m (73.8 ft-lb)<span class="mono faint" style="margin-left:auto;font-size:11px">WT-4</span></button>
      <button class="check" role="checkbox" aria-checked="false" data-act="tCheck"><span class="box"></span>Pressures set cold (see Specs; recheck if the size differs)</button>
      <button class="check" role="checkbox" aria-checked="false" data-act="tCheck"><span class="box"></span>Re-check lug torque after the first 50 mi</button></div>
    <button class="btn" data-act="saveSwap">SAVE SWAP</button>
    <div class="help" style="text-align:center;margin-top:-6px">Logs a Tires record · Tire rotation then counts ${esc(inn.name)}'s miles</div>`,
  sh => { const s = $('#swIn', sh); if (s) s.onchange = () => { SWDRAFT.inId = s.value; const t = DATA.tireSets.find(x => x.id === s.value);
    $('#swInName', sh).textContent = t.name; $('#swInMi', sh).textContent = fmtMi(setRotMi(t)) + ' mi since rotation'; $('#swInMarks', sh).innerHTML = swapInMarks(t); }; });
}
const swapInMarks = t => byPos(t.tires).map(x => { const r = latestTread(x); return `<div><span>marked</span><b>${esc(x.l)}</b><em>${x.pos}</em>${r ? `<span>${r.d}/32</span>` : ''}</div>`; }).join('');
function saveSwap() {
  const {vid} = SWDRAFT, out = setOnCar(vid), inn = DATA.tireSets.find(x => x.id === SWDRAFT.inId);
  const date = sv('#swDate') || today(), odo = num(sv('#swOdo'));
  if (odo == null) { warn('Odometer is needed for a swap'); $('#swOdo', $('#sheet')).focus(); return; }
  if (out && out.mountOdo != null && odo < out.mountOdo) { warn(`Odometer is below when ${out.name} went on (${fmtMi(out.mountOdo)})`); return; }
  let marks = '';
  if (out) {
    const ran = out.mountOdo != null ? Math.max(0, odo - out.mountOdo) : 0;
    out.totalMi = (out.totalMi || 0) + ran; out.rotMi = (out.rotMi || 0) + ran;
    if (SWDRAFT.mark) {
      const m = ROT_PATTERNS[defaultPattern(out)].map;
      marks = byPos(out.tires).map(x => `${x.l} ${x.pos}→${m[x.pos]}`).join(', ');
      out.tires.forEach(x => { x.pos = m[x.pos]; });
      out.rotMi = 0; out.rotDate = date;                 // already rotated for next season
    }
    Object.assign(out, {onCar: false, mountOdo: null, storage: sv('#swStore'), swapBy: sv('#swBack') || null});
  }
  Object.assign(inn, {onCar: true, mountOdo: odo, swapBy: null});
  const sc = tireSched(vid);
  if (sc) { sc.lastMi = odo - (inn.rotMi || 0); sc.lastDate = inn.rotDate || date; }
  DATA.services.push({id: uid('m'), vid, date, odo, title: out ? `Seasonal swap · ${out.name} → ${inn.name}` : `Mounted ${inn.name}`, type: 'Tires', parts: null, labor: null, doneBy: 'DIY', hours: null,
    notes: [out && marks ? `${out.name} marked for next season (${ROT_PATTERNS[defaultPattern(out)].name.toLowerCase()}): ${marks}.` : '', out && out.storage ? `Stored at ${out.storage}.` : ''].filter(Boolean).join(' '), scheduleId: null, projectId: null});
  save(); closeSheet(); UI.mxView = 'tires'; render(); Haptics.success(); toast(`${inn.name} is on`);
}

Object.assign(ACT, {
  editTireSet: d => editTireSet(d.id, d.vid || ROUTE.vid), saveTireSet: d => saveTireSet(d.id, d.vid),
  delTireSet: d => { const t = DATA.tireSets.find(x => x.id === d.id); if (!t || !confirm(`Delete ${t.name}? Its service records stay in History.`)) return;
    DATA.tireSets = DATA.tireSets.filter(x => x.id !== d.id); save(); closeSheet(); render(); },
  tireRotate: d => tireRotate(d.id, d.pat), saveRotation,
  tirePat: (d, el) => { const t = DATA.tireSets.find(x => x.id === TDRAFT.id); TDRAFT.pat = d.k;
    $$('[data-act=tirePat]').forEach(b => b.classList.toggle('on', b === el));
    $('#rAfter').innerHTML = diagAfter(t, d.k) + `<div class="mono tmovelist">${moveList(t, d.k)}</div>`; $('#rPatNote').textContent = ROT_PATTERNS[d.k].note;
    $('#rSaveNote').textContent = d.k === 'none' ? 'Saves the readings to this set' : 'Adds a Tires record to History and restarts the rotation countdown'; },
  tCheck: (d, el) => el.setAttribute('aria-checked', el.getAttribute('aria-checked') !== 'true'),
  tireSwap: d => tireSwap(d.vid || ROUTE.vid, d.in || d.set),
  swMark: (d, el) => { SWDRAFT.mark = el.getAttribute('aria-checked') !== 'true'; el.setAttribute('aria-checked', SWDRAFT.mark);
    $$('#swMarks em').forEach(e => { e.textContent = SWDRAFT.mark ? '→ ' + e.dataset.rot : '→ ' + e.dataset.cur; e.classList.toggle('same', !SWDRAFT.mark); }); },
  saveSwap,
});
