'use strict';

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const frontMatter = require('hexo-front-matter');

process.chdir(path.resolve(__dirname, '..'));
// Dates are part of public URLs: never let filesystem timestamps decide them.
for (const file of fs.readdirSync('source/_posts')) {
  if (!file.endsWith('.md')) continue;
  const post = frontMatter.parse(fs.readFileSync(`source/_posts/${file}`, 'utf8'));
  if (!post.title || !post.date || Number.isNaN(new Date(post.date).getTime())) {
    throw new Error(`${file}: a title and explicit valid date are required`);
  }
}

for (const command of ['clean', 'generate']) {
  const result = spawnSync(process.execPath, [require.resolve('hexo/bin/hexo'), command], {
    encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, NO_COLOR: '1' },
  });
  const output = (result.stdout || '') + (result.stderr || '');
  process.stdout.write(output);
  // Hexo 5 can return zero even when template rendering failed.
  if (result.error || result.status !== 0 || /\b(?:ERROR|FATAL)\b/.test(output)) {
    console.error(result.error || `Hexo ${command} failed`);
    process.exit(1);
  }
}
require('./check-site');
