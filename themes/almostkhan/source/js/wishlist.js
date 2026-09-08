'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const form = $('wish-form');
  const cards = [...document.querySelectorAll('.wish-card')];
  const key = 'nz-wishlist-v1';
  const blankURL = new URL(location.pathname, location.origin).href;
  let shared = false;
  // Pasting another result into an already-open page is a same-document navigation.
  window.addEventListener('hashchange', () => {
    if (location.hash.startsWith('#r=')) location.reload();
  });
  const values = id => [...$(id).options].map(option => option.value);
  function sanitize(raw) {
    if (!raw || raw.v !== 1 || typeof raw !== 'object') throw new Error('版本不支持');
    const text = (value, max) => typeof value === 'string' ? value.slice(0, max) : '';
    return {v: 1, person: text(raw.person, 40), note: text(raw.note, 1000),
      wine: values('wine').includes(raw.wine) ? raw.wine : '未决定',
      salmon: values('salmon').includes(raw.salmon) ? raw.salmon : '未决定',
      ranks: Object.fromEntries(cards.map(card => {
        const rank = raw.ranks?.[card.dataset.id];
        return [card.dataset.id, rank === 'skip' || /^(?:[1-9]|1[0-7])$/.test(String(rank)) ? String(rank) : ''];
      }))};
  }
  function state() {
    return {v: 1, person: $('person').value, note: $('note').value, wine: $('wine').value,
      salmon: $('salmon').value, ranks: Object.fromEntries(cards.map(card => [card.dataset.id, card.querySelector('select').value]))};
  }
  function apply(data) {
    ['person','note','wine','salmon'].forEach(id => { $(id).value = data[id]; });
    cards.forEach(card => {card.querySelector('select').value = data.ranks[card.dataset.id];});
  }
  function score(rank) { return rank === 'skip' ? 99 : rank === '' ? 98 : Number(rank); }
  function ordered(data) { return [...cards].sort((a,b) => score(data.ranks[a.dataset.id]) - score(data.ranks[b.dataset.id])); }
  function result(data) {
    const lines = ordered(data).map(card => {
      const rank = data.ranks[card.dataset.id];
      return `${rank === 'skip' ? '不想去' : rank ? '第 '+rank+' 名' : '未决定'} · ${card.dataset.id} ${card.dataset.title}`;
    });
    return [`${data.person || '朋友'}的新西兰愿望排序`, '清单版本：2026-09-08（允许并列）', ...lines,
      `品酒：${data.wine}`, `三文鱼：${data.salmon}`, data.note ? `备注：${data.note}` : '',
      '这是个人偏好，未修改或预订行程。'].filter(Boolean).join('\n');
  }
  function render(save) {
    const data = state();
    $('result').value = result(data);
    const selected = Object.values(data.ranks).filter(Boolean).length;
    $('progress').textContent = `已决定 ${selected} / 17 项，其余保留为“未决定”。`;
    if (save) {
      // Shared links are separate from this browser's personal draft.
      if (shared) { $('save-status').textContent = '正在编辑分享链接中的结果，不覆盖本机草稿；修改后请重新分享链接。'; }
      else try {
        localStorage.setItem(key, JSON.stringify(data));
        $('save-status').textContent = '已保存到当前浏览器。尚未发给朋友，也未提交到服务器。';
      } catch { $('save-status').textContent = '浏览器无法保存草稿，请复制结果或分享链接留存。'; }
    }
  }
  try {
    if (location.hash.startsWith('#r=')) {
      shared = true;
      if (location.hash.length > 30000) throw new Error('结果过长');
      apply(sanitize(JSON.parse(decodeURIComponent(location.hash.slice(3)))));
      $('save-status').textContent = '正在查看朋友分享的结果，不覆盖本机草稿。填写自己的选择请打开空白清单链接。';
    } else {
      const saved = localStorage.getItem(key);
      if (saved) apply(sanitize(JSON.parse(saved)));
    }
  } catch {
    $('save-status').textContent = shared ? '分享结果无效或链接不完整，请让朋友重新复制完整链接。' : '草稿无法读取，可以重新填写并复制结果留存。';
  }
  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('input', () => render(true));
  $('sort').hidden = false;
  $('share').hidden = false;
  $('sort').addEventListener('click', () => {
    ordered(state()).forEach(card => $('wish-grid').append(card));
    $('sort').textContent = '已按名次排列 · 再次更新';
  });
  async function copy(value, message) {
    try { await navigator.clipboard.writeText(value); $('share-status').textContent = message; }
    catch { $('result').value = value; $('result').focus(); $('result').select(); $('share-status').textContent = '自动复制不可用，内容已选中，请长按或按 ⌘C / Ctrl+C 复制。'; }
  }
  $('copy-text').addEventListener('click', () => copy(result(state()), '结果文字已复制，粘贴发回群里即可。'));
  $('share-blank').addEventListener('click', () => copy(blankURL, '清单链接已复制，不含你的结果；朋友打开后可各自填写（会恢复他们自己的本机草稿）。'));
  $('share-result').addEventListener('click', () => copy(blankURL + '#r=' + encodeURIComponent(JSON.stringify(state())), '结果链接已复制，粘贴发给朋友即可；后续修改需重新复制链接。'));
  $('reset').addEventListener('click', () => {
    if (!confirm('清空当前页面的称呼、排名和备注？')) return;
    form.reset(); cards.forEach(card => $('wish-grid').append(card)); render(true);
    $('share-status').textContent = '已清空当前选择。';
  });
  render(false);
})();
