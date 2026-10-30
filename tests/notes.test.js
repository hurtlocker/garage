/* Long project notes: no sideways overflow, clamped on cards and the watch alert, URLs become links in the sheet. */
const {fixture, newPage, loadData} = require('./helpers');
module.exports = async ({browser, base, check}) => {
  const {page, errors} = await newPage(browser, base, {touch: false});
  const d = fixture('seed.json'), p = d.projects.find(x => x.id === 'p-000');
  p.notes = 'Long notes.\n'.repeat(30) + 'Parts: https://www.rockauto.com/en/catalog/subaru,2011,impreza,2.5l+h4,1447459,transmission-manual,clutch+kit,1993 and https://claude.ai/artifact/TESTARTIFACT';
  await loadData(page, d, '#/v/v-roci/log');
  check(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) === 0, 'a long URL in a watch item does not push the Log page sideways');
  check(await page.$eval('.alert .a-s', e => e.getBoundingClientRect().height) < 60, 'watch alert shows at most two lines of notes');
  await page.goto(base + '#/v/v-roci/projects'); await page.waitForTimeout(200);
  check(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) === 0, 'project list does not scroll sideways');
  check(await page.$eval('.pcard.hot .n, .pcard .n', e => e.getBoundingClientRect().height) < 80, 'project card shows at most three lines of notes');
  await page.click('.pcard >> nth=0'); await page.waitForTimeout(300);
  const links = await page.$$eval('.note-links a', as => as.map(a => [a.getAttribute('href'), a.target]));
  check(links.length === 2 && links.every(l => l[1] === '_blank') && links[1][0] === 'https://claude.ai/artifact/TESTARTIFACT', 'URLs in notes show as links under the notes field');
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.join('; ') : ''));
  await page.context().close();
};
