/* Hero photo crop: pick → crop dialog (drag, zoom, reset, cancel) → 2:1 result; re-adjust later from the kept original. */
const path = require('path');
const {fixture, newPage, loadData, shot, ROOT} = require('./helpers');

module.exports = async ({browser, base, check}) => {
  const {page, errors} = await newPage(browser, base, {touch: false});
  await loadData(page, fixture('seed.json'), '#/v/v-roci/log');
  const dims = u => page.evaluate(src => new Promise(r => { const i = new Image(); i.onload = () => r([i.naturalWidth, i.naturalHeight]); i.src = src; }), u);

  await page.click('[data-act=editVehicle]'); await page.waitForTimeout(300);
  await page.setInputFiles('#vPhoto', path.join(ROOT, 'icons', 'icon-512.png')); await page.waitForTimeout(500);
  check(await page.locator('.cropper .crop-frame').count() === 1, 'picking a photo opens the crop dialog');
  const fr = await page.$eval('.crop-frame', e => { const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height}; });
  check(Math.abs(fr.w / fr.h - 2) < 0.02, 'crop frame is 2:1');
  const t0 = await page.$eval('.crop-frame img', i => i.style.transform);
  await page.mouse.move(fr.x + fr.w / 2, fr.y + fr.h / 2); await page.mouse.down(); await page.mouse.move(fr.x + fr.w / 2, fr.y + fr.h / 2 + 60, {steps: 6}); await page.mouse.up();
  check(await page.$eval('.crop-frame img', i => i.style.transform) !== t0, 'dragging moves the photo');
  await page.$eval('.crop-zoom input', i => { i.value = 2; i.dispatchEvent(new Event('input')); });
  check(await page.$eval('.crop-frame img', i => parseFloat(i.style.width)) > fr.w * 1.9, 'zoom slider enlarges the photo');
  const covers = await page.evaluate(() => { const f = $('.crop-frame').getBoundingClientRect(), i = $('.crop-frame img').getBoundingClientRect(); return i.left <= f.left + 0.5 && i.top <= f.top + 0.5 && i.right >= f.right - 0.5 && i.bottom >= f.bottom - 0.5; });
  check(covers, 'the photo always covers the frame (no empty edges)');
  await page.mouse.move(fr.x + 10, fr.y + 10); await page.mouse.down(); await page.mouse.move(fr.x + fr.w, fr.y + fr.h, {steps: 6}); await page.mouse.up();
  check(await page.evaluate(() => { const f = $('.crop-frame').getBoundingClientRect(), i = $('.crop-frame img').getBoundingClientRect(); return i.left <= f.left + 0.5 && i.top <= f.top + 0.5; }), 'dragging past the edge stops at the edge');
  await shot(page, 'crop-01-dialog', false);
  await page.click('.cropper [data-c=ok]'); await page.waitForTimeout(300);
  check(await page.locator('.cropper').count() === 0 && await page.locator('#vPhotoPrev img').count() === 1, 'Use photo closes the dialog and previews the crop');
  check(JSON.stringify(await dims(await page.evaluate(() => NEWPHOTO))) === '[1280,640]', 'crop result is 1280×640');
  await page.click('[data-act=saveVehicle]'); await page.waitForTimeout(400);
  check(await page.evaluate(() => !!PHOTOS['v-roci'] && !!PHOTO_SRC['v-roci'] && SYNC.photoDirty.includes('v-roci')), 'saved photo queued for sync; original kept on device');

  await page.click('[data-act=editVehicle]'); await page.waitForTimeout(300);
  check(await page.locator('[data-act=vCrop]').isVisible(), 'a saved photo can be adjusted again');
  await page.click('[data-act=vCrop]'); await page.waitForTimeout(400);
  check(JSON.stringify(await dims(await page.$eval('.crop-frame img', i => i.src))) === '[512,512]', 're-adjusting starts from the uncropped original');
  const before = await page.evaluate(() => PHOTOS['v-roci']);
  await page.keyboard.press('Escape'); await page.waitForTimeout(200);
  check(await page.locator('.cropper').count() === 0 && await page.evaluate(() => $('#sheet').classList.contains('open')), 'Escape cancels the crop without closing the vehicle sheet');
  check(await page.evaluate(() => NEWPHOTO) === null && await page.evaluate(() => PHOTOS['v-roci']) === before, 'cancel changes nothing');
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.join('; ') : ''));
  await page.context().close();
};
