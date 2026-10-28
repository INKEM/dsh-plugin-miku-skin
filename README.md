# 初音未来 · DSH 暗色皮肤（dsh-plugin-miku-skin）

为 DeepSeek Harness Web GUI 制作的初音未来主题暗色皮肤插件。

**不直接使用图片**：全部视觉由以下三类元素构成——

- **几何**：内联 SVG 双马尾路径、HUD 角标、数字网格、双马尾曲线、均衡器条、CSS 径向/线性渐变；
- **字符**：`MIKU`、`初音未来`、`01`、`39`、`♪`、`♫`、`♬`、`♩`；
- **配色**：深海青绿 `#39c5bb`、亮青 `#6ff7ec`、深空底色 `#060c15`、少量粉色 `#ff6fb5` 作点缀。

包内没有 `.png/.jpg/.webp/.gif/.svg` 资源文件，没有 `data:image`，没有外部字体、CDN 或网络请求。

> 非官方同人主题，与初音未来权利方无关。不包含官方美术、Logo 或歌词。

---

## 效果

启用后：

- 侧栏品牌位显示 `MIKU` 字标、`01` 胶囊与 `♪`；品牌标记为几何双马尾 + 头戴麦克风 + `01` 数字；
- 空会话 Hero 位显示同一几何标记，并继承原生的悬停摆动；
- 全局边缘出现可点击穿透的装饰层：四角 HUD 括号、边缘网格、右侧双马尾曲线、漂浮音符、均衡器、竖排「初音未来 / MIKU 39」；
- 全部 DSH 颜色令牌切换为暗色青绿体系：按钮、链接、焦点环、选中态、光标、滚动条、菜单、用户气泡、代码块、Markdown、Shiki 语法色、状态色；
- `prefers-reduced-motion` 下装饰动画停止；`forced-colors` 下装饰层隐藏；
- 无论外观偏好设为浅色、深色还是跟随系统，**皮肤启用期间界面保持暗色**（暗色-only 皮肤）。

## 设计取舍

DSH 的第三方主题注册入口（`ctx.theme.register`）没有持久的主题选择 UI；`setTheme(third-party-id)` 不会被持久化，并会被宿主设置回写覆盖。因此本皮肤不劫持主题偏好，而是：

1. 作为普通 Web 客户端插件挂载到 `shell.overlay`、`sidebar.brand.mark`、`sidebar.brand.name`、`conversation.hero.brand.mark` 四个稳定插槽；
2. 在 `html[data-dsh-miku]` 作用域内覆盖完整的暗色 alias 调色板与 static 调色板；
3. 用 `color-scheme: dark !important` 接管原生控件；
4. 用 `ctx.effect` 与模块系统负责样式、DOM 标记和插槽注册的完整清理。

启用/停用皮肤请使用 **Plugins 页面**中本 bundle 的开关（已实测可即时恢复官方品牌与原生配色）。

---

## 目录

```text
dsh-plugin-miku-skin/
├── package.json                 # bundle patch + web client 声明 + locale 导出
├── cordis.patch.yml             # 关闭 ui-brand-official，插入 miku-skin
├── skin.json                    # 供 dshmarket 识别为 skin 的轻量标记
├── lib/
│   ├── index.js                 # 宿主半（构建产物）
│   └── client.js                # 浏览器 bundle（构建产物）
├── locale/{en,zh}.json          # Plugins 卡片标题与描述
├── src/
│   ├── index.js                 # 宿主半源码
│   └── client/
│       ├── index.js             # 组件 + apply + 生命周期
│       └── styles.css           # 令牌映射 + 几何/字符装饰
├── scripts/
│   ├── build.mjs                # 无依赖构建：CSS 内联进 client bundle
│   ├── verify.mjs               # mock 运行时 / token / 无图片 / 对比度检查
│   └── token-snapshot.json      # 0.2.1-rc.2 基线 token 清单
├── dev/preview.html             # 本地视觉预览（不随包发布）
├── README.md
└── LICENSE
```

## 构建与检查

无需安装依赖：

```bash
cd /home/inkem/dsh-plugin-miku-skin
node scripts/build.mjs
node --check lib/client.js
node --check lib/index.js
node scripts/verify.mjs
```

`npm run check` 会串行执行上述步骤。

`verify.mjs` 会用 mock DOM/React/Cordis 运行真实构建产物，并检查：

