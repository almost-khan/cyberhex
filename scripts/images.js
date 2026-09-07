// Set image loading hints in generated HTML, including when JavaScript is disabled.
hexo.extend.filter.register('after_post_render', data => {
  data.content = data.content.replace(/<img\b[^>]*>/gi, tag => {
    if (!/\bloading\s*=/i.test(tag)) tag = tag.replace(/<img/i, '<img loading="lazy"');
    if (!/\bdecoding\s*=/i.test(tag)) tag = tag.replace(/<img/i, '<img decoding="async"');
    return tag;
  });
  return data;
});
