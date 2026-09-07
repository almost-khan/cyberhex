// Fetch the index on demand; result text never becomes executable HTML.
let searchIndex;
let searchReady = false;
function getSearchFile() {
  const input = document.getElementById('local-search-input');
  const result = document.getElementById('local-search-result');
  if (!input || !result || searchReady) return;
  searchReady = true;
  let revision = 0;
  async function search() {
    const current = ++revision;
    const query = input.value.trim().toLowerCase();
    if (!query) { result.textContent = '输入关键词搜索文章'; return; }
    result.textContent = '正在搜索…';
    try {
      if (!searchIndex) {
        searchIndex = fetch('/search.xml').then(response => {
          if (!response.ok) throw new Error('Search index unavailable');
          return response.text();
        }).then(text => {
          const xml = new DOMParser().parseFromString(text, 'application/xml');
          if (xml.querySelector('parsererror')) throw new Error('Invalid search index');
          return Array.from(xml.querySelectorAll('entry'), entry => ({
            title: entry.querySelector('title')?.textContent || '',
            url: entry.querySelector('url')?.textContent || '',
            content: new DOMParser().parseFromString(entry.querySelector('content')?.textContent || '', 'text/html').body.textContent || '',
          }));
        }).catch(error => { searchIndex = undefined; throw error; });
      }
      const posts = await searchIndex;
      if (current !== revision) return;
      const words = query.split(/\s+/);
      const matches = posts.filter(post => words.every(word => `${post.title} ${post.content}`.toLowerCase().includes(word))).slice(0, 50);
      result.replaceChildren();
      if (!matches.length) { result.textContent = '没有找到相关文章'; return; }
      const list = document.createElement('ul');
      list.className = 'search-result-list';
      for (const post of matches) {
        const url = new URL(post.url, 'https://almostkhan.me');
        if (url.origin !== 'https://almostkhan.me') continue;
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = url.pathname + url.hash;
        link.className = 'search-result-title';
        link.textContent = post.title;
        item.append(link);
        list.append(item);
      }
      result.append(list);
    } catch {
      if (current === revision) result.textContent = '搜索暂时不可用，请重新输入以重试';
    }
  }
  input.addEventListener('input', search);
  search();
}
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('local-search-input')?.addEventListener('focus', getSearchFile);
  document.querySelector('.site-search-form')?.addEventListener('submit', event => event.preventDefault());
});