- bundle 注册 id、`apply`/`inject`、四个插槽的注册形状；
- 几何标记、`01`、`MIKU`/`♪`、装饰层的 4 个音符与 9 根均衡器条；
- 放大/卸载时根标记的清理；
- 113 个 alias token、77 个 static token、7 个额外主题变量全部覆盖；
- 包内没有图片文件、没有 `data:image`、没有 `<img`、没有 `url()`、没有远程地址；
- 核心文字/状态色的 WCAG 对比度。

当前结果：**18 项检查全部通过**；核心对比度例如主文字 18.93:1、次级文字 10.64:1、青底深字 8.89:1、错误色 6.55:1。

## 本机安装状态（当前 profile）

已安装到 `~/.dsh/profiles/web`：

- `package.json` 新增依赖 `"dsh-plugin-miku-skin": "link:/home/inkem/dsh-plugin-miku-skin"`；
- `dsh.profile.bundles` 末尾新增 `"dsh-plugin-miku-skin"`；
- `node_modules/dsh-plugin-miku-skin` 是指向 `/home/inkem/dsh-plugin-miku-skin` 的符号链接；
- `cordis.patch.yml` 未被修改；
- 安装前备份：`~/.dsh/backups/web-before-miku-skin-20261028T203840/`（`package.json`、`pnpm-lock.yaml`、`cordis.patch.yml`）；
- 当前 `dsh web` 进程未重启；HMR 已实时加载。

## 安装到其他 Web profile

```bash
cd ~/.dsh/profiles/<profile>
# 若 pnpm 运行时锁目录被沙箱限制，可把 XDG_RUNTIME_DIR 指到可写目录：
XDG_RUNTIME_DIR=/home/inkem/.cache/miku-runtime pnpm add link:/home/inkem/dsh-plugin-miku-skin
```

然后把 `dsh-plugin-miku-skin` 追加到该 profile `package.json` 的 `dsh.profile.bundles`，刷新 Web 页面即可。

也可以使用 DSH 插件管理器的「添加插件」对话框，填入本目录绝对路径。

## 停用、卸载与回滚

### 只停用

打开 **Plugins → 已安装插件**，关闭「初音未来 · 暗色皮肤」的开关。已实测：

- 官方 `deepseek HARNESS` 品牌与配色即时恢复；
- 再次打开开关后皮肤即时恢复；
- 过程中没有控制台错误。

### 完整卸载

```bash
cd ~/.dsh/profiles/web
# 先从 package.json 的 dsh.profile.bundles 中删除 "dsh-plugin-miku-skin"
XDG_RUNTIME_DIR=/home/inkem/.cache/miku-runtime pnpm remove dsh-plugin-miku-skin
```

如需要恢复安装前的清单：

```bash
BK=~/.dsh/backups/web-before-miku-skin-20261028T203840
cp "$BK/package.json" "$BK/pnpm-lock.yaml" ~/.dsh/profiles/web/
```

最后按需删除 `/home/inkem/dsh-plugin-miku-skin` 源码目录。

---

## 兼容性与已知限制

- **基线**：DSH `0.2.1-rc.2` 的 Web 主题 token 表；仅支持 Web GUI（`dsh.client.platform: "web"`），不改 TUI/headless/SDK。
- **暗色-only**：皮肤启用时外观设置中的浅色/深色/跟随系统不会改变皮肤配色。这是刻意行为。
- **品牌位替换**：本 bundle 会关闭 `ui-brand-official`，否则两个插件会争用 single 槽位。若在其他 profile patch 中重新启用官方品牌，两者会冲突；请保持该行关闭。
- **浅色偏好下的少量原生差异**：`ui-settings-account` 的插画切换由 DSH 自身按 `data-ds-dark-theme` 选择，浅色偏好下可能显示其浅色插画。主界面、菜单、代码块与状态色均已覆盖。
- **升级漂移**：DSH 升级后若新增 token，新 token 可能回落为默认值；`scripts/token-snapshot.json` 记录当前基线，升级后可重新生成并运行 `verify.mjs`。
- **预览页非交付物**：`dev/preview.html` 仅用于本地视觉检查，没有 DSH 的完整行为；正式验证以 Web GUI 为准。

## 开发预览

```bash
cd /home/inkem/dsh-plugin-miku-skin
python3 -m http.server 4173 --bind 127.0.0.1
# 打开 http://127.0.0.1:4173/dev/preview.html
```

预览页右下角有两个复选框：`skin on` 控制 `html[data-dsh-miku]`，`dark attr` 控制 `body[data-ds-dark-theme]`。取消 `dark attr` 可验证皮肤在浅色偏好下仍保持暗色。

## License

MIT。见 [LICENSE](./LICENSE)。
