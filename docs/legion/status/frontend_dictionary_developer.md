# frontend_dictionary_developer

更新时间：2026-10-24。任务：前端分区并行交付 / 字典局部修正。状态：完成源码及定向验证，等待独立 QA；源码冻结，交还业务写入锁与重验证槽，无运行中命令。本状态不代表主任务全部完成或浏览器验收通过。

## 2026-10-25 最新真实Spin包装补桥（源码/验证完成，交锁待QA像素复量）

- QA新dev实证来自quality_reviewer-dictionary-stage-20261024.md 14:20记录与runtime-20261025/03-dictionary-layout-initial.png，图片已查看：2232x1221，SideLayout y139/h1092/bottom1231，表wrapper h992.906/bottom1229.906，body h370.828/bottom647.828，距框底约583；40/60及自然行高41.203正确。该视口无横溢，不把横条位置记为已验。
- 安装antd6.6.3 Table/InternalTable实际直接render Spin；Spin/index.js根为.ant-spin，始终保.ant-spin-container，loading时另有直接ant-spin-section绝对定位，默认根非flex。本页原CSS仅覆盖旧.ant-spin-nested-loading，漏直接根导致高度链中断。已核设计后，只在既有flex/column/min-height0规则组加一条.table > :global(.ant-spin)，保旧nested兼容；不影响右Spin/其它Spin、不拉行、不改业务/40-60/API/global/SideLayout。
- 先新增真实DictListView→安装Table→安装Spin两状态覆盖（index.test.tsx），只注入实际局部CSS+还原table Module类与global语法，不伪造包装/几何。断言实际直接根、container/table/body路径、aria-busy、flex列/grow/minHeight0，以及表外真实Spin不被改；loading时实际section仍存在。
- 红命令 pnpm.cmd exec vitest run src/pages/sys/dictionary/index.test.tsx -t '真实Table的直接Spin' --maxWorkers=1：1文件2失败/3skip，真实根computed display block而非flex。session68871自然exit1，总133.10s（import108.93s、tests530ms），期间因仅RUN偏长主动报总控，未杀进程/加超时/启第二测试。总控中止指令到达时原会话已结束，故未执行Ctrl+C。
- 仅加该CSS一行并精准格式化本轮CSS/test后，同命令复跑：1文件2/2通过+3skip，11.02s，exit0，session7160正常结束。随后 pnpm.cmd exec vitest run src/pages/sys/dictionary src/pages/sys/account/useLeaveGuard.test.tsx --maxWorkers=1：5文件29/29，39.48s，exit0，session71746正常结束。未变原9 staleLines、只读和交互断言。
- 精确Biome检查list.module.css/index.test.tsx，2files无修正exit0；本轮index.test.tsx antd lint版本6.6.3/JSON exit0、issues[]/skipped[]/partial false，升级未执行；精确diffcheck通过，LF告警保留。仅本轮2文件修改，源码与验证槽冻结交还，未fulltsc/build/服务/cache/UI/DB/依赖或Git发布。
- 调度更正已主动告知总控：首次交槽消息发出时静态组合命令仍在session72450，只Biome已返回，本人立即撤回“全退出”并保持槽；随后wait已收该session自然exit0，实际lint issues[]/partial false与diffcheck结束，终端时间2026-10-25T14:29:56+08:00。现在才正式交槽，无运行中命令，不隐去过早报告。
- 独立pagebottom1247超过viewport1221的26px尚未修：源码global .eva-workspace height100vh且app放ProLayout header后的content内，Footer固定flex30；若workspace实测top56/h1221，则56+1221-30=1247，SideLayout末端再减容器bottom padding16=1231，数值吻合。但缺workspace/header/footer真实祖先矩形，仍是候选而非已证；调整workspace属共享，不能以字典硬viewport减法/maxheight/overflow掩盖。已报总控请QA量workspace/page/header/grid/bridge/children/footer top-height-bottom、padding/flex-shrink后按首超界祖先另派共享owner。
- 本轮绿仅真实包装CSS级联与业务DOM回归；QA仍须新dev同视口/窄视口、亮暗、少多空数据复量表体到底、自然行高、横溢时横条可达，并独立定位26px底超界。尚无修后实际几何证据，不称整体字典已验收。

## 最新局部高度链候选修复验证（2026-10-24 22:50后）

