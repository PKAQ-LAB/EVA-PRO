# TRUNK-NAV-HEADER-20261013

状态：完成（代码范围独立审查通过）；浏览器视觉验收未执行，全仓类型检查任务外报错保留。

## 用户目标与边界

1. 主分支不需要工作台、管理页、查询表格菜单。
2. 登录后按后台返回菜单顺序打开第一个可访问叶子，而不是直接子节点或固定业务页。
3. PageContainer 页头区域亮色模式不显示灰底，暗色模式不变。
4. 用户授权把当前工作区切到主分支并修改；不提交、不推送，不启动服务、不打开浏览器。
5. 用户补充：登录页账号、密码输入框使用 4px 圆角；聚焦时背景不能变成黑色，保持普通状态背景与可辨识焦点边框。

## 分支与保护

- 唯一代码目录：`C:/home/workspace/lab/eva-web`，当前 `trunk`，HEAD `8ae2a4fee75601085cd3e713770846bc7f77c8b0`。
- 切换前已核对主分支 origin/trunk 本地引用 ahead/behind 为 0/0；本任务不是远程同步，不执行 fetch/rebase。
- 原 prototype 未提交内容已完整 stash --include-untracked，SHA `df210e76e0c70ec753800a3d0e52f6d7808a7e25`，19 文件；未恢复到 trunk。
- 禁止修改 EVA-API、eva-web-plat、eva-web-standalone 或 prototype；禁止处理备份 stash。

## 责任与依赖

- 实现负责人：frontend_developer，固定会话 `01a132b1-0e33-7a73-9344-4ccaee63479c`；登录P2已修复，业务写入锁交回，所有生产文件保持稳定。
- 独立审查：quality_reviewer，固定会话 `01a132b1-1500-72e0-a34c-aa9d72fd5200`；已独立关闭登录P2，无本次剩余P0/P1/P2，无业务写入权。
- 总控负责此任务卡和登记，不修改业务代码、代跑测试。
- 先读取项目 AGENTS.md→CLAUDE.md、package.json、当前 Git 状态、相关源码与测试、eva-frontend/antd 技能及其 references。
- 必须读取 `C:/home/Obsidian Vault/AIBrain/04-Rules/前端规则/eva-web-development.md`。当前用户指令优先。

## 实现写入范围

- `config/routes.ts`
- `src/utils/menuNavigation.ts`、`src/utils/menuNavigation.test.ts`
- `src/menuNavigation.wiring.test.tsx`
- `src/pages/index.tsx`（新文件）
- `src/pages/exception/403/index.tsx`
- `src/components/RightContent/index.tsx`、`src/components/index.ts`
- `src/global.css`、`src/global.less`
- `src/pages/user/login/index.tsx`（仅账号/密码输入框局部样式，不改认证、动画或登录按钮）
- 实现成员自己的 `docs/legion/status/frontend_developer.md`

其他文件需要先向总控说明必要性；不得修改生成的 .umi、接口契约或依赖。审查成员不改业务代码，只写自己的状态证据文件。

## 已交接实现与依据

- 三个示例入口来自上游；已从路由移除，不删除对应未使用源文件。
- 已去掉导航白名单中的示例路径及固定业务 fallback；DFS 按后台顺序，只选有效真实叶子。
- `/sys`、`/log`、`/dev` 是 redirect-only 分组，不能充当叶子；归一化后为空的组也不能成为可点击入口。
- 无可访问菜单进入隐藏 `/exception/403`；403 返回登录，避免根入口反复回退。
- 根路由为新独立入口，消费 @@initialState 已加载的 menus，不额外请求；loading 时不跳，effect 执行时只处理当前精确根路径，避免覆盖 401 登录跳转或深链。
- 页头灰色来自上游 ghost 透明背景透出 EVA colorBgLayout。已在亮色工作区范围使用 colorBgContainer；Umi 实际导入 global.css，global.less 同步维护。
- GitNexus impact 的存储版本 43/42 不兼容，risk UNKNOWN；已按 eva-frontend 降级读取 imports/callers/routes/tests。导航属于关键路径，需要回归；不得为本次任务长时间重建索引或升级工具。

## 交接时检查结果（不是最终验收）

