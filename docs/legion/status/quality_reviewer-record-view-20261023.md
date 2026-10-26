# LIST-DOUBLECLICK-READONLY-VIEW 独立QA（2026-10-23）

当前结论（23:02后补修复验）：P2-ROWVIEW-SORT-CONTROL-BUBBLE定向19项代码门禁已独立通过；广30files161项以--maxWorkers=2独立全过；默认worker静默中止的首次不完整结果保留。九入口实际浏览器验收被Edge“页面存在其它扩展UI”明确阻止，未开始点击，不得称已运行通过。下文保留初次失败发现，最新节为当前证据。

## 必须修复：排序图标双击兼触发查看

位置components/RecordView/index.tsx的viewRow target.closest白名单与sys/module/index.tsx排序列、sys/organization/index.tsx排序列。两页CaretDownOutlined/CaretUpOutlined实际为span role=img包svg/path，其click处理stopPropagation后调用handleSort；viewRow只排button/link/input/rolebutton等及expand/selection/copy，不排该排序图标或其区域。浏览器真实双击序列click、click、dblclick，click.stopPropagation不阻止独立dblclick向行冒泡，故执行原排序并新打开只读查看；即使灰色无click的排序图标，也会被当行内容触发查看。违反规则第6节一个手势一个行为/行内操作边界。未在真实数据上双击箭头，避免改变排序。

独立无文件内存探针：Node24 stripTypeScriptTypes从实际src/components/RecordView/index.tsx截取原viewRow函数体（不是复制过滤实现），HappyDOM真实span roleimg.anticon-caret-down→svg/path嵌套与tr冒泡，span click.stopPropagation计数而行dblclick调用实际helper。依次发两click和dblclick，输出actualSourceHandler=true、clickHandled=2、unexpectedViewCalls=1、externalWrites=0。该探针不渲染真实ModulePage、不调用sort服务，不伪称实际HTTP排序2次或PG变更；实际页面源真实clickhandler补足调用链，足以确定冲突。Node有stripTypeScriptTypes实验警告，不影响结果。首次shell node-e引号传递失败，仅命令工具问题；改stdin探针exit0，无源码或依赖变更。

最小建议：两页实际排序交互容器标记data-no-row-view或语义Button等使现有过滤准确识别，不能泛排所有SVG使普通图标字段无法行查看；保留既有明确排序单击，补真实module/org组件测试，正常dblclick序列验证sort动作仍独立且不get/read/open查看。范围外不改变排序权限、接口和冻结契约；本角色不自行修。

## 已审范围

完整读最新AIBrain前端规则及适用AGENTS/CLAUDE、eva-frontend/antd、实际Gitdiff/源码/新测试及frontend交接。九入口/别名与嵌套明细使用共享独立Drawer，纯Descriptions/Spin description/Alert/Button关闭无Form/输入/提交/附件/授权写路径。5sys沿原get，普通/锁定/9999不借edit授权；字典原onclick是隐式edit，改显式edit符合本次用户统一要求，左右结构未迁移。授权选择表无独立详情契约、未注册模板排除合理。业务/错误/在线新快照显式拣安全字段，不调用全文get；旧日志查看明细/在线token列与复制是存量另项，未据列名读取token或宣称真实泄露。

useRecordView每次read清旧data，序号保护切行/close/unmount/show后的过期响应，失败明确Alert、空ID无loader；show本身存入参引用，各调用处日志拣primitive、TanStack/嵌套spread primitive，无原地写对象。items whitelist不展开原对象，React文本无dangerouslySetInnerHTML。旧编辑/授权入口未由新view改权限。现有测试真实Table/Drawer、Service→http→mock Umi请求边界，不只mockprops；但排序span未入其target fixture，故157绿掩盖遗漏。

## 独立已完成验证

pnpm.cmd exec vitest run src/components/RecordView src/pages/sys src/pages/log src/pages/examples/tanstack，30files157/157 exit0，22:51:46启动/42.83s。原显式Form/树/授权/scope/TanStackCRUD等保持；新helper3、5主列表15组真实get链和嵌套/安全日志边界包含其中。

pnpm.cmd exec biome check精确22files，exit0/44ms/no fixes；git diff --check0/index空，旧CRLF提示保留。因当前必须修复门禁，暂不再生产build/重复AntD广审，不能把开发最终7573msbuild当QA执行。开发首轮中文自动空格定位失败及第二轮DictSelector GET mock缺失已读status保留，非实际产品失败或本轮独立运行。
最终亲跑pnpm.cmd exec vitest run src/components/RecordView/index.test.tsx src/pages/sys/recordView.test.tsx src/pages/sys/nestedRecordView.test.tsx src/pages/log/biz/index.test.tsx src/pages/log/error/index.test.tsx src/pages/log/online/index.test.tsx src/pages/examples/tanstack/index.test.tsx，7files33/33 exit0，22:53:05/24.70s。与157重叠不累加。full pnpm.cmd exec tsc --noEmit独立exit1/64行诊断；过滤src/components/RecordView及src/pages/sys/log/examples/tanstack无目标诊断，与开发既有状态一致，不能宣称全仓type绿。未执行AntD新一轮或build；当前缺陷未解不重复无关构建。

