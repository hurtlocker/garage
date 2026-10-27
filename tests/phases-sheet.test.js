/* Strict 1–5 phases (with migration of old labels) and pull-down-to-dismiss sheets. */
const {fixture, newPage, loadData, touchDrag, shot} = require('./helpers');

module.exports = async ({browser, base, check}) => {
  const {page, cdp, errors} = await newPage(browser, base);
  await loadData(page, fixture('seed.json'));      // seed still has old labels like "2 - Interior Weekend"
  check(JSON.stringify(await page.evaluate(() => [...new Set(DATA.projects.map(p => p.phase))].sort())) === '[1,2,3,4]', 'old phase labels migrate to numbers');
  check(await page.evaluate(() => SYNC.dirty), 'migration is queued for sync');

  await page.goto(base + '#/v/v-roci/projects'); await page.waitForTimeout(300);
  const heads = await page.$$eval('h2.grp', hs => hs.map(h => h.textContent.trim()));
  check([1, 2, 3, 4, 5].every((n, i) => heads[i].startsWith('Phase ' + n)), 'all five phases listed, empty ones included');

  await page.click('[data-act=projCat][data-k=Interior]');
  await page.click('[data-act=editProject][data-vid]');
  check(JSON.stringify(await page.$$eval('#jPhase option', os => os.map(o => o.textContent))) === '["No phase","Phase 1","Phase 2","Phase 3","Phase 4","Phase 5"]', 'phase is a locked picker');
  check(await page.locator('[data-act=closeSheet]').count() === 0, 'no X button on sheets');
  await page.fill('#jTitle', 'Exterior Vinyl Treatments'); await page.selectOption('#jCat', 'Exterior'); await page.selectOption('#jPhase', '2');
  await page.click('[data-act=saveProject]'); await page.waitForTimeout(700);
  check(await page.evaluate(() => DATA.projects.find(p => p.title === 'Exterior Vinyl Treatments').phase) === 2, 'saved as phase 2');
  check(await page.locator('.pcard:has-text("Exterior Vinyl Treatments")').isVisible(), 'a new project is visible even if a category filter would hide it');
  await shot(page, 'phases-01-list');

  const isOpen = () => page.evaluate(() => $('#sheet').classList.contains('open'));
  const openSheet = async () => { await page.evaluate(() => { closeSheet(); window.scrollTo(0, 0); }); await page.waitForTimeout(300); await page.click('.pcard >> nth=0'); await page.waitForTimeout(350); };
  const handleY = () => page.$eval('.grab-zone', e => e.getBoundingClientRect().top + 10);

  await openSheet(); let hy = await handleY();
  await touchDrag(cdp, page, 195, hy, 30, {stepMs: 60}); check(await isOpen(), 'short slow pull snaps back');
  await touchDrag(cdp, page, 195, hy, 260, {stepMs: 40}); check(!(await isOpen()), 'pull down on the handle dismisses');
  await openSheet(); hy = await handleY();
  await touchDrag(cdp, page, 195, hy, 80, {hold: 500, steps: 4, stepMs: 12}); check(!(await isOpen()), 'a quick flick (even after a pause) dismisses');
  await openSheet();
  const by = await page.$eval('#jStatus', e => e.getBoundingClientRect().top - 30);
  await touchDrag(cdp, page, 195, by, 260, {stepMs: 40}); check(!(await isOpen()), 'pull from the body at scroll-top dismisses');
  await openSheet();
  const ta = await page.$eval('#jNotes', e => { e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return {x: r.left + 40, y: r.top + 20}; });
  await page.waitForTimeout(200);
  await touchDrag(cdp, page, ta.x, ta.y, 200, {stepMs: 40}); check(await isOpen(), 'pulling inside a scrolled sheet / textarea does not dismiss');
  await page.evaluate(() => { $('#sheet').scrollTop = 0; }); hy = await handleY();
  await touchDrag(cdp, page, 195, hy + 200, -300, {stepMs: 30}); check(await isOpen(), 'an upward swipe does not dismiss');
  await page.keyboard.press('Escape'); await page.waitForTimeout(300); check(!(await isOpen()), 'Escape closes');
  await openSheet(); await page.click('#scrim', {position: {x: 195, y: 20}}); await page.waitForTimeout(300); check(!(await isOpen()), 'tapping outside closes');

  check((await page.evaluate(() => buildSnapshot())).includes('Exterior · Phase 2'), 'snapshot uses Phase labels');
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.join('; ') : ''));
  await page.context().close();
};
