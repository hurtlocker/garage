/* iOS zooms the page when a focused field is under 16px. Check every input/select/textarea
   on every screen and editor. */
const {fixture, newPage, loadData} = require('./helpers');

module.exports = async ({browser, base, check}) => {
  const {page, errors} = await newPage(browser, base, {touch: false});
  await loadData(page, fixture('seed.json'));
  const bad = []; let n = 0;
  const scan = async where => {
    await page.waitForTimeout(150);
    const r = await page.evaluate(() => [...document.querySelectorAll('input:not([type=file]),select,textarea')]
      .filter(e => e.offsetParent || e.closest('.sheet.open')).map(e => [e.id || e.dataset.pp || e.dataset.pt || e.tagName, parseFloat(getComputedStyle(e).fontSize)]));
    n += r.length; r.filter(x => x[1] < 16).forEach(x => bad.push(`${where}:${x[0]}=${x[1]}px`));
  };
  const sheet = async (sel, where) => { await page.click(sel); await scan(where); await page.evaluate(() => closeSheet()); await page.waitForTimeout(250); };
  await sheet('[data-act=settings] >> nth=0', 'settings');
  await sheet('[data-act=addVehicle]', 'register');
  await page.goto(base + '#/v/v-roci/log'); await scan('log');
  await page.click('[data-k=fuelOn]'); await page.fill('#dOdo', '124300'); await page.fill('#dNote', 'x'); await page.click('[data-act=saveEntry]');
  await sheet('[data-act=editEntry]', 'editEntry');
  await page.goto(base + '#/v/v-roci/mx');
  await sheet('.due >> nth=0', 'schedule'); await sheet('button[data-act=addService]', 'service');
  await page.click('[data-act=mxView][data-k=specs]');
  await sheet('[data-act=editSpec] >> nth=1', 'spec'); await sheet('[data-act=editDocs] >> nth=0', 'docs');
  await page.goto(base + '#/v/v-roci/projects');
  await page.click('.pcard >> text=Fix sloppy shifter'); await page.click('[data-act=pAddTask]'); await scan('project');
  check(n > 60, `${n} form controls checked`);
  check(!bad.length, 'all form controls are 16px or larger' + (bad.length ? ': ' + bad.join(', ') : ''));
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.join('; ') : ''));
  await page.context().close();
};
