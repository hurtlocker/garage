/* Specs page: Quick reference vs. "All other specs", moving items between them,
   and inbox updates respecting placement. Uses the service-manual specs patch fixture. */
const {fixture, newPage, loadData, shot} = require('./helpers');

module.exports = async ({browser, base, check}) => {
  const {page, errors} = await newPage(browser, base);
  await page.evaluate(async ({d, p}) => { DATA = Object.assign(EMPTY(), d); applyPatch(p); await idbPut('data', DATA); }, {d: fixture('seed.json'), p: fixture('fsm-specs-patch.json')});
  await loadData(page, await page.evaluate(() => DATA), '#/v/v-roci/mx');
  await page.click('[data-act=mxView][data-k=specs]'); await page.waitForTimeout(250);
  const quickKeys = () => page.$$eval('.lbl + .list .kvrow .k', ks => ks.map(k => k.textContent.trim()));
  const q0 = await quickKeys();
  check(q0.length === 11 && q0[0] === 'Engine oil' && q0[1] === 'Oil capacity' && q0.includes('Tire pressure') && q0.includes('Wipers (D / P)'), 'Quick reference shows the 11 defaults in priority order');
  check(await page.isHidden('#moreSpecs'), '"All other specs" starts collapsed');
  check((await page.textContent('.more-toggle')).includes('26'), 'drop-down shows how many specs it hides');
  await shot(page, 'specs-01-collapsed');

  await page.click('.more-toggle');
  check(await page.isVisible('#moreSpecs') && await page.getAttribute('.more-toggle', 'aria-expanded') === 'true', 'drop-down expands');
  await page.click('#moreSpecs .kvrow button:has-text("Coolant")'); await page.waitForTimeout(300);
  check(await page.getAttribute('#pQ', 'aria-checked') === 'false', 'edit card toggle is off for a non-quick spec');
  await page.click('#pQ'); await page.click('[data-act=saveSpec]'); await page.waitForTimeout(300);
  check((await quickKeys()).includes('Coolant'), 'toggle on moves a spec into Quick reference');
  check(await page.isVisible('#moreSpecs'), 'drop-down stays open across edits');
  await page.click('.lbl + .list .kvrow button:has-text("Spark plugs")'); await page.waitForTimeout(300);
  await page.click('#pQ'); await page.click('[data-act=saveSpec]'); await page.waitForTimeout(300);
  check(!(await quickKeys()).includes('Spark plugs'), 'toggle off moves it under All other specs');

  await page.evaluate(() => applyPatch({id: 't', ops: [
    {op: 'setSpec', vid: 'v-roci', key: 'spark plugs', value: 'new value', source: 'FSM IG-2'},
    {op: 'setSpec', vid: 'v-roci', key: 'Wiper refills', value: '22 / 17 in', source: 'measured', quick: true}]}));
  const after = await page.evaluate(() => V('v-roci').specs.filter(s => ['Spark plugs', 'Wiper refills'].includes(s[0])).map(s => s[3]));
  check(after[0] === false && after[1] === true, 'inbox updates keep the placement (or set it explicitly)');

  await page.evaluate(() => render()); await page.click('[data-act=editSpec][data-i="-1"]'); await page.waitForTimeout(250);
  check(await page.getAttribute('#pQ', 'aria-checked') === 'true', 'new specs default to Quick reference');
  await page.evaluate(() => closeSheet());
  const snap = await page.evaluate(() => buildSnapshot());
  check(snap.includes('**Quick reference**') && snap.indexOf('Engine oil:') < snap.indexOf('**Other specs**'), 'snapshot lists Quick reference first');
  check(await page.evaluate(() => V('v-camry').specs.filter(isQuick).length) >= 3, 'other vehicles get sensible defaults');
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.join('; ') : ''));
  await page.context().close();
};