终态：P2-ROWVIEW-SORT-CONTROL-BUBBLE未通过，先补修再派独立QA；实际浏览器九入口/亮暗/键盘/原edit/控件排除尚未新验，本轮没有把HappyDOM当运行或声称0POST。当前无网络status/请求监听能力的限制仍在；后续现场只可报告实际页面与源码/合成请求边界证据，不伪造完整HTTP。原业务表框线与日期已过结果保持但非本轮复验。浏览器持续暂停，源/服务/DBHTTP/依赖/授权/旧日志正文/发布未操作，R01/M01/M02原值未碰；只改自身QA卡和矩阵。所有命令结束，读测/UI窗口交回总控；完整sys/log/权限仍未完成。
## 排序区域两marker补修复验与浏览器阻塞（2026-10-23 23:02后）

正式交锁后重新读权威第6节、自己的缺陷卡与frontend最新交接、实际代码。两排序div各data-no-row-view已在module171/org153；原helper继续精确closest排除，无泛禁SVG，不改排序算法/click权限/服务；普通文本行仍可view。新增真实ModulePage/OrganizationPage×可用down/灰up四例，目标真实span/svg/path两click+dblclick，无dialog/get0，可用POST恰2且原payload，灰0，随后普通行get1。开发未修source红4/19失败15通过日志已核，非本轮QA回退旧源码复造红。最初误读一个未存在的日志名仅检索路径错误，依最新status准确rowview-sort-20261023-before.log核回，无遗漏红证据。

独立亲跑pnpm.cmd exec vitest run src/pages/sys/recordView.test.tsx，19/19 exit0，23:02:35/26.87s；精确Biome module/index、organization/index、recordView.test三文件exit0/31ms/nofix，diffcheck0/index空旧CRLF提示保留。两marker为data属性，无新类型路径；前轮fulltsc独立64行目标0诊断保持，本轮不重复全仓类型、AntD或生产build，开发build/AntD是其证据不冒称QA执行。代码关闭排序误开查看有真实组件回归支撑，不称真实排序HTTP写验收。

开发稳定性边界：保存的rowview-sort-20261023-regression.log为160过1失败，TanStack原15000ms用例timeout；其后无代码/timeout变化、隔离构建重跑161全绿记录已核。不能断言机器负载是唯一根因，不因最终绿抹去历史不稳定，也不改timeout遮失败。

fresh cua inventory实际Edge3/4均同一localhost:8000/#/sys/role，首次getAX即返回“Microsoft Edge is blocking automation because another extension UI is open on this page”。需要用户在Edge关闭/完成该扩展界面后继续。当前是具体扩展UI阻塞，不是旧空tab/后台未启；无native app控制可用，不使用其它API绕过、不盲重试、不操作排序或页面。已立即主动告总控该前置。九入口/别名/只读9999/键盘/亮暗/灰排序/树选择控件/嵌套/显式edit/竞态错误均无本轮新运行结果；前轮代码合成测试不伪造现场0POST。无新截图，因为不能取页面状态。
广回归执行异常保留：本轮默认worker完整命令23:03启动后只有RUN提示，持续数分钟无新增输出/最终结果；QA以该唯一测试session Ctrl+C中止，exit1无报告，不能记161通过或断言具体根因。只读进程元数据见大量既有Node但未清理/杀服务，不把相关性当因果。随后同一完整命令仅追加--maxWorkers=2重跑控制本轮并行资源，未改代码/测试/原15000ms timeout配置；其结果待末节补。所有中断只对本轮测试session，不涉及用户dev/backend/Node服务。
## 当前代码终报与窗口交还

独立最终命令pnpm.cmd exec vitest run src/components/RecordView src/pages/sys src/pages/log src/pages/examples/tanstack --maxWorkers=2，exit0，30files161/161，23:07:51启动/115.80s。未改测试/源码/原timeout，和定向19重叠不累计。包括新增module/org两click+dblclick4场景及原所有查看/显式编辑/只读/授权/树/日志安全/TanStackCRUD。默认worker本次静默中止不是“初轮也通过”；开发此前15s timeout历史与当前资源控制边界都保留，不能宣称默认并行稳定性已排除。所有测试命令已结束。

