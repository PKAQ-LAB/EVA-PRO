# MENU-LOCAL-ONLY 独立质量验收（2026-10-24）

状态：代码门禁通过；新鲜运行验收被 Edge 扩展界面阻止。不得将本卡解释为现场菜单已恢复或整体 sys/log 矩阵完成。只写本 QA 卡及后台自己的矩阵，不修改生产源码或测试。

## 独立源码结论

已读取 app.tsx、新 menuLifecycle 测试全文、services/user.ts、当前生成的 InitialStateProvider、@@initialState model、LocaleContainer 和真实 aggregate ProLayout.js，并核 settings/login/logout 的模型更新调用。当前修复增量为模块私有 WeakMap 用户对象到匿名版本的映射、模块 scope/序号，以及 menu.params.snapshot。实际 ProLayout 使用 useSWR([defaultId, menu.params])，因此新用户快照可改变缓存键；request 不接收/转发 snapshot，fetchMenus 的 HTTP 路径、参数和契约未改。不是 layout key 强制重挂。

同一 currentUser 引用在 settings/抽屉状态更新中通过浅展开保留，locale 生成容器只更新 Intl/AntD context；生成 model 不在每次渲染复制 currentUser。登录/重新加载生成新快照、退出置 undefined，故没有在已审调用路径发现对象抖动造成无穷请求。WeakMap 不强持有用户对象，匿名字符串不含身份、菜单或认证凭据。Date/Math.random 是缓存命名空间而非安全随机；HMR 新模块 scope 可规避计数归零重用旧键，但本轮未执行真实 HMR 操作，不能称运行 HMR 已验。

原地修改 currentUser 不在既有不可变更新约定内，本修复不承诺支持。合法 menus[]、全过滤、首叶403、白名单、本地项及 normalizeCurrentUser 的原处理未改。未知成功结构仍可能形成 truthy 用户壳，不得把匿名版本称为新增身份校验，也不得据只有 TanStack 推导实际权限/服务端输入。旧响应测试覆盖真实 SWR 菜单请求换键后的迟到结果，不等价于已验证所有 getInitialState 并发刷新竞态。首挂 Provider 测试证明 loading 门禁，不支持“普通冷启动必先无用户挂布局”的断言。未发现本次增量新的必须修复项。

## 独立执行结果

- `pnpm.cmd exec vitest run --maxWorkers=2 src/menuLifecycle.wiring.test.tsx src/tanstackMenu.wiring.test.tsx src/menuNavigation.wiring.test.tsx src/utils/menuNavigation.test.ts src/app.test.tsx`：5 files、54/54，exit0；10:37:24 起，49.82s。真实 aggregate ProLayout/SWR 与生成初始化/locale 组件，model/request/history/plugin 边界为夹具。
- 随后串行 `pnpm.cmd exec vitest run --maxWorkers=2 src/menuLifecycle.wiring.test.tsx`：1 file、9/9，exit0；10:38:37 起，21.23s。与54项重叠，不累计为63项。
- `pnpm.cmd exec biome check src/app.tsx src/menuLifecycle.wiring.test.tsx`：2 files、31ms、exit0、未修写。
- `pnpm.cmd exec antd lint src/app.tsx --format json`：issues0、partialfalse、skipped0、exit0。CLI6.6.3提示6.6.7，未升级。
- `pnpm.cmd exec tsc --noEmit`：exit1，全仓诊断范围与此前一致，涉及旧 cloudflare-worker/hono、推断类型、appicon、已移除页面的遗留测试引用；app.tsx/menuLifecycle.wiring.test.tsx 无诊断，不能称全仓类型检查通过。
- 测试及类型检查结束后串行 `pnpm.cmd run build`：exit0，utoo pack17954ms、37 assets、Build index.html；未启动/重启服务。
- `git diff --check` 无内容错误，Git 报现有 LF→CRLF 提示；暂存区空，原 prototype stash 仍在，未提交/push。

## 新鲜浏览器结果与阻塞

按续接规则恢复 CUA 文档并只列现有 Edge3 标签，目标仍为 localhost:8000/#/examples/tanstack。第一次对已绑定目标执行 getAXState 即返回 Edge 阻止自动化，原因是另一个扩展界面打开。未绕过、未刷新、未做语言切换、未点击菜单，也没有新页面截图或新鲜菜单数量证据；未重复使用旧图当本轮结果。需要用户完成或关闭该扩展界面后才能继续这一步，非源码/权限申请。