- 旧实现成员：第一次 focused Vitest 14 passed/1 failed，失败为既有登录 wiring 用例超时（15s 限制、实际约 23s）；随后补竞态测试，未复跑。
- 第一次 scoped Biome：7 个格式问题和 CSS specificity warning；CSS 顺序已修，尚未最终复跑。
- AntD CLI 查询成功，实际 antd 6.6.3、ProComponents 3.1.14-7；CLI 提示 6.6.6 可升级，未升级。
- 交接时未完成 TypeScript 检查、最终构建和独立审查；不得把未运行检查写为通过。
- 新成员须重新读取完整 git diff，不机械覆盖现有实现；两个旧成员确认没有运行中的命令，已停止。

## 验收标准与下一步

- 示例入口不再注册，后台菜单中的旧示例也被过滤；直接旧 URL 走 404。
- 测试多层 DFS、后台顺序、无效第一组、空菜单、redirect-only 孤组、有路径中间节点不作为目标。
- 登录真实组件 wiring、根入口消费菜单、初始化 loading、已离开根路径及业务深链保护均有证据。
- 亮色 CSS 命中 PageContainer 页头且暗色不命中，保留语义 token，不依赖 hash 类。
- 登录账号与密码框圆角均为 4px；普通、hover、focus、内层 input 和 autofill 不再强制纯黑填充，焦点边框仍可辨识。不修改全局 Input、按钮圆角、登录请求或跳转行为。
- 实现负责人先对精确任务文件格式化/只读 Biome，再运行 focused tests、定向 antd lint、tsc 和一次生产 build；不能通过无限延长超时掩盖导航错误。
- 区分任务引入失败、仓库既有失败与环境问题。随后把生产稳定文件、命令及结果交总控，由总控发具体审查任务。
- 独立审查复核差异、运行 focused 验证与必要检查；本任务不做真实浏览器视觉验收，最终明确该限制。

## 固定前端成员交付（待独立核验）

- 实现已完成，命令全部结束；实际证据见 `../status/frontend_developer.md`。
- 最终 scoped Biome 10 支持文件通过，导航与 wiring 19/19；未延长 15s 超时。
- 登录、403、RightContent 定向 antd lint 无问题；最终生产 build exit 0，39 assets。
- 登录 focus/hover 排除 error 状态以保护错误边框；新增中间组后代全部无效时的菜单过滤回归。
- tsc 剩余诊断在未改任务外文件和生成目录；未隔离跑基线，不声称全仓 type-check 通过。
- stash、HEAD 和分支保持原样，不提交、不推送。下一步由质量成员只读独立审查，不重复开发方构建。

## 独立审查 P2 与修复交接

- QA 静态 ReactDOMServer 渲染核实：antd 6.6.3 带 suffix 的 Input 错误状态位于外框 `ant-input-status-error`，不是 `ant-input-affix-wrapper-status-error`。
- 当前外框 hover/focused 排除及 error 规则未命中真实 status 类；filled 变体原生 error/focus 样式优先级也可能使背景偏离统一背景。
- 仅允许前端修登录页真实错误类与 normal/hover/focus 背景、边框优先级；支持项目现用变体，内层透明，文字可读。不得改变验证/认证行为或其他稳定文件。
- 修复后前端重新检查/构建并交回锁；QA 独立复验该缺陷，不自行改业务代码。
- 前端本轮报告：真实 DOM 8 实例与 24 状态选择器覆盖断言通过；6 项 wiring、单文件 Biome/antd lint 通过，最终 build exit 0、39 assets。仅登录表单作用域内使用必要 !important 保护背景、错误红边、内层透明及 autofill；不是浏览器 computedStyle 证据。完整命令见实现成员 status。

## 独立审查结果与后续调度

- QA首轮独立导航及联动测试19/19、Biome10文件、antd3文件通过；登录P2复验6/6、单文件Biome/antd通过，8个真实SSR DOM实例和CSS层叠声明核验通过，P2关闭。
- 已核对最终 build exit 0、39 assets 和新的登录 chunk；未重复构建。完整证据见 `../status/quality_reviewer.md`。
- CSS证据是源码、SSR类名、选择器优先级及产物，不是浏览器 computedStyle 或视觉验收；没有启动服务或打开浏览器。
- 全仓tsc任务外报错继续保留，不宣称全仓类型检查或端到端后端联调通过。代码未提交、未推送；原型stash保留。
- 默认异步：未来补充按此任务ID或新任务卡派发即结束轮次；成员先更新自己的共享状态子卡，再主动回报总控。不等待成员确认，不建立纯确认循环。