P2-ROWVIEW-SORT-CONTROL-BUBBLE代码门禁可关闭，LIST-DOUBLECLICK-READONLY-VIEW实际九入口运行验收仍未通过/未执行，原因是Edge扩展UI明确阻止首次页面读取；总控已获最小恢复前置：用户关闭/完成该扩展UI后说继续，QA再fresh inventory/读取，不绕过。当前无新现场截图/0POST/实际身份鉴权证据，无真实排序/业务写/秘密全文/授权/服务启停/源码或依赖/提交推送。仅自己的卡及矩阵更新，读测/UI窗口交回总控。下一阶段按原已授权安全QA对象逐项验九入口/别名、9999、键盘、灰排序/树选择控件、嵌套快照、主题/显式edit不保存；快切/失败若无合法可控入口则明确保未证，不通过注入脚本/网络伪造诱发错误。完整sys/log/权限矩阵仍未完成，不all done。
## 2026-10-24 九入口实际只读抽检及当前登录阻塞

按总控新派发继续，不重复已过19/161；先读computer-use技能/最新Cua文档、QA卡/Git。fresh inventory显示本地页title登录但hash role；绑定后实际角色列表/登录成功提示存在且详情请求可用，旧扩展UI阻塞不再复现。此事实只表页面当时可用，不把静态标题或版本当身份/构建指纹。之后全程仅合法页面读取、查看、打开取消编辑及局部树/筛选，无保存/授权/状态/排序/删除/密码或直接DBHTTP操作。

| 实际入口 | 已完成运行证据 | 仍未证明 |
| --- | --- | --- |
| 角色 /sys/role | R01普通文本双击→查看角色，真实数据原remark/0000/未锁定，0个form/input/textarea/select/submit；原系统管理员只读记录ID1000000000000000004双击可读只读状态；R01查看Button按Enter可打开；原编辑独立打开“编辑角色”Modal且未兼view，取消未改 | 所有角色/受限读权限/真实HTTP0POST；Enter对非focusable dialog的locator.press超时属工具目标不可聚焦，改原生Return后面板仍无表单，但焦点精确行为不扩大claim |
| 组织 /sys/organization | 锁定O01双击→查看组织，已锁定且0表单，未解锁或写 | 组织灰排序本轮未点、各级全部记录未验 |
| 模块 /sys/module | 锁定M01双击→纯查看含原资源文本、0表单；原灰down图标opacity0.3且祖先data-no-row-view=true，实际dblclick后dialog0，未操作可用up；展开M01显示M02且dialog0；显式edit独立原抽屉未改动，嵌套资源双击→查看资源纯快照（原查询/GET/sys/module/list/排序1），无表单，关闭再取消原edit | 可用排序真实POST未执行；checkbox/所有操作区域未穷尽；资源真实行ID未展示 |
| 字典 /sys/dictionary | D01双击→查看字典，code/QA01明细文本、remark—原契约，0表单；显式编辑Button后右侧Form可用且未兼view；明细文本双击→查看字典明细QA01/原描述/sort1/备注—，0表单；离开未编辑/保存 | 新两根与D01remark契约仍未修，字典type原返回显示code未擅造归属；只读系统字典键盘/其它字段未逐一验 |
| 账号 /sys/account | 唯一当前可读行普通姓名单元格双击→查看用户，等Descriptions完成无error，字段仅姓名/账号/部门/手机/邮箱/状态/角色/备注，0表单，无密码/Token/上传/授权/提交保存入口；只读字段名/布尔不输出个人值 | 没有专用QA_LIMIT/PEER，不改变当前账号/密码/授权；不是所有账号及受限读取证明 |
| 用户别名 /sys/user | 现有同账号表格/字段，通过查看Button Enter→查看用户0表单，关闭 | 别名另一个独立后端身份/鉴权策略未假造 |
| TanStack /examples/tanstack | 原12条列表，示例记录1双击→查看本地记录DEMO_01、0表单，仅关闭；无新增/保存/删除，没有直接storage读写 | 本轮不重跑原CRUD、storage变化只由源码/合成证据支撑，没伪造实际storage0写监听 |
| 在线 /log/online | 实际14条，首行非token姓名单元格双击→查看在线用户，字段用户名/设备/版本/登录/签发/到期，无Token/密码/强退/保存提交/表单；旧token区域data-no-row-view存在，仅核存在不读值/复制 | 不读token/实际复制；未捕获是否额外GET，源码安全快照+合成覆盖不能冒称现场网络0请求 |
| 业务日志 /log/biz | 当前日期初始10-17→10-24；为原专用更新明确查10-23当天，稳定84条、第二页找到M01/M02原20:31:54/41。对已核M01更新ID2113609357259505666双击时间→查看业务日志仅time/type/operator、0表单。未点击“查看明细” | 未读旧正文/参数或详情、未造新日志。总数较前轮增长是动态审计背景，未据此判丢重。无归档/零点/缺end新证据 |
| 错误日志 /log/error | 实际1条，仅双击类名单元格→查看错误日志，字段仅class/method/time/spend；无IP/params/exDesc/Token/表单，不开原明细 | 原异常正文/请求参数不读取；默认<=now/onlybegin运行仍未证 |

