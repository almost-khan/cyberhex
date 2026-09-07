# AlmostKhan

Hexo 博客，使用仓库内维护的 Obsidian 定制主题。无需初始化主题子模块。

## 本地运行

项目使用 Hexo 5，命令通过项目内安装的 Hexo 执行，无需全局安装 `hexo-cli`。

进入项目根目录后，使用 Node.js 24 LTS（版本配置见 `.nvmrc`），统一使用 npm 和 `package-lock.json`。以下命令假定已经安装 nvm；如果使用其他 Node 版本管理器，切换到 Node 24 后从 `npm ci` 开始执行。

```sh
nvm install
nvm use
npm ci --ignore-scripts
npm run build
npm run server
```

访问 http://localhost:4000，修改文章后刷新查看，按 `Ctrl+C` 停止服务。端口被占用时可以使用 `npm run server -- --port 4001`。

`npm run build` 清理旧产物、生成页面，并检查模板错误、空白页面、站内链接、HTTPS、RSS 和既有文章路径。`npm run check` 可以单独检查 `public`。

## 写作与主题

```sh
# 新建文章
npx hexo new post "my-post"

# 新建草稿，并在本地预览草稿
npx hexo new draft "my-draft"
npm run server -- --draft

# 将草稿移入正式文章目录（不会上传网站）
npx hexo publish "my-draft"
```

- 文章放在 `source/_posts`，必须有 `title` 和固定的 `date`。日期参与 URL 生成，已发布文章不要随意改日期或文件名。
- 草稿放在 `source/_drafts`，默认不发布。`visible: hide` 不能作为隐藏文章的方法。
- 时区固定为 `Asia/Shanghai`。没有填写 `updated` 的文章采用发表日期，避免重新检出时全部被标记为刚更新。
- 站点配置：`_config.yml`；主题配置：`_config.almostkhan.yml`；主题代码：`themes/almostkhan`。
- 音乐、评论、统计、分享和客户端代码编辑器未接入；代码由 Hexo 在构建时高亮。重新接入第三方功能时需补全配置和资源模板。
- 首页文章、分页使用普通链接，浏览器原生导航确保 URL、标题、canonical 和前进后退一致。
- robots.txt 只维护 `source/robots.txt`。

## 发布

GitHub Actions 仅做构建检查，不自动发布。确认生成结果后，手动执行：

```sh
npm run build
npx hexo deploy
```

`npx hexo deploy` 会实际推送生成的网站，执行前需要本机 GitHub SSH 认证及目标仓库的写入权限。

发布目标由 `_config.yml` 的 `deploy` 配置指定，当前是 `almost-khan/almostkhan.github.io` 的 `master` 分支。博客源码的 Git 提交与网站发布是两件独立的事。GitHub Pages 的 HTTPS 和域名设置见 [ssl-setup-guide.md](ssl-setup-guide.md)。