后续待验：一次正常安全 reload 后实际父组和九入口，zh→en→zh 与 TanStack 进出是否无永久骨架；实际菜单仍 local-only 时只记安全结构/错误分类并交总控，不读取 token/cache/React/store 或自行 fetch。生产未实施临时 diagnostic，不寻找不存在的前缀。真实菜单输入/归一化计数及部署加载没有新证据。

包S账本保持全部实际0，mode/真实资源ID/候选查重仍未完成；不因菜单代码门禁通过而创建或赋权。其余14表逐组合像素及完整 CRUD/数据范围/多角色/tenant 矩阵仍未完成。本轮命令已全部结束，浏览器没有发生业务动作，读测/UI窗口可交回总控。

## 用户指明副屏后恢复窗口：首次可读，刷新阶段再被扩展界面阻止

按总控转交用户“继续，Edge在副屏”恢复唯一浏览器窗口；重新读 computer-use 技能及 CUA 文档，fresh Edge3 inventory定位现有本地应用页，未依赖主屏坐标、未换浏览器或绕过native禁用。新鲜 getAXState 成功：当前 TanStack 表有12条、首页10条、查询框空、无业务编辑面板；左侧 menu 唯一项仍 TanStack，没有系统管理/系统日志父组。这是本次刷新前新证据，不能替代刷新后结果；页头显示名称也不作为身份/模式/授权证明。

随后仅尝试一次正常 reload，再读取状态的顺序调用返回 Edge 扩展界面阻挡。工具未确认具体在哪一步拒绝，因此只记录“已尝试刷新，是否完成未证”，不得称成功刷新后仍local-only。未再重试/点击/切语言/直接导航，未换浏览器绕过。副屏不是坐标定位问题：本轮已能按标签读取；当前工具明确报告另一个扩展界面打开。成功AX也包含 Fitkun 图片下载扩展面板，但没有证据认定它就是阻挡源，不擅自关闭/禁用扩展。

当前唯一实际操作阻塞：用户需完成或收起 Edge 当前扩展弹层，回到本地应用页；解除后才能完成正常刷新、九入口、语言/TanStack往返与后续合法S0读取。无新截图，不能用旧图冒充本轮；未重跑已过54、无源/服务/依赖/业务写/DBHTTP/提交push。包S新增/授权变化仍全0；所有动作停止，UI窗口交总控，整体未完成。

## 扩展处理后的新鲜现场验收：菜单与往返通过

用户再次明确“可以了”后恢复唯一UI窗口，fresh Edge3 inventory已为组织管理页；首次AX可用、无编辑表单且查询空。将reload与getAX分开调用：reload单独返回成功，下一次读取组织页实际表格加载完成；系统管理/系统日志父组均在，展开日志后看到5个sys叶子、3个log叶子及TanStack，共9个入口。最终DOM只读回读aside链接正好为/sys/role、/sys/organization、/sys/account、/sys/dictionary、/sys/module、/log/error、/log/biz、/log/online、/examples/tanstack。此为本次刷新成功后的新证据，取代前轮扩展阻挡状态；不宣称逐个日志页本轮又重验，也不因菜单恢复倒推原fresh响应为空的原因。

实际zh→en→zh：组织状态由未锁定/已锁定变Unlocked/Locked，TanStack分页变10/page再恢复10条/页，证明语言实际生效；两父组均保持。英文进入TanStack初见骨架，随后15秒可见等待内原12条完整呈现；中文返回组织页、再次进入TanStack显示12条、再回组织表均完成，没有本轮永久骨架。语言/路由切换自动折叠父组是UI折叠，展开仍有全部叶子，不误报缺菜单。未重跑54、未注入诊断、未读缓存/凭据/React/store或自行fetch；本轮不需要菜单临时诊断来解释一个已消失现象，完整旧根因仍未新增响应证据。

截图：runtime-20261024/15-menu-after-reload-nine-entries.png和18-menu-restored-after-language-roundtrip.png，均新鲜实际屏幕；同目录16为模块只读资源字段、17为800px模块操作列。最终原简体中文、视口1912x949、组织搜索空、可见dialog0、九链接均回读，原12条本地示例保持；只读查询未创建/修改/删除任何业务对象。markHandoff，UI窗口交总控。剩余S0阻塞已从扩展切换为运行模式与精确资源ID/code缺可见证据，见包S账本；完整sys/log矩阵及全部14表组合未完成。
