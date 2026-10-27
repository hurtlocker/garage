/* Claude inbox: patches apply once, never clobber unsynced phone data, inbox empties,
   bad ops are skipped and reported, other devices' changes are pulled on foreground. */
const {fixture, newPage, mockGitHub, connect, b64, unb64} = require('./helpers');

module.exports = async ({browser, base, check}) => {
  const {page, errors} = await newPage(browser, base, {touch: false});
  const repo = await mockGitHub(page, {'garage-data.json': {sha: 'seed', content: b64(fixture('seed.json'))}});
  await connect(page);

  await page.evaluate(() => { DATA.logs.push({id: 'l-local', vid: 'v-roci', date: today(), odo: 124400, fuel: null, note: 'unsynced', tags: [], projectId: null}); SYNC.dirty = true; });
  const patch = {id: 'test-patch-1', by: 'claude', note: 'Test patch', ops: [
    {op: 'setSpec', vid: 'v-roci', key: 'oil filter', value: 'Subaru 15208AA100', source: 'FSM PM-8'},
    {op: 'setSpec', vid: 'v-roci', key: 'Drain plug torque', value: '32.5 ft-lb', source: 'FSM PM-6'},
    {op: 'upsert', coll: 'schedule', item: {id: 's-test-clutch', vid: 'v-roci', name: 'Clutch fluid', everyMi: 30000, everyMo: 30, action: 'replace', lastMi: null, lastDate: null, source: 'FSM'}},
    {op: 'upsert', coll: 'schedule', item: {id: 's-r000', source: 'checked'}},
    {op: 'updateVehicle', vid: 'v-roci', fields: {body: 'Sedan', evil: 'x'}, docs: {insurer: 'Test Insurer'}},
    {op: 'bogus'},
    {op: 'upsert', coll: 'vehicles', item: {id: 'x'}},
  ]};
  repo['inbox.json'] = {sha: 'inbox1', content: b64({patches: [patch]})};

  await page.evaluate(() => { _lastFg = 0; Object.defineProperty(document, 'visibilityState', {configurable: true, get: () => 'visible'}); document.dispatchEvent(new Event('visibilitychange')); });
  await page.waitForTimeout(1200);
  check((await page.textContent('#toast')).includes('Applied 1 update'), 'returning to the foreground applies the inbox');
  const remote = JSON.parse(unb64(repo['garage-data.json'].content)), roci = remote.vehicles.find(v => v.id === 'v-roci');
  const filter = roci.specs.find(s => s[0].toLowerCase() === 'oil filter');
  check(remote.logs.some(l => l.id === 'l-local'), 'unsynced phone entry survives');
  check(filter[0] === 'Oil filter' && filter[1] === 'Subaru 15208AA100' && filter[2] === 'FSM PM-8', 'setSpec updates value + source and keeps the label as written');
  check(roci.specs.some(s => s[0] === 'Drain plug torque'), 'setSpec adds a new row');
  check(remote.schedule.some(s => s.id === 's-test-clutch'), 'upsert inserts');
  const oil = remote.schedule.find(s => s.id === 's-r000');
  check(oil.source === 'checked' && oil.name === 'Oil & filter' && oil.everyMi === 5000, 'upsert merges without touching other fields');
  check(roci.docs.insurer === 'Test Insurer' && !('evil' in roci), 'docs merge; non-whitelisted fields ignored');
  check(JSON.parse(unb64(repo['inbox.json'].content)).patches.length === 0, 'inbox emptied');
  check(remote.patchLog[0].ok === 5 && remote.patchLog[0].skipped.length === 2, 'patch log: 5 applied, 2 skipped');

  await page.evaluate(() => { V('v-roci').specs.find(s => s[0] === 'Oil filter')[1] = 'user edited'; save(); });
  await page.waitForTimeout(3200);
  repo['inbox.json'] = {sha: 'inbox2', content: b64({patches: [patch]})};
  await page.evaluate(() => foregroundSync()); await page.waitForTimeout(800);
  const r2 = JSON.parse(unb64(repo['garage-data.json'].content));
  check(r2.vehicles.find(v => v.id === 'v-roci').specs.find(s => s[0] === 'Oil filter')[1] === 'user edited', 'a patch id is never applied twice');

  const other = JSON.parse(unb64(repo['garage-data.json'].content));
  other.logs.push({id: 'l-other', vid: 'v-roci', date: '2026-10-26', odo: 124500, fuel: null, note: 'other device', tags: [], projectId: null});
  repo['garage-data.json'] = {sha: 'other', content: b64(other)};
  await page.evaluate(() => foregroundSync()); await page.waitForTimeout(800);
  check(await page.evaluate(() => DATA.logs.some(l => l.id === 'l-other')), "another device's change is pulled on foreground");
  check(unb64(repo['snapshot.md'].content).includes('_(FSM PM-8)_'), 'snapshot shows spec sources');
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.join('; ') : ''));
  await page.context().close();
};
