# dsh-yuque-notes

DeepSeek Harness（DSH）插件：把内容发到 **语雀小记**。

不需要语雀开发者 Token。发布时会通过已登录的 Ego 浏览器打开语雀网页并自动填写、发送。

## 功能

- **对话框下方入口**：上下文百分比右侧的「语雀小记」按钮，点开后输入内容即可发送
- **快捷键发送**：在输入框内按 `⌘/Ctrl + Enter`
- **选区一键记录**：在对话内容中选中文字后，选区右下角出现「记录到小记」，点击即可发布
- **命令**：`/yuque-note 内容`

## 前置条件

1. 已安装并可使用 [DeepSeek Harness](https://github.com/deepseek-ai)
2. Ego 浏览器中 **已登录语雀**（`https://www.yuque.com`）
3. 当前环境可运行 `ego-browser`（插件 Host 端通过它操作语雀网页）

> 若浏览器未登录语雀，发布会失败。请先在 Ego 浏览器里手动打开语雀并登录。

## 安装

### 方式一：从本地目录安装（推荐开发/自用）

1. 克隆仓库：

```bash
git clone https://github.com/rick-2023/dsh-yuque-notes.git
```

2. 在 DeepSeek Harness 中安装该目录为 Bundle（由 Agent / 插件管理安装本地包），目标路径指向克隆后的目录。

3. 确认插件已启用后，**刷新 Web GUI 页面**。

### 方式二：继续使用当前 workspace 副本

若你是在 `default-workspace/yuque-notes-plugin` 里开发的，可直接对该目录执行本地 Bundle 安装；本仓库用于备份与分享同一份代码。

## 使用说明

### 1. 从输入框发送

1. 打开任意对话
2. 看输入框下方、上下文占用百分比右侧的 **语雀小记** 按钮（小语雀图标）
3. 点击按钮，在弹出的输入框里写内容
4. 点 **发送**，或按 `⌘/Ctrl + Enter`
5. 成功后弹层会自动收起

### 2. 从对话选区快捷记录

1. 在对话消息里用鼠标选中一段文字
2. 选区 **右下角** 会出现「记录到小记」
3. 点击即可把选中内容发到语雀小记
4. 成功后会提示「已记录到小记」，并清除选区

### 3. 用命令发送

在对话中执行：

```text
/yuque-note 今天要跟进的三件事…
```

## 工作原理（简要）

1. Client 通过远程命令调用 Host 注册的 `/yuque-note`
2. Host 把正文写入临时文件，再调用 `ego-browser nodejs` 脚本
3. 脚本打开 `https://www.yuque.com/dashboard/notes`，定位「记你想记…」输入区，填入内容，点击「小记一下」

因此：**不依赖语雀开放 API Token**，但依赖本机已登录的语雀网页会话。

## 目录结构

```text
.
├── package.json          # DSH Bundle 清单
├── cordis.patch.yml      # 插入 Host 插件行
├── index.js              # Host：/yuque-note + 浏览器发布
├── client.js             # Client：dock 按钮、选区快捷入口
├── icon.svg              # 插件图标（语雀小鸟）
├── yuque-bird.png        # 图标源文件
└── locale/               # 包显示名与简介
    ├── zh.json
    └── en.json
```

## 常见问题

### 点了发送没反应 / 提示远程命令桥不可用

刷新 DeepSeek Harness 页面后再试；确认插件已启用。

### 提示找不到输入框 / 未登录

在 Ego 浏览器中打开语雀并登录，再重试发送。

### 选区按钮没有出现

确认选中的是 **对话消息区域** 的文字；选输入框或侧边栏文本不会出现该按钮。

### 和「引用文本」会不会冲突？

不会互相替换。选区快捷「记录到小记」是画面上的浮动按钮；系统自带的「引用文本」仍按原逻辑工作。

## 开发与重装

修改代码后，需对本地包执行一次 **移除再安装** Bundle，Client 变更通常还要 **刷新页面** 才生效。

语法检查：

```bash
node --check index.js
node --check client.js
```

## License

[MIT](./LICENSE)
