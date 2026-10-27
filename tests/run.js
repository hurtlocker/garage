#!/usr/bin/env node
/* Runs every *.test.js in this folder against the app served locally.
   Usage:  node tests/run.js            (all suites)
           node tests/run.js reorder    (suites whose file name contains "reorder")      */
const fs = require('fs'), path = require('path');
const {chromium} = require('playwright');
const {serve, OUT} = require('./helpers');

(async () => {
  const filter = process.argv.slice(2);
  const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.test.js') && (!filter.length || filter.some(x => f.includes(x)))).sort();
  fs.mkdirSync(OUT, {recursive: true});
  const srv = await serve();
  const base = `http://127.0.0.1:${srv.address().port}/`;
  const browser = await chromium.launch();
  let total = 0, failed = 0;
  for (const f of files) {
    console.log(`\n▸ ${f}`);
    let fails = 0;
    const check = (ok, msg) => { total++; if (!ok) { fails++; failed++; } console.log(`  ${ok ? '✓' : '✗'} ${msg}`); };
    try { await require(path.join(__dirname, f))({browser, base, check}); }
    catch (e) { fails++; failed++; total++; console.log(`  ✗ crashed: ${e.message.split('\n')[0]}`); }
    if (fails) console.log(`  → ${fails} failure(s)`);
  }
  await browser.close(); srv.close();
  console.log(`\n${failed ? '✗' : '✓'} ${total - failed}/${total} checks passed across ${files.length} suite(s). Screenshots: tests/output/`);
  process.exit(failed ? 1 : 0);
})();
