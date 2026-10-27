/* End-to-end: connect & pull, log fill-ups (MPG math), MX baseline + service, docs alert,
   project edit, stats, push to repo, persistence, vehicle registration with photo, layout width. */
const path = require('path');
const {fixture, newPage, mockGitHub, connect, shot, b64, unb64, ROOT} = require('./helpers');

module.exports = async ({browser, base, check}) => {
  const {page, errors} = await newPage(browser, base, {touch: false});
  const repo = await mockGitHub(page, {'garage-data.json': {sha: 'seed', content: b64(fixture('seed.json'))}});
  await shot(page, 'core-00-empty');

  await connect(page);
  check(await page.evaluate(() => DATA.vehicles.length) === 3, 'connect on an empty device pulls the repo');
  check(JSON.stringify(await page.$$eval('.vcard .plate:not(.vin), .vrow .plate:not(.vin)', ps => ps.map(p => p.textContent))) === JSON.stringify(['ROCI000', 'CAMRY00', 'JEEP000']), 'every vehicle card shows its plate');
  await page.evaluate(() => { window.__clip = []; navigator.clipboard.writeText = t => (window.__clip.push(t), Promise.resolve()); });
  check(JSON.stringify(await page.$$eval('.plate.vin', ps => ps.map(p => p.dataset.v))) === JSON.stringify(['TESTVIN00000ROCI1', 'TESTVIN000COMPASS']), 'VIN badges shown (and skipped when blank)');
  await page.click('.vrow .plate:not(.vin) >> nth=0'); await page.waitForTimeout(150);
  check(await page.evaluate(() => location.hash) === '' || await page.evaluate(() => location.hash) === '#/', 'tapping a plate does not open the vehicle');
  check(await page.$eval('.vrow .plate:not(.vin)', e => e.classList.contains('copied')) && (await page.textContent('#toast')).includes('Plate copied'), 'plate tap shows the Copied cue and toast');
  await shot(page, 'core-01b-copied');
  await page.click('.vcard .plate.vin'); await page.waitForTimeout(150);
  check(JSON.stringify(await page.evaluate(() => window.__clip)) === JSON.stringify(['CAMRY00', 'TESTVIN00000ROCI1']), 'plate and VIN copied to the clipboard');
  await page.waitForTimeout(1400);
  check(await page.$$eval('.plate.copied', e => e.length) === 0, 'Copied cue clears itself');
  await shot(page, 'core-01-home');

  await page.click('[data-act=openV][data-vid=v-roci]');
  const fill = async (date, odo, ppg, gal, full = true) => {
    await page.fill('#dDate', date); await page.fill('#dOdo', String(odo));
    await page.fill('#dPpg', String(ppg)); await page.fill('#dGal', String(gal));
    if ((await page.getAttribute('[data-k=full]', 'aria-checked') === 'true') !== full) await page.click('[data-k=full]');
    await page.click('[data-act=saveEntry]'); await page.waitForTimeout(250);
    return page.textContent('#toast');
  };
  await fill('2026-10-12', 124230, 2.95, 10.1);
  check((await fill('2026-10-18', 124511, 2.89, 10.6)).includes('26.5'), 'full-to-full MPG: 281 mi / 10.6 gal = 26.5');
  await fill('2026-10-22', 124640, 2.99, 4.2, false);
  check((await fill('2026-10-25', 124790, 2.85, 6.1)).includes('27.1'), 'partial fill rolls into next full: 279 mi / 10.3 gal = 27.1');

  await page.click('[data-k=fuelOn]'); await page.fill('#dOdo', '124795');
  await page.fill('#dNote', 'Faint fuel smell near rear seat after fill-up.');
  await page.click('[data-act=dTag][data-t=Leak]'); await page.click('[data-act=dWatch]');
  await page.click('[data-act=saveEntry]'); await page.waitForTimeout(250);
  check(await page.evaluate(() => DATA.logs.some(l => l.projectId === 'p-000' && l.tags.includes('Leak'))), 'note saved with tag and linked to the watch item');
  await shot(page, 'core-02-log');

  await page.click('a.tab[href$="/mx"]');
  await page.click('.due >> text=Oil & filter');
  await page.click('[data-act=fillLast] >> text=At purchase'); await page.click('[data-act=saveSched]'); await page.waitForTimeout(200);
  await page.click('button[data-act=addService]');
  await page.fill('#mTitle', 'Tire rotation'); await page.fill('#mOdo', '124790');
  await page.selectOption('#mSched', {label: 'Tire rotation'}); await page.fill('#mLabor', '25');
  await page.click('[data-act=saveService]'); await page.waitForTimeout(200);
  check(await page.evaluate(() => DATA.schedule.find(s => s.id === 's-r001').lastMi) === 124790, 'logging a service resets its schedule item');

  await page.click('[data-act=mxView][data-k=specs]');
  await page.click('[data-act=editDocs] >> nth=0');
  const d = new Date(); d.setDate(d.getDate() + 12);
  await page.fill('#oReg', d.toISOString().slice(0, 10)); await page.click('[data-act=saveDocs]'); await page.waitForTimeout(200);
  check(await page.evaluate(() => badgeCount('v-roci')) === 1, 'registration due in 12 days raises the MX badge');
  await page.click('[data-act=mxView][data-k=due]'); await shot(page, 'core-03-mx');

  await page.click('a.tab[href$="/projects"]');
  await page.click('.pcard >> text=Head unit wiring');
  await page.click('[data-act=pAddPart]');
  await page.fill('[data-pp=name] >> nth=-1', 'Backup camera kit'); await page.fill('[data-pp=cost] >> nth=-1', '39.99');
  await page.click('[data-act=pPartHave] >> nth=-1');
  await page.click('[data-act=saveProject]'); await page.waitForTimeout(200);
  check(await page.evaluate(() => DATA.projects.find(p => p.title === 'Head unit wiring').parts[0].cost) === 39.99, 'project part saved');

  await page.click('a.tab[href$="/stats"]'); await page.click('[data-act=range][data-k=all]');
  check(JSON.stringify(await page.evaluate(() => fuelSeries('v-roci').map(x => +x.mpg.toFixed(2)))) === '[26.51,27.09]', 'stats MPG series');
  await shot(page, 'core-04-stats');

  await page.click('a.back'); await page.waitForTimeout(3500);           // debounced push
  const remote = JSON.parse(unb64(repo['garage-data.json'].content));
  check(remote.logs.length === 12 && remote.services.length === 17, `pushed to repo (logs ${remote.logs.length}, services ${remote.services.length})`);
  check(!!repo['snapshot.md'] && unb64(repo['snapshot.md'].content).includes('## Rocinante'), 'snapshot.md written');
  check(await page.evaluate(() => SYNC.dirty) === false, 'clean after push');

  await page.reload(); await page.waitForTimeout(600);
  check(await page.evaluate(() => DATA.logs.length) === 12, 'data persists across reload (IndexedDB)');

  await page.click('[data-act=addVehicle]');
  await page.setInputFiles('#vPhoto', path.join(ROOT, 'icons', 'icon-512.png')); await page.waitForTimeout(400);
  await page.fill('#vNick', 'Test Car'); await page.fill('#vModel', 'CRX'); await page.fill('#vOdo', '50000');
  await page.click('[data-act=saveVehicle]'); await page.waitForTimeout(3500);
  check(/#\/v\/v-/.test(await page.evaluate(() => location.hash)), 'register vehicle opens it');
  check(Object.keys(repo).some(k => k.startsWith('photos/')), 'hero photo uploaded to repo');

  for (const w of [320, 390, 768]) {
    await page.setViewportSize({width: w, height: 800});
    await page.goto(base + '#/v/v-roci/log'); await page.waitForTimeout(300);
    check(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth) === 0, `no horizontal scroll at ${w}px`);
  }
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.join('; ') : ''));
  await page.context().close();
};
