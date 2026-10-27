/* Swipe-to-delete on project tasks/parts, the visual cues at each "line-crossing" moment,
   and that haptics stay shelved (no vibration calls, nothing injected into the page). */
const {fixture, newPage, loadData, touchDrag, touchSwipe, shot} = require('./helpers');

module.exports = async ({browser, base, check}) => {
  const {page, cdp, errors} = await newPage(browser, base);
  await page.addInitScript(() => {                       // count any vibration attempts
    window.__vibes = 0; const v = navigator.vibrate ? navigator.vibrate.bind(navigator) : null;
    Object.defineProperty(Navigator.prototype, 'vibrate', {configurable: true, value: (...a) => { window.__vibes++; return v ? v(...a) : false; }});
  });
  page.on('dialog', d => d.accept());
  await loadData(page, fixture('seed.json'), '#/v/v-roci/projects');
  const tasks = () => page.evaluate(() => PDRAFT.tasks.map(t => t.t));
  const rowBox = (list, i) => page.$eval(`#j${list} .swipe-row[data-i="${i}"]`, e => { e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return {x: r.left, y: r.top + r.height / 2, w: r.width}; });
  const rowState = i => page.evaluate(n => { const w = $(`#jTasks .swipe-row[data-i="${n}"]`); return {swiping: w.classList.contains('swiping'), armed: w.classList.contains('armed'), label: w.querySelector('.swipe-bg b').textContent}; }, i);

  await page.click('.pcard >> text=Head unit wiring'); await page.waitForTimeout(400);
  check(await page.locator('#jTasks .x, #jParts .x, [data-act=pDelTask], [data-act=pDelPart]').count() === 0, 'no X buttons on tasks or parts');
  const t0 = await tasks();

  let r = await rowBox('Tasks', 0), mid;
  await touchSwipe(cdp, page, r.x + r.w - 20, r.y, -r.w * 0.3, {beforeRelease: async () => { mid = await rowState(0); await shot(page, 'swipe-01-partial', false); }});
  check(mid.swiping && !mid.armed && mid.label === 'Delete', 'a partial swipe reveals the red Delete banner');
  check(JSON.stringify(await tasks()) === JSON.stringify(t0), 'releasing before halfway snaps back without deleting');
  check(await page.evaluate(() => { const w = $('#jTasks .swipe-row[data-i="0"]'); return !w.classList.contains('swiping') && !w.querySelector('.row-edit').style.transform; }), 'row returns to rest');

  r = await rowBox('Tasks', 0);
  await touchSwipe(cdp, page, r.x + r.w - 20, r.y, -r.w * 0.7, {beforeRelease: async () => { mid = await rowState(0); await shot(page, 'swipe-02-armed', false); }});
  check(mid.armed && mid.label === 'Release to delete', 'past halfway the banner arms: bright red, "Release to delete"');
  check(JSON.stringify(await tasks()) === JSON.stringify(t0.slice(1)), 'release past halfway deletes the task');
  check((await page.textContent('#toast')).includes('Undo'), 'toast offers Undo');
  await page.click('.toast-act'); await page.waitForTimeout(250);
  check(JSON.stringify(await tasks()) === JSON.stringify(t0), 'Undo puts it back in the same spot');

  r = await rowBox('Tasks', 1);
  const back = []; for (let k = 1; k <= 10; k++) back.push([-r.w * 0.07 * k, 0]); for (let k = 1; k <= 6; k++) back.push([-r.w * 0.7 + r.w * 0.08 * k, 0]);
  await touchSwipe(cdp, page, r.x + r.w - 20, r.y, 0, {path: back});
  check(JSON.stringify(await tasks()) === JSON.stringify(t0), 'dragging back under halfway before letting go cancels');

  r = await rowBox('Tasks', 1);
  await touchSwipe(cdp, page, r.x + r.w / 2, r.y, -12, {dy: -120});
  check(JSON.stringify(await tasks()) === JSON.stringify(t0), 'a vertical drag does not delete');

  r = await rowBox('Tasks', 2);
  const done0 = await page.evaluate(() => PDRAFT.tasks[2].done);
  await touchSwipe(cdp, page, r.x + 14, r.y, -r.w * 0.2);
  check(await page.evaluate(() => PDRAFT.tasks[2].done) === done0, 'a swipe starting on the checkbox does not toggle it');

  await page.focus('.grip[data-list="tasks"][data-i="2"]'); await page.keyboard.press('Delete');
  check((await tasks()).length === t0.length - 1, 'Delete key on a focused handle removes the item');
  await page.click('.toast-act'); await page.waitForTimeout(200);

  await page.click('[data-act=pAddPart]'); await page.fill('[data-pp=name] >> nth=-1', 'Doomed part');
  r = await rowBox('Parts', 0);
  await touchSwipe(cdp, page, r.x + r.w - 20, r.y, -r.w * 0.7);
  check(await page.evaluate(() => PDRAFT.parts.length) === 0, 'parts swipe to delete');

  // the other "line-crossing" moments keep their visual cue
  await page.evaluate(() => { $('#sheet').scrollTop = 0; });
  const hy = await page.$eval('.grab-zone', e => e.getBoundingClientRect().top + 10);
  let willClose;
  await touchDrag(cdp, page, 195, hy, 260, {stepMs: 30, beforeRelease: async () => { willClose = await page.evaluate(() => $('#sheet').classList.contains('will-close')); }});
  check(willClose, 'pull-to-close: handle turns red once letting go will close');

  await page.goto(base + '#/v/v-roci/log'); await page.waitForTimeout(300);
  await page.fill('#dPpg', '2.99'); await page.click('[data-act=saveEntry]'); await page.waitForTimeout(200);
  check((await page.textContent('#toast')).includes('Odometer is needed'), 'blocked save explains why');
  await page.fill('#dOdo', '124900'); await page.fill('#dGal', '10'); await page.click('[data-act=saveEntry]'); await page.waitForTimeout(250);
  check(/Saved|Entry saved/.test(await page.textContent('#toast')), 'fill-up saved confirmation');

  await page.evaluate(() => { const it = DATA.schedule.find(s => s.id === 's-r001'); it.lastMi = 110000; it.lastDate = '2024-01-01'; save(); });
  await page.goto(base + '#/v/v-roci/mx'); await page.waitForTimeout(300);
  await page.click('button[data-act=addService] >> nth=0');
  await page.fill('#mTitle', 'Tire rotation'); await page.fill('#mOdo', '124900'); await page.selectOption('#mSched', {label: 'Tire rotation'});
  await page.click('[data-act=saveService]'); await page.waitForTimeout(250);
  check((await page.textContent('#toast')).includes('is current'), 'a service that clears an overdue item says so');

  // haptics are shelved: nothing fires, nothing is injected
  await page.evaluate(() => { Haptics.tap(); Haptics.success(); Haptics.error(); Haptics.threshold(); });
  check(await page.evaluate(() => Haptics.log.length === 0 && window.__vibes === 0), 'haptics shelved: no vibration calls anywhere');
  check(await page.evaluate(() => !document.getElementById('hapticSwitch')), 'haptics shelved: no hidden switch added to the page');
  await page.goto(base); await page.click('[data-act=settings] >> nth=0'); await page.waitForTimeout(200);
  check(await page.locator('#hapOn').count() === 0, 'haptics setting hidden while shelved');
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.join('; ') : ''));
  await page.context().close();
};
