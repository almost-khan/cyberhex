'use strict';
hexo.extend.helper.register('travel_markdown', text => {
  const html = hexo.render.renderSync({ text: text || '', engine: 'md' });
  return html.replace(/<table>/g, '<div class="table-scroll" tabindex="0" role="region" aria-label="详细信息表，可横向滚动"><table>').replace(/<\/table>/g, '</table></div>');
});