- 本轮唯一重验证槽下，先运行 pnpm.cmd exec vitest run src/pages/sys/dictionary/index.test.tsx src/pages/sys/dictionary/interaction.test.tsx --maxWorkers=1：首轮2文件10项9通过/1失败，19.61s。失败为测试readFileSync接收经Vitest转换的import.meta.url（非file scheme），在读取CSS前抛错；不是页面渲染或CSS断言失败。仅把夹具读取改为node:path.resolve的仓库相对文件路径，业务/样式未改。
- 同精准命令复跑：2文件10/10通过，17.54s，exit0。真实安装PageContainer/GridContent包装保留；测试仅注入实际CSS源、还原本页Module类名与:global语法，没有另造布局div替代上游包装，没有mock像素/矩形或增加固定高度；初始loading仍有两面板/表头且结束沿用同一容器。
- 随后 pnpm.cmd exec vitest run src/pages/sys/dictionary src/pages/sys/account/useLeaveGuard.test.tsx --maxWorkers=1：5文件27/27，27.74s，exit0。原40/60无折叠、AOE3、staleLines9、新交互7及guard5保留，原index测试1扩为真实包装3项。
- pnpm.cmd exec biome check src/pages/sys/dictionary/index.tsx src/pages/sys/dictionary/list.module.css src/pages/sys/dictionary/index.test.tsx：3文件无修正，20ms，exit0。逐文件antd lint index.tsx与index.test.tsx，版本6.6.3/JSON：两次exit0、issues[]、partial false、skippedFiles[]。CLI升级未执行。精确diffcheck通过，仅既有LF告警。
- 本轮新增修复仅index.tsx局部className+list.module.css缺失中间层flex桥；index.test.tsx真实组件覆盖。无global.css/SideLayout/API/数据/guard/业务状态/高度硬编码改动；未fulltsc/build/服务/cache/UI，未提交推送。源码与验证槽再次交回总控，所有命令结束。
- 结果只证明新源高度链结构/局部CSS级联和交互回归通过，不能证明用户此前旧production现场异常已解决。需总控解决正确served版本后唯一QA量测少多空/亮暗/多viewport的真实左框/table-body/scrollbar/compact行高；旧prod错误不绑定本轮静态根因。

## 最终验证（2026-10-24，覆盖以下首轮待跑记录）

- 总控授唯一重验证槽后执行：pnpm.cmd exec vitest run src/pages/sys/dictionary src/pages/sys/account/useLeaveGuard.test.tsx --maxWorkers=1。
- 首轮：5文件，23通过/2失败，共25项，43.05s。两红均为新增interaction.test.tsx使用findByText匹配确认标题，而AntD6.6.3实际同时渲染隐藏标题与可见确认标题；错误为Found multiple elements，不是产品未弹确认。只改测试为匹配明确“放弃修改”按钮，不改业务/timeout/进程。
- 同命令复跑：5文件25/25通过，30.17s，exit0。覆盖原index布局1、AOE只读3、staleLines9、新交互7、冻结useLeaveGuard5。未运行nestedRecordView（静态import仍在变动的module/linelist/lineaoeform），交统一冻结后回归。
- pnpm.cmd exec biome check --write 精确本人5文件，exit0，格式化3文件；随后 pnpm.cmd exec biome check 同5文件，Checked 5 files / No fixes applied / exit0。范围为 index.tsx、list.tsx、aoeform.tsx、list.module.css、interaction.test.tsx，不含既有linelist或原index测试。
- antd lint初次多路径调用报Expected 1 argument（命令语法错误），随即逐文件重跑：pnpm.cmd exec antd lint src/pages/sys/dictionary/{index.tsx|list.tsx|aoeform.tsx|interaction.test.tsx} --version 6.6.3 --format json。四次各exit0，issues空、partial false、skippedFiles空。CLI升级提示未执行。
- 精确5文件git diff --check通过；原index.test.tsx无差异。测试stderr保留未改明细既有rowKey(index)、Divider.type、Modal.maskClosable弃用提示，未为消警扩大修改。
- 最终本人源码为 index.tsx/list.tsx/aoeform.tsx + 新list.module.css/interaction.test.tsx；linelist既有dirty未修改，主查看旧dirty按用户最新要求定向移除，文字悬停与操作center/nowrap保留。复用guard文件无改动，service/API/共享组件/全局CSS/路由/依赖均无本人成果。
- 未跑full tsc/build/全sys测试，遵守并行目录写入约束；未开浏览器/服务或真实HTTP/DB/Redis，未commit/push。

