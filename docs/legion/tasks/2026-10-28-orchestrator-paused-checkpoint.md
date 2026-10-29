# 总控暂停检查点

用户于 2026-10-28 再次明确暂停后，现明确“后台1分钟之后启动 继续”。当前状态：恢复。总控已读取检查点、核前端 Git 及 QA 暂停状态，授 QA 独占一次已独审窄修后的全新隔离验证；先不操作浏览器或密码现场，运行结束再安排身份与菜单实屏验收。其他成员保持源码/配置冻结，不提交推送。下方历史段落保留追溯，最新结论以本节为准。

## 最新暂停点（覆盖下方过时待办）

- 部门回填已实屏通过：PEER 与 LIMIT 均为 QA_D1_20261023；查看页 assigned-only 角色及左右独立加载有效。Cube 普通 1.3 秒动画已实际捕获；禁止再检查 matchMedia 或推断用户系统偏好。
- 包 S 第一阶段已由用户行动时确认后执行并独立 PG 只读核对：SELF 2113857683657629697 仅四资源 1000000000000011009、1000000000000011010、1000000000000011011、1000000000000011012；PEER 2113894345662021633 与 LIMIT 2114719096971497474 各仅 SELF，岗位空、部门 D1 不变，permVer 分别 5/1。其他四角色资源仍空。暂停保留这些测试授权，不擅自撤回、禁用或退出用户登录。
- LIMIT 登录曾落入 403。PG 只读等价对照证明原授权菜单计数 1，加 SELF 作者条件后为 0。用户已批准专用菜单元数据免业务范围过滤、仅返回已授资源且保留租户边界的修复；不得扩全局 Ignore/ALL/permit 或修改旧共享授权查询。
- 专用菜单生产五文件已实现并独审。曾发现标准运行目录缺 AuthorizedMenu.xml，已单独正式 processResources 补齐 16/16，XML SHA 0F14C0C7EB3B572E58957CB9B2AE40E0C0792BFFACAB2B856EBF6DF288329F26，用户后续已正常重启。管理员菜单恢复实屏通过，但不等于 LIMIT 通过。之后已准备 LIMIT 登录交接，尚无用户再次“登录好了”的确认；恢复时必须先核当前身份，勿观察密码输入。
- 最新完整验证 RUN `.gradle/menu-isolated-runs/20261028T084704Z-f3667f22`：26 类、219 项，218 通过、1 失败，error/skip 0；失败为 AuthorizedMenuPostgresTest.keepsBusinessScopeButReturnsOnlyAuthorizedMetadata 的租户上下文冲突。另进程观察 PID 复用失败，严格八实例证据未通过。整体未通过，不得宣称 all done。
- 独立分析认为生产冲突拒绝正确；旧 Mode 测试未清 TenantContext，可能污染后续测试，Role 测试也有同类生命周期问题，实际失败时上下文值未保存，不虚称具体值。已批准并完成仅 Mode/Role 各 @AfterEach 清理；未改 production guard/router/withUser/排序。
- 观察辅助已按 (PID,完整启动时间) 分代，旧归属不可继承，新父链需重新证明，root 复用拒绝。未知存活归属不完整则失败交接，不 kill；原 RUN 路径、exe hash、数据目录、loopback、八实例门禁保持。
- 上述两项最新窄修完成但待 designer 独立终审，尚未重跑：Python `.gradle/menu-isolated-20261028.py` SHA CD399140BBB07A6F123F2B29844C604127BEE04A7F2E05CE7BF5AEF29A60B441；init SHA 7AFEA135B5DF8D8E95613CAAB707B543CE7DB0BC369ADC3379D4AE2536078BB8；Mode 测试 SHA 662505E45B6B54383EA616BF36BA757090926FBCD7657229AE786AE13D6A7DBD；Role 测试 SHA 9136D6154B437554FD2DBE683B1F79B863BF351AC40985B0E58E2BC0D6677F6C；menu 测试 SHA A78269ABACA1B9B871F4969D40B74F800C4B11BE0D8DDECBE6739A5159472D28。685 输入 closure 6FF3FAF86C15C376DB98ABDD9FA10CBE3ED737A1ED4009513698C8A1CC811B36。
- 暂停消息交叉补记：designer 已回报上述两项窄修独立终审通过、无新静态阻断，实际哈希和逐字节逆还原已核。仅静态通过，未启动新 RUN；用户暂停优先，不因该审查结果自动执行。
- 恢复顺序：先读后端 `docs/legion/design/2026-10-28-menu-context-instance-fixes.md` 及 designer 最新审查，再授一次新隔离验证；禁止自动重跑或降门禁。之后按实际用户身份安排 LIMIT 菜单及 SELF 两主体样本/拒绝链，原包 S 两作者样本仍未创建，S 后续权限链未完成。
- Edge 已移到主屏，必须 fresh 官方窗口/DOM，不沿旧坐标。浏览器 dispatch 前 deadline 与业务失败必须分开。仍无服务自动重启授权，不重复要求用户因工具失败重启。

