/* Press-and-hold drag to reorder project tasks and parts. */
const {fixture, newPage, loadData, touchDrag, shot} = require('./helpers');

module.exports = async ({browser, base, check}) => {
  const {page, cdp, errors} = await newPage(browser, base);
  await loadData(page, fixture('seed.json'), '#/v/v-roci/projects');
  await page.click('.pcard >> text=Head unit wiring'); await page.waitForTimeout(400);
  const order = () => page.evaluate(() => PDRAFT.tasks.map(t => t.t));
  const grip = (list, i) => page.$eval(`.grip[data-list="${list}"][data-i="${i}"]`, e => { e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
  const stepOf = list => page.evaluate(l => { const r = $$(`#j${l} .swipe-row`); return r[1].getBoundingClientRect().top - r[0].getBoundingClientRect().top; }, list);
  const step = await stepOf('Tasks');
  const o0 = await order();

  let g = await grip('tasks', 0); await touchDrag(cdp, page, g.x, g.y, 0, {hold: 500, steps: 1});
  check(JSON.stringify(await order()) === JSON.stringify(o0), 'holding without moving changes nothing');
  g = await grip('tasks', 0); await touchDrag(cdp, page, g.x, g.y, step * 2, {hold: 20, steps: 12});
  check(JSON.stringify(await order()) === JSON.stringify(o0), 'a quick swipe (no hold) does not reorder');
  g = await grip('tasks', 0);
  await touchDrag(cdp, page, g.x, g.y, step * 2 + 4, {hold: 400, steps: 12, beforeRelease: () => shot(page, 'reorder-01-dragging', false)});
  const o1 = await order();
  check(JSON.stringify(o1) === JSON.stringify([o0[1], o0[2], o0[0]]), 'hold + drag moves the first task to the bottom');
  check(await page.evaluate(() => $('#sheet').classList.contains('open')), 'dragging down on a handle never dismisses the sheet');
  check(await page.evaluate(() => $$('#jTasks .swipe-row').every(r => !r.style.transform && !r.classList.contains('dragging'))), 'rows reset after drop');
  g = await grip('tasks', 2); await touchDrag(cdp, page, g.x, g.y, -step, {hold: 400, steps: 12});
  check(JSON.stringify(await order()) === JSON.stringify([o1[0], o1[2], o1[1]]), 'drag up one place');

  await page.fill('[data-pt="t"][data-i="0"]', 'Edited before moving');
  g = await grip('tasks', 0); await touchDrag(cdp, page, g.x, g.y, step, {hold: 400, steps: 12});
  check((await order())[1] === 'Edited before moving', 'unsaved text edits survive a reorder');

  await page.focus('.grip[data-list="tasks"][data-i="2"]'); await page.keyboard.press('ArrowUp');
  check(await page.evaluate(() => document.activeElement.matches('.grip[data-list="tasks"][data-i="1"]')), 'arrow keys move the item and focus follows');

  await page.click('[data-act=pAddPart]'); await page.fill('[data-pp=name] >> nth=-1', 'Part A');
  await page.click('[data-act=pAddPart]'); await page.fill('[data-pp=name] >> nth=-1', 'Part B');
  g = await grip('parts', 1); await touchDrag(cdp, page, g.x, g.y, -(await stepOf('Parts')), {hold: 400, steps: 12});
  check(JSON.stringify(await page.evaluate(() => PDRAFT.parts.map(x => x.name))) === '["Part B","Part A"]', 'parts reorder too');

  const final = await order();
  await page.click('[data-act=saveProject]'); await page.waitForTimeout(400);
  check(JSON.stringify(await page.evaluate(() => DATA.projects.find(p => p.title === 'Head unit wiring').tasks.map(t => t.t))) === JSON.stringify(final), 'order persists on save');
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.join('; ') : ''));
  await page.context().close();
};
