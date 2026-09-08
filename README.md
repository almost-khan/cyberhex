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

## 新西兰旅行页面

页面通过 `/new-zealand/` 直接访问，不在博客菜单展示，并从 sitemap 排除、标记 noindex。内容整理自 Obsidian《新西兰旅行计划》v0.14（2026-09-07）及《预约查询结果与全部链接》；旧版反向路线与被替代的接送团不作为执行安排。

- `source/_data/new_zealand.json`：12天时间线、6个活动报名卡片、导航链接及原计划详细说明。快照价格／余位与预订状态分别记录；更新计划时同步修改相关日期、费用、说明与版本日期。
- `source/new-zealand/index.md`：页面元信息。
- `themes/almostkhan/layout/travel.ejs`：独立页面模板，使用本地 `travel.css` 与 `travel.js`，不加载博客的第三方库、图片背景或字体。
- 所有行程在构建时生成，关闭 JavaScript 仍可阅读；打印按钮会展开详情。该页面不接入实时库存，不创建订单。

在 `npm run server` 后访问 http://localhost:4000/new-zealand/ 预览。

### 景点愿望排序

路书章节导航可打开 `/new-zealand/wishlist/`，可将此链接手动发给同行朋友。仍不进入博客首页、搜索、订阅和站点地图。

- `source/_data/new_zealand_wishlist.json`：2026-09-08 愿望清单快照，保留 17 项及新增项目的详细说明；不实时查询预约。
- `themes/almostkhan/layout/wishlist.ejs` 与 `source/css/wishlist.css`、`source/js/wishlist.js`（后两者位于主题目录）：页面、样式及排序交互。
- 支持 1–17 名、并列、不想去和未决定，以及品酒／三文鱼版本和备注。普通页面自动保存至浏览器 localStorage；分享结果通过 URL fragment 携带，不上传服务器，不自动汇总。朋友需手动把结果链接或文字发回群里。
- 打开结果链接不会覆盖本机草稿。修改分享结果后需重新复制链接；链接接收者可读取其中的称呼与备注。复制权限不可用时提供文本框手动复制。
- 本地预览：`npm run server` 后打开 http://localhost:4000/new-zealand/wishlist/。
