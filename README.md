# dsh-panelnav-fold

给 [DeepSeek Harness](https://github.com/deepseek-ai) 侧栏的**全局导航列表**加一个收起 / 展开开关。

侧栏本来就能整条收起（右上角那个按钮）。这个插件管的是另一件事：把那排面板入口（插件、插件市场、搜索索引、自动化任务、IM 机器人、上下文洞察、Downloads、MCP 连接器）单独折起来，工作区和会话列表不动，于是会话多的时候竖向空间全给会话。

```
展开                                 收起
┌──────────────┐                    ┌──────────────┐
│  deepseek    │                    │  deepseek    │
│  ＋ 新会话    │                    │  ＋ 新会话    │
│  插件         │                    │  工作区       │
│  插件市场     │   ⌃ 收起导航  →    │  会话 …       │
│  …           │                    │  …           │
│  工作区       │                    │  ⌄ 展开导航   │
└──────────────┘                    └──────────────┘
```

开关是侧栏底部（"今日"费用卡与 Veyra Network Graph 之间）的一行「⌃ 收起导航 / ⌄ 展开导航」。高度做 200ms 过渡，箭头跟着转；`prefers-reduced-motion: reduce` 下自动关掉动画。折叠状态记在 `localStorage["dsh.panelnavFold"]`，刷新、重启都保持。

## 安装

方式一，Desktop 界面（最省事）：设置 → 内置插件 → 添加插件，在输入框里填

```
https://github.com/AprilAlkene/dsh-panelnav-fold
```

方式二，命令行（`dsh plugin` 会把参数转给 pnpm，所以用 pnpm 的 Git 写法）：

```bash
dsh plugin add github:AprilAlkene/dsh-panelnav-fold
```

方式三，本地目录：

```bash
git clone https://github.com/AprilAlkene/dsh-panelnav-fold
dsh plugin add "$PWD/dsh-panelnav-fold"
```

> `dsh plugin <args>` 是 `pnpm <args>` 的转发，`--profile <name>` 指定装到哪个 profile。想在 Web 端也用，就再对 `web` profile 装一次。

插件按 profile 安装（Desktop 与 `dsh web` 各装一次）。装完刷新页面，侧栏底部就多出那一行。卸载：设置 → 内置插件 里删掉 `panelnav-fold`。

## 兼容性

只依赖宿主自己的两处标记来定位导航列表：CSS-module 类名后缀 `*_panelList`，以及 `aria-label="全局面板"` / `"Global panels"`。宿主没有给这个列表提供 `data-slot` 之类的正式钩子，所以：

- 宿主改了这个类名或 aria-label，开关还在，但折不动了 —— 那时要么改选择器，要么等宿主给出正式的折叠状态；
- 整栏收起（rail）时导航图标本来就会重排，插件不介入；
- 不改宿主包、不改主题，只注入一段自己的 CSS 和一个 footer 行。

## 结构

| 文件 | 作用 |
| --- | --- |
| `index.js` | 宿主侧入口，空实现（全部逻辑在客户端） |
| `client.js` | 注册 `sidebar.footer.action` 开关行、注入 CSS、读写 `localStorage` |
| `cordis.patch.yml` | 把 bundle 挂进 profile 的 patch |
| `locale/zh.json`、`locale/en.json` | 插件列表里的名称与描述 |

## License

MIT

---

A tiny DeepSeek Harness plugin: fold the sidebar's global panel list to one row at the sidebar foot, 200 ms height transition, state remembered in `localStorage`. Install from the Add Plugin dialog with this repo's URL, or `dsh plugin add github:AprilAlkene/dsh-panelnav-fold`.
