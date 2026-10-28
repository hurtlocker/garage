/* Desktop layout (≥ 1024 px): Fleet Overview, Workbench, drag-to-phase board, side-panel sheets,
   quick log from the rail, and the switch back to the phone layout below 1024 px (upright iPad). */
const {fixture, newPage, loadData, shot} = require('./helpers');

module.exports = async ({browser, base, check}) => {
  const {page, errors} = await newPage(browser, base, {touch: false});
  await page.setViewportSize({width: 1440, height: 900});
  await loadData(page, fixture('seed.json'));

  // ---------- Fleet Overview ----------
  check(await page.evaluate(() => document.body.classList.contains('wide')) && await page.locator('.d-fleet').count() === 1, 'wide window shows the Fleet Overview');
  check(await page.locator('.d-vcol').count() === 3, 'one column per vehicle');
  const cols = await page.$$eval('.d-vcol', cs => cs.map(c => c.getBoundingClientRect().top));
  check(cols.every(t => Math.abs(t - cols[0]) < 2), 'vehicle columns sit side by side');
  check(JSON.stringify(await page.$$eval('.d-vcol .plate:not(.vin)', ps => ps.map(p => p.dataset.v))) === JSON.stringify(['ROCI000', 'CAMRY00', 'JEEP000']), 'plates on every column');
  check(await page.locator('.d-vcol >> nth=1').locator('[data-act=editVehicle]:has-text("Add VIN")').count() === 1, 'a vehicle with no VIN offers “Add VIN”');
  const alerts = await page.$$eval('.d-alert', as => as.map(a => a.textContent.replace(/\s+/g, ' ').trim()));
  check(alerts.some(a => a.includes('WATCH') && a.includes('Fix fuel pump leak')), 'watch item in the alert strip');
  check(alerts.every(a => /WATCH|OVERDUE|EXPIRED|SWAP DUE/.test(a)), 'alert strip holds critical alerts only');
  check(await page.locator('.d-feed').count() === 1 && await page.locator('.d-stack').count() === 3, 'fleet activity feed and spend bars');
  await shot(page, 'desktop-01-fleet');

  // ---------- into the Workbench ----------
  await page.click('.d-vcol >> nth=0 >> .d-name'); await page.waitForTimeout(300);
  check(await page.evaluate(() => location.hash) === '#/v/v-roci/projects', 'a vehicle with open projects opens on its board');
  const heads = await page.$$eval('.d-colh', hs => hs.map(h => h.textContent.trim()));
  check([1, 2, 3, 4, 5].every((n, i) => heads[i].startsWith('Phase ' + n)), 'board has Phase 1–5 columns');
  check(await page.locator('.d-rail #dOdo').count() === 1, 'log form lives in the rail');
  check(await page.locator('.d-switch a').count() === 3, 'vehicle switcher in the header');
  await shot(page, 'desktop-02-board');

  // drag a card to another phase
  const title = 'Fix rear defogger';
  const phaseOf = () => page.evaluate(t => DATA.projects.find(p => p.title === t).phase, title);
  const p0 = await phaseOf();
  await page.dragAndDrop(`.pcard:has-text("${title}")`, '.d-col[data-drop="3"]'); await page.waitForTimeout(300);
  check(await phaseOf() === 3 && p0 !== 3, `dragging a card to Phase 3 moves it (was ${p0})`);
  check(await page.evaluate(t => JSON.parse(JSON.stringify(DATA)).projects.find(p => p.title === t).phase, title) === 3 && await page.evaluate(async () => (await idbGet('data')).projects.some(p => p.phase === 3 && p.title === 'Fix rear defogger')), 'move saved to the device');
  check(await page.locator('.d-col[data-drop="3"] .pcard:has-text("' + title + '")').count() === 1, 'card shows in its new column');
  check((await page.textContent('#toast')).includes('Moved to Phase 3'), 'move confirmed with a toast');
  // by status
  await page.click('[data-act=projGroup][data-k=status]'); await page.waitForTimeout(200);
  await page.dragAndDrop(`.pcard:has-text("${title}")`, '.d-col[data-drop="In Progress"]'); await page.waitForTimeout(300);
  check(await page.evaluate(t => DATA.projects.find(p => p.title === t).status, title) === 'In Progress', 'by-status board: dragging changes status');
  await page.click('[data-act=projGroup][data-k=phase]'); await page.waitForTimeout(200);

  // side panel instead of bottom sheet
  await page.click(`.pcard:has-text("${title}")`); await page.waitForTimeout(350);
  const box = await page.$eval('#sheet', e => { const r = e.getBoundingClientRect(); return {x: r.left, w: r.width, h: r.height, top: r.top}; });
  check(box.x > 800 && box.top === 0 && box.h === 900, 'edit card opens as a right-hand side panel');
  await shot(page, 'desktop-03-panel', false);
  await page.click('.sheet-x'); await page.waitForTimeout(300);
  check(!(await page.evaluate(() => $('#sheet').classList.contains('open'))), 'side panel has a close button');

  // quick log from the rail
  const n0 = await page.evaluate(() => DATA.logs.length);
  await page.fill('#dOdo', '124400'); await page.fill('#dPpg', '2.95'); await page.fill('#dGal', '10.2');
  await page.click('[data-act=saveEntry]'); await page.waitForTimeout(250);
  check(await page.evaluate(() => DATA.logs.length) === n0 + 1 && await page.evaluate(() => location.hash) === '#/v/v-roci/projects', 'rail log entry saves and stays on the board');

  // tabs
  for (const [t, sel] of [['mx', '.d-grid2 .due'], ['log', '.d-entries .entry'], ['stats', '.d-stats .kpis'], ['specs', '.d-grid2 .kvrow']]) {
    await page.click(`.d-tabs a[href$="/${t}"]`); await page.waitForTimeout(200);
    check(await page.locator(sel).count() > 0, `${t} tab renders`);
  }
  await shot(page, 'desktop-04-specs');

  // switcher: a vehicle with no open projects opens on MX
  await page.click('.d-tabs a[href$="/projects"]'); await page.waitForTimeout(150);
  await page.click('.d-switch a:has-text("Camry")'); await page.waitForTimeout(250);
  check(await page.evaluate(() => location.hash) === '#/v/v-camry/mx', 'switching to a vehicle with no projects lands on MX');

  // ---------- below 1024 px: phone layout ----------
  await page.setViewportSize({width: 820, height: 1180}); await page.waitForTimeout(300);
  check(!(await page.evaluate(() => document.body.classList.contains('wide'))) && await page.locator('.vhead .tabs').count() === 1, 'upright iPad (820 px) gets the phone layout');
  await page.goto(base + '#/'); await page.waitForTimeout(250);
  check(await page.locator('.vcard').count() === 1 && await page.locator('.d-fleet').count() === 0, 'phone home screen unchanged');
  await page.goto(base + '#/v/v-roci/specs'); await page.waitForTimeout(250);
  check(await page.locator('.seg button.on:has-text("Specs")').count() === 1, 'a desktop Specs link opens MX › Specs on the phone');
  await page.setViewportSize({width: 1280, height: 800}); await page.waitForTimeout(300);
  check(await page.locator('.d-bench').count() === 1, 'widening the window switches back live');
  check(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth) === 0, 'no sideways page scroll at 1280 px');

  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.join('; ') : ''));
  await page.context().close();
};