## QA 接锁条件与未验收项

### 后续“字典无法正确显示”只读诊断（2026-10-24）

#### 后续局部候选修复已准备（未获重验证槽，未运行新增测试）

- 总控正式授字典3文件源码写后，先改index.test.tsx：原PageContainer fragment替身替换为直接使用安装包真实PageContainer；保留原40/60无折叠断言，新增真实GridContent中间层与作用域CSS级联断言，以及初始列表loading时左右面板/表头常驻、加载后同容器断言。
- 随后index.tsx仅新增本页CSS Module className；list.module.css仅新增.page作用域内.ant-pro-grid-content-children的display:flex/flex:1/column/min-height:0，接上已有上游grid→缺失中间层→现有children-container→eva-body→SideLayout。未改global/SideLayout/表格滚动实现或guard/data/API。
- 测试用真实包装和真实CSS规则的模块类名还原检查computed flex契约；HappyDOM不用于断言矩形/像素。新增断言在旧代码无page class/缺桥规则时应失败，但因未授槽尚未执行红或绿，不能宣称已跑失败/通过。实际现场served旧prod与用户报告仍未绑定。
- 已按授权仅运行biome format --write精确这3文件（exit0）与git diff --check（通过，既有LF告警）。未运行Vitest/tsc/build/antd lint，未操作UI/服务/cache/data。源码准备后暂停，申请精确命令pnpm.cmd exec vitest run src/pages/sys/dictionary/index.test.tsx src/pages/sys/dictionary/interaction.test.tsx --maxWorkers=1；后续扩大原字典目录+冻结guard回归按总控槽安排。

- 用户报告后总控仅授只读诊断；本轮未改业务/样式/测试、未跑任何验证或启停/cache/data操作，等待唯一QA可见异常及served版本证据。
- 原设计属EVA自定义主从页：左40%字典Table/搜索/新增，单击详情GET到右AOE与明细，SideLayout标题45px/body百分比高度；AntD/Table与ProComponents/PageContainer是上游组件。原HEAD f112513a保留显式calc(100vh - 215px)，表体另calc(100vh - 315px)，前者提供确定父高，后者仅maxHeight，存在表体条不贴底的旧问题。去主独立查看、单击编辑是本次明确用户要求，应保留。
- 首要回归候选有源码证据：本轮index.tsx把SideLayout显式height改flex:1 1 0/minHeight0，完全依赖祖先剩高；安装ProComponents 3.1.14-7的PageContainer/index.js 285行使用GridContent，GridContent/index.js真实结构为.ant-pro-grid-content > .ant-pro-grid-content-children > .ant-pro-page-container-children-container。src/global.css只把grid-content和page-container-children-content设flex，缺中间grid-content-children；上游GridContent/style.js只boxSizing/width/wide，不补中间层flex或height。因此确定存在高度传递断点，是否正是当前可见塌缩仍待QA几何与served版本确认，不能把源码候选当运行证实。
- 原25项DOM测试中的PageContainer被替身为children，没有真实GridContent包装，不能排除此回归，也未声称像素通过。
- 数据/状态核对：dictionary service/API/路由/normalization无本轮改动，仍GET list数组→Table、GET id→right currentItem，类型无children/两根分类字段。新列表失败Alert不会整页return，详情Spin始终包裹已存在AOE/明细，不移除面板；字段loading期间禁写。当前没有HTTP/树契约错误的运行证据，不通过补假根或改API掩盖。
- 若QA证实断点：最小候选仅字典PageContainer加局部class并在该class下补真实grid-content-children的display:flex/flex:1/min-height:0/flex-direction:column，让已有children-container获得确定剩高；保留现左表body原生滚动和40/60，不恢复固定viewport减法、不改全局CSS/共享SideLayout。若实际served旧版/JS报错则按QA证据另定位，不预先应用。
- 验收候选：真实PageContainer结构回归（不能再只用fragment替身）+祖先可用高度的结构断言；唯一QA量测grid/content/eva-body/SideLayout/Table body矩形和scrollHeight，在少/多/空及亮暗/viewport核条贴底、行高正常、初始/局部loading仍先显示容器；本轮未写或运行这些测试。

