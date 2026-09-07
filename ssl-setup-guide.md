# almostkhan.me HTTPS

本站发布到 GitHub Pages，由 GitHub 管理域名证书。

1. 在发布仓库 Settings → Pages 设置 Custom domain 为 `almostkhan.me`。
2. 按 GitHub Pages 官方文档配置域名 DNS，等待域名校验和证书签发。
3. 启用 Enforce HTTPS。
4. 保持 `_config.yml` 中 `url: https://almostkhan.me`，`source/CNAME` 中填写 `almostkhan.me`。
5. 执行 `npm run build` 验证链接，再手动发布。

检查 `https://almostkhan.me/`、`/robots.txt` 和 `/sitemap.xml`，确认站点地址统一为 HTTPS。

官方文档：https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/securing-your-github-pages-site-with-https