## 已完成且有证据

- 后端 C 修复的两类隔离测试 26/26 通过。
- quality_reviewer 独立新 RUN `.gradle/C-full-regression-runs/20261027T162106Z-4bef1b8a`，固定 20 类，SYS 152、AUTH 37、DATA 14，实际 203/203 通过，无失败、错误或跳过。主编译、测试编译及三个 Test 任务门禁通过。此为受控自动化回归，不等于真实接口和页面验收。
- 前端九宫格 loading 已接入 PageLoading 与默认 Spin；此前定向 36/36 通过。用户随后要求不检查 matchMedia、直接播放，已仅删除 CubeLoading CSS 的 reduced-motion 静态覆盖，CSS 检查通过。保留 1.3 秒、原九格延迟与关键帧。该后续 CSS 改动尚无真实动画验收。
- 查看页真实观察到左右独立加载及稳定外框，角色仅展示已分配集合；首次重启前 PEER 部门仍为“—”，不能作为重启后的结果。

## 待继续

1. 用户表示后台已重启，但重启后部门回填的新证据尚未取得。QA 最新正常 reload 被 Edge 官方明确拒绝，原因是另一个扩展 UI 打开；不得误用早先屏外 Fitkun 文本推断可见遮挡。
2. Edge 恢复后，只读核 PEER 与 LIMIT 详情部门 D1、角色与布局；不补写部门或改密来制造通过。若仍失败，先最小运行证据定位。
3. 九宫格普通动画、页面 40px 及未捕获尺寸/暗色实际 loading 待验；不得再检查 matchMedia 或推断用户系统偏好。已删除静态覆盖，不修改系统设置。
4. 原批准包 S 的受限身份数据、资源按钮、接口和模块权限链仍未完整验收；不得宣称 all done。密码仍由用户在本地输入，保持原批准范围和清理约束。
5. 字典明细查看形式冲突仍须按实际待确认事项处理，不机械批量统一。

## 保护及恢复边界

- 前端 trunk、后端 cornerstone；已有各四个本地提交未推送，后续源码和文档改动仍未提交。暂停不执行提交、推送或分支操作。
- 后端临时 java.autobuild.enabled 已移除并恢复用户原设置，保留用户新增 suspendAllThreads。服务保持用户控制，不停止或重启。
- 旧 C、独立回归辅助及历史 RUN/快照证据冻结；不读写真实数据库来代替运行修复。
- 保护用户全部修改、前端既有 stash、后端 .vscode/ 与 GO_REFACTOR_PLAN.md；不得 reset、覆盖或擅自暂存。
- 已通知 frontend_developer、backend_developer、technical_designer、quality_reviewer 暂停并交还锁。其他成员无新派工。恢复前先核成员和任务卡，避免重复执行。
