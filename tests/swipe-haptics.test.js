/* Swipe-to-delete on project tasks/parts, and the six haptic moments
   (Android vibrate path and the iPhone switch-tick path). */
const {fixture, newPage, loadData, touchDrag, touchSwipe, shot} = require('./helpers');

module.exports = async ({browser, base, check}) => {
  const {page, cdp, errors} = await newPage(browser, base);
  page.on('dialog', d => d.accept());
  await loadData(page, fixture('seed.json'), '#/v/v-roci/projects');
  const hlog = () => page.evaluate(() => Haptics.log.slice());
  const resetLog = () => page.evaluate(() => { Haptics.log.length = 0; });
  const tasks = () => page.evaluate(() => PDRAFT.tasks.map(t => t.t));
  const rowBox = (list, i) => page.$eval(`#j${list} .swipe-row[data-i="${i}"]`, e => { e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return {x: r.left, y: r.top + r.height / 2, w: r.width}; });

  await page.click('.pcard >> text=Head unit wiring'); await page.waitForTimeout(400);
  check(await page.locator('#jTasks .x, #jParts .x, [data-act=pDelTask], [data-act=pDelPart]').count() === 0, 'no X buttons on tasks or parts');
  const t0 = await tasks();

  // partial swipe: banner shows, snaps back, nothing deleted, no threshold tick
  await resetLog(); let r = await rowBox('Tasks', 0);
  let midState;
  await touchSwipe(cdp, page, r.x + r.w - 20, r.y, -r.w * 0.3, {beforeRelease: async () => {
    midState = await page.evaluate(() => { const w = $('#jTasks .swipe-row[data-i="0"]'); return {swiping: w.classList.contains('swiping'), armed: w.classList.contains('armed'), label: w.querySelector('.swipe-bg b').textContent}; });
    await shot(page, 'swipe-01-partial', false);
  }});
  check(midState.swiping && !midState.armed && midState.label === 'Delete', 'a partial swipe reveals the red Delete banner');
  check(JSON.stringify(await tasks()) === JSON.stringify(t0), 'releasing before halfway snaps back without deleting');
  check(await page.evaluate(() => { const w = $('#jTasks .swipe-row[data-i="0"]'); return !w.classList.contains('swiping') && !w.querySelector('.row-edit').style.transform; }), 'row returns to rest');
  check(!(await hlog()).includes('threshold'), 'no haptic before the halfway point');

  // full swipe: arms at halfway (one tick), deletes on release, Undo restores
  await resetLog(); r = await rowBox('Tasks', 0);
  await touchSwipe(cdp, page, r.x + r.w - 20, r.y, -r.w * 0.7, {beforeRelease: async () => {
    midState = await page.evaluate(() => { const w = $('#jTasks .swipe-row[data-i="0"]'); return {armed: w.classList.contains('armed'), label: w.querySelector('.swipe-bg b').textContent}; });
    await shot(page, 'swipe-02-armed', false);
  }});
  check(midState.armed && midState.label === 'Release to delete', 'past halfway the banner arms: "Release to delete"');
  const t1 = await tasks();
  check(JSON.stringify(t1) === JSON.stringify(t0.slice(1)), 'release past halfway deletes the task');
  const log1 = await hlog();
  check(log1.filter(k => k === 'threshold').length === 1 && log1.includes('success'), `haptics: one tick at halfway, one on delete (${log1.join(', ')})`);
  check((await page.textContent('#toast')).includes('Undo'), 'toast offers Undo');
  await page.click('.toast-act'); await page.waitForTimeout(250);
  check(JSON.stringify(await tasks()) === JSON.stringify(t0), 'Undo puts it back in the same spot');

  // past halfway, then back: no delete
  r = await rowBox('Tasks', 1);
  const back = []; for (let k = 1; k <= 10; k++) back.push([-r.w * 0.07 * k, 0]); for (let k = 1; k <= 6; k++) back.push([-r.w * 0.7 + r.w * 0.08 * k, 0]);
  await touchSwipe(cdp, page, r.x + r.w - 20, r.y, 0, {path: back});
  check(JSON.stringify(await tasks()) === JSON.stringify(t0), 'dragging back under halfway before letting go cancels');

  // vertical drag on a row is a scroll, not a swipe
  r = await rowBox('Tasks', 1);
  await touchSwipe(cdp, page, r.x + r.w / 2, r.y, -12, {dy: -120});
  check(JSON.stringify(await tasks()) === JSON.stringify(t0), 'a vertical drag does not delete');

  // a swipe that starts on the checkbox must not toggle it
  r = await rowBox('Tasks', 2);
  const done0 = await page.evaluate(() => PDRAFT.tasks[2].done);
  await touchSwipe(cdp, page, r.x + 14, r.y, -r.w * 0.2);
  check(await page.evaluate(() => PDRAFT.tasks[2].done) === done0, 'swipe starting on the checkbox does not toggle it');

  // keyboard path: Delete on a focused handle
  await page.focus('.grip[data-list="tasks"][data-i="2"]'); await page.keyboard.press('Delete');
  check((await tasks()).length === t0.length - 1, 'Delete key on a focused handle removes the item');
  await page.click('.toast-act'); await page.waitForTimeout(200);

  // parts swipe too
  await page.click('[data-act=pAddPart]'); await page.fill('[data-pp=name] >> nth=-1', 'Doomed part');
  r = await rowBox('Parts', 0);
  await touchSwipe(cdp, page, r.x + r.w - 20, r.y, -r.w * 0.7);
  check(await page.evaluate(() => PDRAFT.parts.length) === 0, 'parts swipe to delete');

  // haptic moments
  await resetLog();
  await page.click('[data-act=pTaskDone][data-i="0"]');
  check((await hlog()).includes('success'), 'checking off a task: success tick');
  await resetLog();
  const g = await page.$eval('.grip[data-list="tasks"][data-i="0"]', e => { const b = e.getBoundingClientRect(); return {x: b.left + b.width / 2, y: b.top + b.height / 2}; });
  const step = await page.evaluate(() => { const r = $$('#jTasks .swipe-row'); return r[1].getBoundingClientRect().top - r[0].getBoundingClientRect().top; });
  await touchDrag(cdp, page, g.x, g.y, step * 2 + 4, {hold: 400, steps: 12});
  const lr = await hlog();
  check(lr[0] === 'tap' && lr.filter(k => k === 'step').length === 2, `reorder: tick on lift, light tick per slot (${lr.join(', ')})`);

  await page.evaluate(() => { $('#sheet').scrollTop = 0; }); await resetLog();
  const hy = await page.$eval('.grab-zone', e => e.getBoundingClientRect().top + 10);
  let willClose;
  await touchDrag(cdp, page, 195, hy, 260, {stepMs: 30, beforeRelease: async () => { willClose = await page.evaluate(() => $('#sheet').classList.contains('will-close')); }});
  check(willClose && (await hlog()).includes('threshold'), 'pull-to-close: tick + red handle once letting go will close');

  await page.goto(base + '#/v/v-roci/log'); await page.waitForTimeout(300); await resetLog();
  await page.fill('#dPpg', '2.99'); await page.click('[data-act=saveEntry]'); await page.waitForTimeout(200);
  check((await hlog()).includes('error'), 'blocked save (no odometer): double tick');
  await resetLog(); await page.fill('#dOdo', '124900'); await page.fill('#dGal', '10'); await page.click('[data-act=saveEntry]'); await page.waitForTimeout(250);
  check((await hlog()).includes('success'), 'saving a fill-up: success tick');

  await page.evaluate(() => { const it = DATA.schedule.find(s => s.id === 's-r001'); it.lastMi = 110000; it.lastDate = '2024-01-01'; save(); });
  await page.goto(base + '#/v/v-roci/mx'); await page.waitForTimeout(300); await resetLog();
  await page.click('button[data-act=addService] >> nth=0');
  await page.fill('#mTitle', 'Tire rotation'); await page.fill('#mOdo', '124900'); await page.selectOption('#mSched', {label: 'Tire rotation'});
  await page.click('[data-act=saveService]'); await page.waitForTimeout(250);
  check((await hlog()).includes('success') && (await page.textContent('#toast')).includes('is current'), 'service that clears an overdue item: success tick');

  await page.goto(base + '#/v/v-roci/projects'); await page.waitForTimeout(300); await resetLog();
  await page.click('.pcard >> text=Restore headlights'); await page.click('[data-act=finishProject]'); await page.waitForTimeout(300);
  check((await hlog()).includes('success'), 'marking a project done: success tick');

  await page.evaluate(() => { Haptics.setEnabled(false); Haptics.log.length = 0; Haptics.success(); Haptics.error(); });
  check((await hlog()).length === 0, 'haptics can be turned off (Settings → This device)');
  await page.evaluate(() => Haptics.setEnabled(true));
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.join('; ') : ''));
  await page.context().close();

  // iPhone path: no navigator.vibrate -> hidden <input switch> is toggled
  const ios = await newPage(browser, base);
  await ios.page.addInitScript(() => { Object.defineProperty(Navigator.prototype, 'vibrate', {value: undefined, configurable: true}); });
  await ios.page.reload(); await ios.page.waitForTimeout(300);
  const res = await ios.page.evaluate(async () => {
    Haptics.success();
    const sw = document.getElementById('hapticSwitch'); let flips = 0;
    sw.addEventListener('change', () => flips++);
    Haptics.error(); await new Promise(r => setTimeout(r, 200));
    return {hasSwitch: sw.hasAttribute('switch') && sw.type === 'checkbox', flips, hidden: getComputedStyle(sw.parentElement).opacity === '0'};
  });
  check(res.hasSwitch && res.hidden, 'iPhone: uses a hidden <input type="checkbox" switch>');
  check(res.flips === 2, `iPhone: error is a double tick (${res.flips} toggles)`);
  await ios.page.context().close();
};
