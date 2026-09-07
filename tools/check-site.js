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
for (const required of ['index.html', 'about/index.html', 'tags/index.html', 'categories/index.html', 'archives/index.html',
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
console.log(`Site checks passed: ${pages.length} HTML pages, local links, stable URLs, SEO and feed checks.`);