查看Drawer有两个关闭Button（extra中文空格“关 闭”及aria“关闭”），用宽正则会命中2个，调整精确extra名字后正常关闭；非产品bug。模块嵌套打开时原编辑和查看各为一个dialog，改按name=查看资源精确定位，不误把父Form算进只读子面板。显式编辑服务异步短暂不出现，后续实际AX/截图确认原Modal/Drawer正常并取消；不因短locator wait超时报失败。所有已打开编辑均未改字段。

实际截图目录C:/Users/A/.codex/visualizations/2026/10/13/01a132b1-1500-72e0-a34c-aa9d72fd5200/runtime-20261024：01-role-readonly-view.png、02-organization-locked-view.png、03-module-safe-view.png、04-dictionary-safe-view.png、05-tanstack-safe-view.png、06-business-log-metadata-view.png。06仅右侧640px安全元数据，避免旧日志正文；账号/在线不截图个人字段/Token。未截图当前登录页，避免页面凭据提示进入证据。

包S仅只读预检：读technical_designer的2026-10-23-permission-test-fixtures.md，未获创建赋权执行批准。合法查看组织模块，实际模块ID1000000000000000102、code sys.organization、route /sys/organization、父1000000000000000100、未锁定；资源文本确实含GET /sys/organization/list、GET /sys/organization/get/{id}、POST /sys/organization/checkUnique、POST /sys/organization/edit；同时可见method* /sys/organization/**、岗位/sys/post/**等宽资源，不能整模块复制授权。View不展示逐资源真实ID/code，不能以模块ID/种子ID代资源ID；资源ID与tuple精确code仍待合法UI回读或经总控批准的读入口。

准备查询角色候选前缀QA_R_时发起正常查询后页面跳转到/user/login?redirect=%2F：当前实际登录页，管理query/重置控件已不存在，不能把rows0当候选无重名。只有查询尝试，没有候选查重结论；2账号/5角色/4部门/2样本全待核，实际mode/tenant/data/resource开关页面无证，不把源码standalone默认当运行。没有尝试登录，不使用页面凭据提示、不索取聊天密码。已markHandoff给用户本地重新登录；当前真实阻塞是登录页，不再报告旧扩展UI阻塞。

剩余：本轮亮暗主题/关闭快切与失败运行控制尚未完成，原普通/9999/锁定与键盘/灰排序及九入口已完成部分如表，不能合并成所有行为全通过。需要用户先在本地重新登录，再派唯一浏览器继续主题/剩余只读预检；受限身份包S/T的创建授权和本地密码接管仍未批准/具备，字典/OpenAPI政策独立待决。没有为达到all done擅自创建/赋权/改配置或删对象，完整sys/log/权限仍未完成。源码继续冻结，无测试/构建重跑，无新业务写/服务启停/提交推送，R01/M01/M02原值保持；全部操作结束，窗口交总控。

## 2026-10-24 新顶级规则影响：原只读结论不代同布局/审计字段验收

已按总控转交重读权威04-Rules/前端规则/eva-web-development.md第2–3节最新文本。同业务create/view/edit必须同页面形式、尺寸策略、分组、字段顺序、栅格和间距，view无提交且全面禁写；在统一布局内展示创建人/创建时间/修改人/修改时间，缺值—，不以当前人/当前时间补造或将人员ID冒充姓名，审计字段不得入写payload。只读日志不因此补造新增编辑。

本卡此前通过的是当时只读展示/手势边界，不能继续表述为新规则已经全部符合。现有独立RecordView布局与各业务aoeform的同布局一致性、四审计字段来源/授权/缺值表现、view→create/edit状态恢复以及审计字段不入payload，全部列为新增待验；真实接口未提供字段或人员名称的契约缺口必须单列，不扩接口读取或编造。既有纯日志安全元数据边界保持，不为四字段去读旧IP/异常正文/参数或Token。

此刻仅记录影响，不自行扩大九页面改造或跨仓迁移。唯一UI仍交回，待org/DictSelector源码交锁复验后由总控派新规则实施/验收；无UI/源码修改、数据或授权操作、测试构建、服务/提交push。本卡早期登录/S未批准等为历史，以后续包S与R专卡最新状态为准。
