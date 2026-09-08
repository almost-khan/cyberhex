'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../public');
const origin = 'https://almostkhan.me';

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}
function read(file) { return fs.readFileSync(path.join(root, file), 'utf8'); }
const files = walk(root);
const pages = files.filter(file => file.endsWith('.html'));
assert(pages.length > 0, 'No HTML pages generated');
for (const required of ['index.html', 'about/index.html', 'tags/index.html', 'categories/index.html', 'archives/index.html', 'new-zealand/index.html',
  '2025/06/29/viewcontroller-containment/index.html', '2026/03/25/optimizing-images/index.html']) {
  assert(read(required).trim(), `${required} is empty`);
}
for (const file of pages) {
  const html = fs.readFileSync(file, 'utf8');
  const relative = path.relative(root, file).split(path.sep).join('/');
  assert(/<html\b/.test(html) && /<body\b/.test(html), `${relative}: empty or invalid HTML`);
  assert(/<link rel="canonical" href="https:\/\/almostkhan\.me\//.test(html), `${relative}: missing HTTPS canonical`);
  assert(!html.includes('user-scalable=no'), `${relative}: zoom disabled`);
  assert(!/<(?:html|body)[^>]*class="loading"/.test(html), `${relative}: content hidden until JS runs`);
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const url = new URL(match[1].replaceAll('&amp;', '&'), `${origin}/${relative}`);
    if (url.hostname !== 'almostkhan.me' || !['http:', 'https:'].includes(url.protocol)) continue;
    assert.equal(url.protocol, 'https:', `${relative}: HTTP internal link`);
    let target = path.join(root, decodeURIComponent(url.pathname));
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
    assert(fs.existsSync(target), `${relative}: broken internal link ${url.pathname}`);
  }
}
const robots = read('robots.txt');
assert(robots.includes(`Sitemap: ${origin}/sitemap.xml`), 'Invalid sitemap directive');
assert(!/Disallow:\s*\/(?:js|css|images|font)/.test(robots), 'Rendering assets blocked');
for (const xml of ['sitemap.xml', 'baidusitemap.xml', 'atom.xml', 'search.xml']) {
  const data = read(xml);
  assert(data.trim(), `${xml} is empty`);
  assert(!data.includes('http://almostkhan.me'), `${xml}: HTTP site URLs`);
}
assert(!files.some(file => /\/(?:aplayer|statics)\//.test(file)), 'Unused music assets published');
const trip = require('../source/_data/new_zealand.json');
const travel = read('new-zealand/index.html');
for (const day of trip.days) {
  assert(travel.includes(`id="${day.id}"`), `Missing travel day: ${day.date}`);
  assert(day.schedule.length > 0, `Missing schedule: ${day.date}`);
}
for (const booking of trip.bookings) {
  assert(travel.includes(`id="booking-${booking.id}"`), `Missing booking details: ${booking.title}`);
}
assert(!/<(?:script|link)[^>]+(?:src|href)="(?:https?:)?\/\//.test(travel.replace(/<link rel="canonical"[^>]*>/g, '')),
  'Travel page should not depend on external scripts or styles');
const wishlist = read('new-zealand/wishlist/index.html');
const wishes = require('../source/_data/new_zealand_wishlist.json');
assert.equal(wishes.items.length, 17, 'Wishlist must preserve all 17 wishes');
for (const item of wishes.items) {
  assert(wishlist.includes(`id="wish-${item.id}"`), `Missing wish: ${item.id}`);
}
assert(travel.includes('href="/new-zealand/wishlist/"'), 'Missing wishlist entry in itinerary');
for (const page of [travel, wishlist]) assert(page.includes('content="noindex, nofollow"'), 'Travel pages must remain unindexed');
for (const file of ['index.html', 'sitemap.xml', 'baidusitemap.xml', 'search.xml', 'atom.xml']) {
  assert(!read(file).includes('/new-zealand/'), `${file}: unlisted travel pages exposed`);
}
console.log(`Site checks passed: ${pages.length} HTML pages, local links, stable URLs, SEO and feed checks.`);
