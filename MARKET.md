# 收录到 dshmarket.com 与更新机制

`https://dshmarket.com/` 不是单独审核后台，而是 [dsh-market](https://github.com/dsh-market/dsh-market) 市场插件 + [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) 精选目录。目录每日刷新，并同步到：

- `https://cdn.jsdelivr.net/npm/dsh-plugin-catalog/index.json`
- `https://dshmarket.com/index.json`
- `https://awesome-dsh-plugin.com/index.json`

所以要把本插件收录进去，核心是：**让仓库可被 `dsh plugin add` 安装，并向 awesome-dsh-plugin 提 PR。**

官方市场说明：[Plugin markets](https://deepseek-harness.github.io/deepseek-harness/en/guide/plugin-market)  
投稿规范：[awesome-dsh-plugin contributing](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/blob/main/contributing.md)

## 1. 收录前检查清单

- [x] `package.json` 含 `dsh.bundle`（不能只有 `dsh.client`）
- [x] 根目录有 `cordis.patch.yml`
- [x] 仓库公开
- [ ] 仓库创建满 **1 天**（当前刚建，需等到约次日再合并）
- [ ] GitHub Topics 加上 `dsh-plugin`
- [x] 描述只写功能，不写营销词
- [x] `screenshots.json` + `assets/` 截图
- [x] 市场图标 `assets/icon-180.png`

## 2. 投稿步骤

1. Fork [awesome-dsh-plugin/awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)
2. 新增一个文件：

```text
data/plugins/rick-2023__dsh-yuque-notes.yml
```

内容直接用本仓库 `market/rick-2023__dsh-yuque-notes.yml`。

3. 开 PR，标题例如：

```text
Add rick-2023/dsh-yuque-notes
```

4. 等 CI + 维护者审核。合并后站点与 catalog 会自动重建；dsh-market / Discover 随后能搜到。

> 仓库未满 1 天时可以先提 PR，年龄检查几小时后会自动重跑；也可以等到满 1 天再提。

## 3. 用户怎么装

收录后，用户可在：

- DeepSeek Harness → **Plugins → Plugin Market / Discover** 搜索 `yuque` / `dsh-yuque-notes`
- 或命令行：

```sh
dsh plugin --profile <profile> add github:rick-2023/dsh-yuque-notes
```

若已发布 npm，则更推荐：

```sh
dsh plugin --profile <profile> add dsh-yuque-notes
```

## 4. 更新机制（推荐做法）

市场本身**不会**替你热推送代码。更新链路是：

### A. 发新版本（你要做的）

1. 改代码后提升 `package.json` 的 `version`（如 `1.0.1`）
2. 提交并打 tag / GitHub Release
3. **推荐再发 npm**：

```sh
npm publish --access public
```

注意：

- npm 包名建议就是 `dsh-yuque-notes`
- `repository` 必须指向本 GitHub 仓库，目录才能自动关联下载量
- 不需要改 awesome 条目里的 `npm:` 字段（手写会被拒；registry 自动采集）

不发 npm 也可以，用户仍可从 GitHub 安装/更新，但市场排序没有下载量，且可能触发源码构建确认。

### B. 用户侧更新（市场已支持）

装了 [dsh-market](https://dshmarket.com/) 后，用户可在市场里对已安装插件点更新/卸载。  
Discover 也会展示兼容的最新版本；安装确认页会显示 npm 包版本或 Git commit。

因此：**你 bump version + publish（npm 或 GitHub）= 更新机制生效。**

### C. 截图/图标更新

改本仓库 `screenshots.json` / `assets/*` 后 push 即可，**不用再提 awesome PR**；下一次目录构建会自动带上。

### D. 描述/分类更新

只改 `data/plugins/rick-2023__dsh-yuque-notes.yml` 后重新提 PR。

## 5. 本仓库已准备的文件

- `market/rick-2023__dsh-yuque-notes.yml`：直接可投稿的条目
- `screenshots.json`：市场详情截图声明
- `assets/icon-180.png`：市场卡片图标
- `assets/screenshot-*.png`：无外链截图

## 6. 建议时间线

1. 今天：推送本仓库改造（包名、截图、图标）
2. 给仓库加 topic：`dsh-plugin`
3. 仓库满 1 天后：提 awesome-dsh-plugin PR
4. 合并后：可选 `npm publish`，完善更新体验