- 后续TS7030例外解冻修正：系统成员full tsc日志eva-system-view-tsc.log指出index.tsx(123,24) handleDelete新增返回路径不完整，非历史失败。本成员只读核实noImplicitReturns=true后，仅把只读/选中分支显式return undefined，其他记录继续return remove()；删除动作/确认/高度/契约不变。git diff --check通过。未运行tsc/测试/build，等待持槽系统成员复验；源码再次冻结。该修正发生于25/25之后，不将前轮测试称为本次重跑。GitNexus定向impact再次storage43/42失败UNKNOWN。

- 需总控冻结相关源码/HMR后交唯一QA：实际左框高度、横滚贴框底、少/多/空数据不拉行、compact正常行高、40/60、亮暗、不同viewport与缩放；mock DOM通过不证明像素达标。
- 实际行单击/键盘右编辑、主无查看/编辑/dblview；未保存字段与明细切换/新增/刷新/离页确认，取消不请求或清值，详情失败保原、9999无写入、savebusy阻切换与防重入、删除不触发行读取。
- 共享readonlyRows/recordView旧字典断言由原frontend按总控授权调整，本成员未写。两根字典分类/归属契约未批，本次无数据或根节点变更。GitNexus仍UNKNOWN（storage43/42），未重建。

## 本轮实现交接

- 总控已正式授字典目录业务源码写锁；首轮改动 index.tsx、list.tsx、aoeform.tsx，新建 list.module.css、interaction.test.tsx。linelist.tsx 既有 dirty 原样保留；service/API/数据/共享文件/共享测试未写。
- 已纠正测试文件误覆：初次 Add File 使用了既有 index.test.tsx；读取原 HEAD 内容后完整恢复，git diff numstat 已无该文件差异。原40/60与无折叠布局回归保留，新7项交互测试独立位于interaction.test.tsx。初始Git状态该原测试为clean，无他人dirty被替换。
- 主表只保留独立删除，去主 RecordView/viewRow/查看编辑按钮；单击/Enter/Space 加载右编辑，选中高亮，搜索保留当前编辑对象。
- 复用冻结的 account/useLeaveGuard.ts，只读引用、不改 hook：字段和明细 dirty 切换/新增/路由/刷新保护；请求或保存期间阻止切换，详情失败保原值/原dirty与选择，成功切换才清表；卸载令旧请求失效。
- 9999 只读保护、独立明细编辑及已有明细查看保留。保存用 ref 防重入，保存失败保输入；删除不触发行加载，删除当前记录才清右表，选中dirty时另行保护。
- 局部 flex 高度链替代字典两处 100vh 减法；仅字典 CSS Module 设置 Table wrapper 与 .ant-table-body 的剩余空间，不改共享 SideLayout、不拉伸行或设置固定页高。40/60保留，像素结果未验证。
- 已获纯元数据查询例外：实际运行 antd info Table/Spin/Alert/Form、semantic Table、design.md，均指定版本6.6.3与JSON，命令exit0。CLI提示6.6.3→6.6.7升级，未升级。已读本地rc Table源码确认 body.wrapper 对应tbody，因此未误用其作为滚动div，采用局部 .ant-table-body selector。
- 静态 git diff --check 字典范围通过，仅既有 Git LF→CRLF 告警；未将其当测试或像素证据。
- 新就近测试首轮7项：单击/键盘/无双击查看/搜索、dirty取消与新增/路由刷新、明细dirty、失败保留/9999、savebusy与失败、防冒泡删除/清右表、loading阻切换/卸载旧响应。

## 申请验证槽与共享测试交接

- 请求独占命令：pnpm.cmd exec vitest run src/pages/sys/dictionary src/pages/sys/account/useLeaveGuard.test.tsx src/pages/sys/nestedRecordView.test.tsx（字典既有layout/只读/明细旧回调+新增交互、复用hook、保留子明细）。
- 请求精准检查：pnpm.cmd exec biome check src/pages/sys/dictionary/index.tsx src/pages/sys/dictionary/list.tsx src/pages/sys/dictionary/aoeform.tsx src/pages/sys/dictionary/list.module.css src/pages/sys/dictionary/interaction.test.tsx；随后定向 antd lint 上述tsx --version 6.6.3 --format json。
- 若获允许只格式化本人5文件，使用同5文件 biome check --write；不格式化linelist或他人文件。TypeScript/build按总控整包统一安排，不自行并发。
- 原frontend需调整共享 readonlyRows.test.tsx 字典列表 props（移除onView），recordView.test.tsx 不再把字典列入双击只读对话框矩阵；字典交互已由就近真实组件测试承接。本人不写共享测试。
- QA仍需真实浏览器高度/滚动条贴底、少/多/空数据、正常紧密行高、亮暗与多viewport、网络/权限失败；本轮测试未跑，不声称通过。

