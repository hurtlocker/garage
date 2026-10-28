/* Tire sets: set up current tires (seeded from the rotation baseline), add a stored set, log a rotation with tread,
   tread check, seasonal swap with pre-rotated marks, schedule follows the set on the car, swap reminder, snapshot, inbox. */
const {fixture, newPage, loadData, shot} = require('./helpers');

module.exports = async ({browser, base, check}) => {
  const {page, errors} = await newPage(browser, base, {touch: false});
  const seed = fixture('seed.json');
  const sc0 = seed.schedule.find(s => s.vid === 'v-roci' && /tire rotation/i.test(s.name));
  sc0.lastMi = 121574; sc0.lastDate = '2026-03-01';
  await loadData(page, seed, '#/v/v-roci/mx');
  const odo = await page.evaluate(() => currentOdo('v-roci'));

  await page.click('[data-act=mxView][data-k=tires]'); await page.waitForTimeout(150);
  check(await page.locator('text=SET UP CURRENT TIRES').count() === 1, 'empty Tires view offers to set up the current tires');
  await page.click('[data-act=editTireSet]'); await page.waitForTimeout(300);
  check(await page.inputValue('#tsName') === 'Summer set' && await page.inputValue('#tsSize') === await page.evaluate(() => tireSpecSize('v-roci')), 'new set prefilled: name, and size from the Tire size spec');
  await page.click('[data-act=saveTireSet]'); await page.waitForTimeout(250);
  const s1 = await page.evaluate(() => { const t = DATA.tireSets[0]; return {on: t.onCar, rot: setRotMi(t), l: t.tires.map(x => x.l + x.pos).join(' ')}; });
  check(s1.on && s1.l === 'ALF BRF CLR DRR', `set on car with tires A–D in place (${s1.l})`);
  check(s1.rot === odo - 121574, `rotation miles start from the existing baseline (${s1.rot})`);

  await page.click('[data-act=editTireSet] >> text=+ Set'); await page.waitForTimeout(300);
  check(await page.getAttribute('#tsOn', 'aria-checked') === 'false', 'a second set defaults to stored');
  const soon = new Date(); soon.setDate(soon.getDate() + 10); const soonISO = soon.toISOString().slice(0, 10);
  await page.fill('#tsStore', 'Garage rack'); await page.fill('#tsSwap', soonISO);
  await page.click('[data-act=saveTireSet]'); await page.waitForTimeout(250);
  check(await page.evaluate(() => DATA.tireSets[1].tires.map(x => x.l).join('')) === 'EFGH', 'second set lettered E–H');
  await shot(page, 'tires-01-sets');

  // Due tab tie-in
  await page.click('[data-act=mxView][data-k=due]'); await page.waitForTimeout(150);
  check(await page.locator('[data-tire-due] .tag:has-text("Summer set")').count() === 1, 'Tire rotation card on Due names the set on the car');
  check(await page.locator('.due:has-text("Seasonal swap · to Winter set") .stat:has-text("SWAP SOON")').count() === 1, 'swap reminder shows on Due');
  check(await page.evaluate(() => badgeCount('v-roci')) >= 1, 'swap reminder counts toward the MX badge');
  await shot(page, 'tires-02-due');

  // rotation with tread
  await page.click('[data-tire-due] [data-act=tireRotate]'); await page.waitForTimeout(300);
  check(await page.locator('[data-act=tirePat].on:has-text("Rearward cross")').count() === 1, 'rearward cross preselected for non-directional tires');
  await page.click('[data-act=tirePat][data-k=fr]'); await page.waitForTimeout(100);
  check((await page.textContent('#rAfter')).includes('LR → LF'), 'switching pattern redraws the moves');
  await page.click('[data-act=tirePat][data-k=cross]');
  await page.fill('[data-tread=A]', '7'); await page.fill('[data-tread=C]', '4');
  await shot(page, 'tires-03-rotate', false);
  await page.click('[data-act=saveRotation]'); await page.waitForTimeout(250);
  const r = await page.evaluate(() => { const t = DATA.tireSets[0], sc = tireSched('v-roci'); return {pos: t.tires.map(x => x.l + x.pos).join(' '), rot: setRotMi(t), lastMi: sc.lastMi,
    a: latestTread(t.tires[0]).d, svc: DATA.services.find(s => /^Tire rotation · Summer/.test(s.title))}; });
  check(r.pos === 'ALR BRR CRF DLF', `rearward cross applied (${r.pos})`);
  check(r.rot === 0 && r.lastMi === odo, 'rotation resets the set and the schedule item');
  check(r.a === 7 && r.svc && r.svc.type === 'Tires' && /A LF 7\/32/.test(r.svc.notes) && r.svc.scheduleId, 'tread saved and a Tires service record logged');

  // tread check only
  await page.click('.tset.on [data-act=tireRotate]'); await page.waitForTimeout(300);
  await page.click('[data-act=tirePat][data-k=none]'); await page.fill('[data-tread=C]', '3');
  await page.click('[data-act=saveRotation]'); await page.waitForTimeout(250);
  check(await page.evaluate(() => DATA.tireSets[0].tires.map(x => x.l + x.pos).join(' ')) === 'ALR BRR CRF DLF' && (await page.textContent('#toast')).includes('low'), 'tread check leaves positions alone and flags low tread');
  check(await page.locator('.tset.on .tire.worn, .tset.on .tire.low').count() >= 1, 'low tread is colored on the diagram');

  // drive 1,000 mi, then swap
  await page.evaluate(o => { DATA.logs.push({id: 'l-x', vid: 'v-roci', date: today(), odo: o + 1000, fuel: null, note: '', tags: [], projectId: null}); save(); render(); }, odo);
  check(await page.evaluate(() => setRotMi(DATA.tireSets[0])) === 1000, 'set accrues miles as the car is driven');
  await page.click('.tset.on [data-act=tireSwap]'); await page.waitForTimeout(300);
  check(JSON.stringify(await page.$$eval('#swMarks > div', ds => ds.map(d => d.querySelector('b').textContent + d.querySelector('em').textContent))) === JSON.stringify(['D→ LR', 'C→ RR', 'A→ RF', 'B→ LF']), 'swap sheet shows the pre-rotated mark for each tire');
  await page.fill('#swBack', '2027-04-15');
  await shot(page, 'tires-04-swap', false);
  await page.click('[data-act=saveSwap]'); await page.waitForTimeout(300);
  const w = await page.evaluate(() => { const [s, wi] = DATA.tireSets, sc = tireSched('v-roci'); return {sOn: s.onCar, wOn: wi.onCar, sPos: s.tires.map(x => x.l + x.pos).join(' '), sTot: setTotalMi(s), sRot: s.rotMi, swapBy: s.swapBy, wSwap: wi.swapBy, lastMi: sc.lastMi}; });
  check(w.wOn && !w.sOn, 'winter set on, summer set stored');
  check(w.sPos === 'ARF BLF CRR DLR', `summer set marked for next season (${w.sPos})`);
  check(w.sTot === 1000 && w.sRot === 0, 'summer set keeps its miles and starts next season freshly rotated');
  check(w.lastMi === odo + 1000 && w.swapBy === '2027-04-15' && !w.wSwap, 'schedule now counts the winter set; swap-back reminder moved to the stored set');
  check(await page.evaluate(() => DATA.services.some(s => s.title === 'Seasonal swap · Summer set → Winter set')), 'swap logged in History');

  check((await page.evaluate(() => buildSnapshot())).includes('**Tire sets**'), 'tire sets in snapshot.md');
  const ok = await page.evaluate(() => applyPatch({ops: [{op: 'upsert', coll: 'tireSets', item: {id: DATA.tireSets[1].id, notes: 'Bought from Tire Rack'}}]}).ok);
  check(ok === 1 && await page.evaluate(() => DATA.tireSets[1].notes) === 'Bought from Tire Rack', 'Claude can update tire sets through inbox.json');

  // desktop MX shows Tires
  await page.setViewportSize({width: 1440, height: 900}); await page.goto(base + '#/v/v-roci/mx'); await page.waitForTimeout(300);
  check(await page.locator('.d-grid2 .tset').count() === 2, 'desktop MX tab shows the tire sets');
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.join('; ') : ''));
  await page.context().close();
};
