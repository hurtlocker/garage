/* App updates must land on the next open, even though GitHub Pages tells browsers to cache
   files for 10 minutes (Cache-Control: max-age=600). Serves a temp copy of the app the way
   Pages does, with the service worker enabled, then "deploys" a new version and reopens. */
const fs = require('fs'), os = require('os'), path = require('path'), http = require('http');
const {ROOT} = require('./helpers');

function copyApp() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'garage-update-'));
  for (const f of fs.readdirSync(ROOT)) {
    if (['tests', '.git', 'node_modules'].includes(f)) continue;
    fs.cpSync(path.join(ROOT, f), path.join(dir, f), {recursive: true});
  }
  return dir;
}
function servePagesLike(dir) {
  const types = {'.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png'};
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
      const f = path.join(dir, p);
      if (!f.startsWith(dir) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
      const body = fs.readFileSync(f), etag = '"' + require('crypto').createHash('md5').update(body).digest('hex') + '"';
      if (req.headers['if-none-match'] === etag) { res.writeHead(304, {ETag: etag, 'Cache-Control': 'max-age=600'}); return res.end(); }
      res.writeHead(200, {'Content-Type': types[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'max-age=600', ETag: etag});
      res.end(body);
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

module.exports = async ({browser, check}) => {
  const dir = copyApp(), srv = await servePagesLike(dir);
  const base = `http://127.0.0.1:${srv.address().port}/`;
  const ctx = await browser.newContext({viewport: {width: 390, height: 844}});   // service workers allowed
  // no ctx.route() here: Playwright disables the HTTP cache whenever routing is on, which would hide this bug
  let page = await ctx.newPage();
  await page.goto(base); await page.waitForTimeout(400);
  await page.evaluate(() => navigator.serviceWorker.ready); await page.reload(); await page.waitForTimeout(500);
  const v0 = await page.evaluate(() => APP_VERSION);
  check(await page.evaluate(() => !!navigator.serviceWorker.controller), 'service worker installed and controlling the app');

  // "deploy" a new version: bump APP_VERSION and the SW cache name, like a real release
  const bump = f => fs.writeFileSync(path.join(dir, f), fs.readFileSync(path.join(dir, f), 'utf8')
    .replace(/APP_VERSION = '[^']+'/, "APP_VERSION = '9.9.9'").replace(/const CACHE = '[^']+'/, "const CACHE = 'garage-test-next'"));
  bump('core.js'); bump('service-worker.js');

  await page.close(); page = await ctx.newPage();                 // close and reopen the app
  await page.goto(base); await page.waitForTimeout(800);
  check(await page.evaluate(() => APP_VERSION) === '9.9.9', `new version shows on the next open, inside the 10-min cache window (was ${v0})`);

  await page.waitForTimeout(800);                                 // new SW installs in the background
  const cached = await page.evaluate(async () => {
    const keys = await caches.keys(); const c = await caches.open(keys.find(k => k === 'garage-test-next') || keys[0]);
    const r = await c.match('./core.js'); return r ? (await r.text()).includes("APP_VERSION = '9.9.9'") : null;
  });
  check(cached === true, 'offline copy holds the new version too (not a stale HTTP-cache copy)');

  await ctx.setOffline(true); await page.reload(); await page.waitForTimeout(500);
  check(await page.evaluate(() => APP_VERSION) === '9.9.9', 'opens offline on the new version');
  await ctx.setOffline(false);

  await ctx.close(); srv.close(); fs.rmSync(dir, {recursive: true, force: true});
};
