/* Shared test helpers: static server, browser pages, mock GitHub, touch gestures. */
const fs = require('fs'), path = require('path'), http = require('http');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(__dirname, 'output');
const fixture = name => JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', name), 'utf8'));

/** Serve the app folder on a random local port. */
function serve() {
  const types = {'.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png'};
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p.endsWith('/')) p += 'index.html';
      const f = path.join(ROOT, p);
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, {'Content-Type': types[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store'});
      fs.createReadStream(f).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

/** A fresh phone-sized page (own IndexedDB). Fonts are blocked so tests run offline. */
async function newPage(browser, base, {touch = true} = {}) {
  const ctx = await browser.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, hasTouch: touch, isMobile: touch, serviceWorkers: 'block'});
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto(base);
  const cdp = touch ? await ctx.newCDPSession(page) : null;
  return {ctx, page, cdp, errors};
}

/** Put data straight into the app's IndexedDB and reload (the app migrates/normalizes on load). */
async function loadData(page, data, hash = '') {
  await page.evaluate(async d => { await idbPut('data', d); }, data);
  if (hash) await page.evaluate(h => { location.hash = h; }, hash);
  await page.reload(); await page.waitForTimeout(400);
}

/** In-memory GitHub Contents API for hurtlocker/garage-data. Returns the repo map: path -> {sha, content(base64)}. */
async function mockGitHub(page, repo = {}) {
  let n = 1;
  await page.route('https://api.github.com/**', async route => {
    const req = route.request(), p = new URL(req.url()).pathname;
    const json = (status, body) => route.fulfill({status, contentType: 'application/json', body: JSON.stringify(body)});
    if (p === '/repos/hurtlocker/garage-data') return json(200, {private: true, default_branch: 'main'});
    const m = p.match(/^\/repos\/hurtlocker\/garage-data\/contents\/(.+)$/);
    if (!m) return json(404, {});
    const file = decodeURIComponent(m[1]);
    if (req.method() === 'GET') return repo[file] ? json(200, {sha: repo[file].sha, content: repo[file].content}) : json(404, {});
    if (req.method() === 'PUT') {
      const b = JSON.parse(req.postData());
      if (repo[file] && b.sha !== repo[file].sha) return json(409, {message: 'sha mismatch'});
      repo[file] = {sha: 'sha' + n++, content: b.content};
      return json(200, {content: {sha: repo[file].sha}});
    }
    return json(405, {});
  });
  return repo;
}
const b64 = o => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64');
const unb64 = s => Buffer.from(s, 'base64').toString();

/** Connect the app to the mock repo through the Settings sheet. */
async function connect(page) {
  await page.click('[data-act=settings] >> nth=0');
  await page.fill('#cTok', 'github_pat_TEST');
  await page.click('[data-act=connect]');
  await page.waitForTimeout(800);
}

/** Touch gesture via CDP: press at (x, y), optionally hold, move by dy in steps, release. */
async function touchDrag(cdp, page, x, y, dy, {hold = 0, steps = 10, stepMs = 20, beforeRelease} = {}) {
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y}]});
  if (hold) await page.waitForTimeout(hold);
  for (let k = 1; k <= steps; k++) {
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x, y: y + dy * k / steps}]});
    await page.waitForTimeout(stepMs);
  }
  if (beforeRelease) await beforeRelease();
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
  await page.waitForTimeout(400);
}

/** Horizontal (or any-direction) touch drag: press at (x, y), move by (dx, dy) in steps, release. */
async function touchSwipe(cdp, page, x, y, dx, {dy = 0, hold = 0, steps = 12, stepMs = 18, beforeRelease, path} = {}) {
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y}]});
  if (hold) await page.waitForTimeout(hold);
  const pts = path || Array.from({length: steps}, (_, k) => [dx * (k + 1) / steps, dy * (k + 1) / steps]);
  for (const [mx, my] of pts) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: x + mx, y: y + my}]}); await page.waitForTimeout(stepMs); }
  if (beforeRelease) await beforeRelease();
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
  await page.waitForTimeout(450);
}

const shot = (page, name, full = true) => page.screenshot({path: path.join(OUT, name + '.png'), fullPage: full});

module.exports = {ROOT, OUT, fixture, serve, newPage, loadData, mockGitHub, connect, touchDrag, touchSwipe, shot, b64, unb64};
