/* Stats edge cases: prior-owner service records, a finished project's MX record, and the monthly spend axis. */
const {fixture, newPage, loadData} = require('./helpers');

module.exports = async ({browser, base, check}) => {
  const {page, errors} = await newPage(browser, base, {touch: false});
  const d = fixture('seed.json'), v = d.vehicles.find(x => x.id === 'v-roci');
  const t = new Date(), iso = x => x.toISOString().slice(0, 10), mAgo = n => { const x = new Date(t); x.setDate(1); x.setMonth(x.getMonth() - n); return iso(x); };
  v.purchaseDate = mAgo(3); v.purchaseMi = 124000;
  d.services.push({id: 'm-prior1', vid: 'v-roci', date: '2017-06-20', odo: 83129, title: 'Oil change (prior owner)', type: 'Oil', parts: 0, labor: 0},
    {id: 'm-prior2', vid: 'v-roci', date: mAgo(5), odo: 121892, title: 'Tires (prior owner)', type: 'Tires', parts: 0, labor: 0},
    {id: 'm-proj', vid: 'v-roci', date: mAgo(1), odo: 124500, title: 'Fix fuel pump leak', type: 'Other', parts: 140, labor: 25, projectId: 'p-000'});
  d.projects.find(p => p.id === 'p-000').parts = [{name: 'Fuel pump', cost: 140, have: true, date: mAgo(1)}];
  d.logs.push({id: 'l-s1', vid: 'v-roci', date: mAgo(1), odo: 124600, fuel: {grade: '87', ppg: 3, gal: 10, total: 30, full: true}, note: '', tags: [], projectId: null});
  await loadData(page, d, '#/v/v-roci/stats');
  const s = await page.evaluate(() => { const a = stats('v-roci', 'all'), h = stats('v-roci', '6m'); return {proj: a.projSpend, mx: a.mxSpend, total: a.total, months: Object.keys(a.months), miles6: h.miles}; });
  check(s.proj === 140 && s.mx === 25 && s.total === 195, `finished project's parts counted once (projects ${s.proj}, MX ${s.mx})`);
  check(!s.months.some(m => m < v.purchaseDate.slice(0, 7)), `no spend months from before purchase (${s.months.join(', ')})`);
  check(s.miles6 === 124600 - 124172, `prior-owner odometer readings don't inflate miles driven (${s.miles6})`);
  await page.click('[data-act=range][data-k=all]'); await page.waitForTimeout(150);
  const labels = await page.$$eval('.chart[aria-label^="Monthly"] text', ts => ts.map(x => x.textContent).filter(x => /^[A-Z][a-z]{2}$/.test(x)));
  const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], exp = [1, 0].map(n => MON[(t.getMonth() - n + 12) % 12]);
  check(JSON.stringify(labels) === JSON.stringify(exp), `spend chart shows consecutive months from the first spending to now (${labels.join(' ')})`);
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.join('; ') : ''));
  await page.context().close();
};