## 边界与基线

- 固定会话：01a16d2c-f97b-7860-b9d1-2e980e31f806；唯一总控：01a0bc51-e17e-7990-ad76-13c63f385f33。
- 唯一已授权写入：本状态文件；候选业务范围 src/pages/sys/dictionary/**，尚未应用业务 patch。
- 当前前端 trunk，upstream origin/trunk，本地 HEAD c220a9c08cf96e816e7cc16296c0fb69fa3c1709，与本地 upstream ahead/behind 0/0；未 fetch，不代表远端实时核验。
- 原有大量 dirty/untracked 全部保护；字典 index.tsx/list.tsx/linelist.tsx 已有他人修改。stash df210e76e0c70ec753800a3d0e52f6d7808a7e25 仍在，未操作。
- 已完整读取军团权威规则、EVA 前端权威规则、eva-frontend 与 references、antd、ponytail、当前 AGENTS 链接及 CLAUDE、legion README、10-19 主卡与10-24分区卡。已执行限项目记忆读取。
- 实装 antd 6.6.3、ProComponents 3.1.14-7。验证槽在原 frontend，本轮未运行 antd CLI、测试、Biome、tsc 或 build，未开浏览器/服务、HTTP/数据库/缓存。

## 源码与截图发现

- 已查看指定截图，横向滚动条在左框中部，表外底部大片空白；截图不是本轮运行态。
- index.tsx 使用 SideLayout width 40%、layoutStyle height calc(100vh - 215px)；SideLayout 标题45px、body height calc(100% - 45px) 且 overflow auto。
- list.tsx 外层普通 div，没有占满 body 的高度链；Table scroll.y 为独立 calc(100vh - 315px)，不能直接把 max-height 当作实际撑满高度。具体像素根因仍待 QA 实测。
- 现主表 viewRow(onView) 与查看/编辑按钮来自既有 dirty；单击不再调用 onEdit。恢复用户要求时仅移除主表 RecordView 接线、主查看/编辑按钮与双击查看，保留文字悬停、居中删除与明细独立编辑。
- aoeform.tsx 有会话失效保护、9999只读和保存锁；未发现字段/明细 dirty 状态、切换确认或未保存离开保护。不能宣称现已有完整 dirty 确认。
- handleEdit 当前无过期请求控制，快速切换可能旧响应覆盖新选择；暂无详情 loading/error 显示。列表暂无显式选中行。

## 推荐最小范围

- index.tsx：取消主 RecordView，恢复单击详情加载；加入最新请求保护、选择/加载/错误状态，以及与右侧编辑 dirty/提交状态联动的切换确认。40/60 保留，不改数据契约。
- list.tsx + 就近样式：局部 flex 高度链与实际剩余高度驱动表体，保证正常 compact 行高、少量数据不拉行、横向条贴可见框底；操作仅保留独立删除，行单击/键盘加载编辑、嵌套控件阻止冒泡。不得全局裁切 ant-table-body。
- aoeform.tsx：最小传出字段和明细 dirty/提交状态，成功保存清理 dirty；保留只读9999、明细独立增改删和会话失效保护。按实际需要补就近测试。
- 不改 linelist.tsx 的现有独立查看/编辑布局，不改 service.ts、数据、两根分类、SideLayout、RecordView、TablePresentation、DictSelector、共享测试或主任务。

## UNKNOWN / 依赖

- GitNexus query(EVA-PRO, DictListView SysDictionaryPage dictionary SideLayout) 失败：数据库 storage version 43，当前引擎42；未重建。后续 impact 仍须尝试，调用方先以源码查证，风险不记为 LOW。
- 共享 recordView.test.tsx / readonlyRows.test.tsx 引用字典主表；nestedRecordView.test.tsx 引用明细。共享测试修改须总控另授锁，否则交 QA/原成员修正最新字典交互断言。
- 尚无本轮浏览器像素、亮暗/多viewport或HTTP交互证据。需总控明确写锁后实现，再按验证槽调度检查，由唯一 QA 运行态验收。
