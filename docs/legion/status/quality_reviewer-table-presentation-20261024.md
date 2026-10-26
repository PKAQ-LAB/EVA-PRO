# TABLE-ACTIONS-NOWRAP-TEXT-HOVER 独立QA（2026-10-24）

结论：独立代码/隔离回归/构建门禁通过；角色800px中英文与本地600px亮暗长文本代表场景实际通过。尚未将14表所有像素/权限组合逐张全部验收；正常刷新后侧栏仅TanStack入口是当前另需核实的现场异常，不把该事实自行归因于此补修。完整sys/log/权限矩阵仍未完成。所有命令及UI动作结束，源码/UI窗口交总控。

## 已审实现与边界

先读更新的AIBrain权威eva-web-development第6节及table-column-alignment、适用eva-frontend/antd、项目指令、Git实际差异、frontend14表矩阵与失败证据。新增TablePresentation仅显示复用，不承载请求/数据层；TextCell显式只收string/number，0保留、空或对象—，不自动展开秘密字段/ReactNode。原display formatter给Tooltip明确可读值，Tag/link/checkbox/icon使用传入显示文本，不通过JSON或原对象猜全文。ActionGroup与actionColumn使body/header/控件center、nowrap、overflowvisible、ellipsisfalse，按14表列宽及scrollx保动作可达，无fixed/全局td规则/操作折叠，无service/API/权限或存储契约改变；既有dirty不算本轮新增。

14表配置已核：account400/x1260；role220+3授权各140/x1440；org300/x1100、module300/x1450，两个排序data-no-row-view保留；dict主220/x660、dict明细220/x750、module资源220/x880；biz/error180/x1100/1490；online100/x1560、旧token复制区域320；TanStack240/x1020；account rolelist名称240/x360、roleuser x740+y466、rolemodule名称260/x720/Modal860。角色授权最长英文未按中文估宽；权限分支原先visible/disabled条件保持，未因查看而授edit。

Tooltip使用静态eva-table-text-tooltip语义root，maxWidth min(640px,100vw-32px)、pre-wrap/anywhere；viewRow精确排除此浮层整棵DOM（含padding/text目标），保普通文本双击、原button/link/checkbox/复制/树/排序排除。online token不入TextCell/title/Tooltip；局部无title省略span+不缩小复制Button保持存量，不读取真实token/复制。biz/error只提示原列表本来展示字段，不新增详情get或字段；后端旧记录脱敏未被本轮真实核实，不称旧日志全文都安全，现场不悬停这些正文/参数。

## 独立命令结果

- pnpm.cmd exec vitest run --maxWorkers=2 src/components/TablePresentation src/components/RecordView src/pages/sys src/pages/log src/pages/examples/tanstack：31files174/174 exit0，09:47:04/137.19s。本次实际174包含最终英文列宽新增用例，开发早一轮173不代表当前应少跑1；不按旧报告硬记173。
- pnpm.cmd exec vitest run --maxWorkers=2 src/components/TablePresentation/index.test.tsx src/components/RecordView/index.test.tsx src/pages/sys/recordView.test.tsx src/pages/sys/nestedRecordView.test.tsx src/pages/log/biz/index.test.tsx src/pages/log/online/index.test.tsx：6files42/42 exit0，09:52:02/82.05s，与174重叠不累计。
- 精确Biome18files54ms exit0/no fixes。两shared+14业务源逐文件AntD lint均exit0/partialfalse/skipped0，新shared0issues；共29旧warning准确为28deprecated+1既有Modal.warning静态反馈usage（rolemodule78），不是全部29都deprecated。CLI6.6.3提示6.6.7未升级。
- full pnpm.cmd exec tsc --noEmit独立exit1/64行旧诊断，TablePresentation/RecordView及sys/log/examples目标无诊断，不冒称全仓类型绿。
- 两轮tests完成后串行pnpm.cmd run build独立exit0，utoo pack21455ms、37assets、Build index.html。这是bundle阶段时间，不伪称总命令只21秒。未与测试并行build，未延原单项timeout。diffcheck0/index空，旧CRLF提示保留。

测试采用真实antd Table/ProTable/Tooltip/Drawer及Umi边界替身，非只props；覆盖0/1/5动作、亮暗/320声明容器、普通/复杂字段、0空值/无空格、门户事件、真实5sys get与原排序控制、online不提示秘密、biz不额外取详情。HappyDOM不证明字体/overflow像素；以下独立浏览器提供部分实际证据。开发首轮空格规范化定位失败与重复title TS2783已读并保留，不将后续绿说成首次无失败。本轮独立无新测试失败或代码缺陷发现。

## 实际浏览器尺寸、滚动与全文提示

fresh inventory及getAX角色页可用，旧登录阻塞当时已消失，不操作其它浏览器标签。通过受支持viewport capability临时800x900：role真实table1440、container606/后稳定687，实际拖动横滚到最右scrollLeft753，末操作列约223.45px/组129px，全部中文查看/编辑/删除边界处于可见表格区；三个授权列及表头居中、无换行/省略。切en-US实际Module Auth/User Auth/Config Auth，列约142.17px；按钮114.56/95.53/108.05px，clientWidth==scrollWidth、左右边界在各列内，右端Edit/Delete全可见。不是只读nowrap样式作像素结论。

R01原编码英文无空格ROLE_EVA_QA_20261018_R01，TextCell实际client166/scroll196，确实截断；实际悬停（通过正常只读单击将指针移到字段）产生完整相同Tooltip，浮层dblclick未开viewer/dialog0，普通业务未写。截图07角色800中文最右、08英文、09全文提示。语言已恢复简体中文。

为更长中英/无空格字段，仅在已授权纯前端TanStack创建唯一可回收记录：原12条→13，name EVA_QA_20261024_中英文English_长文本_ABCDEF，code EVA_QA_TEXT_20261024_T01，remark=“已授权本地测试：中文与English Long Text。”加AbC0123456789重复12次，实际185字符，在UI200限制内。无后台新增、权限或包S身份/数据创建。按专用code过滤唯一行后600x900测试：name实际scroll328/client208确截断，Tooltip逐字符fullMatch true；remark长串Tooltip fullMatch true、宽568/right600在viewport内，pre-wrap/anywhere实际换行，亮暗两主题都完整显示。暗表bg20/20/20、Tooltip bg66/66/66，截图有实际可读对比；不读日志旧正文来造长文案。

TanStack最右操作列实际约244.83px/组140px，查看/编辑/删除各44px，scrollWidth==clientWidth，最右按钮right508.58、单元格right561、viewport600，完整可达/同排/center。浮层dblclick没有可见查看面板；曾全DOM计到1个role=dialog，经检查是已关闭设置容器openfalse/width0，不能据数字误报popup兼触view。

## 恢复与当前现场异常

仅对本轮专用code唯一行按删除→确认，专用查询0，重置恢复原12条/首页10、query空。未删除任何种子或后台记录。原简体中文、亮色（白表bg255）、viewport.reset回1912x949、设置drawerfalse均独立回读；一次恢复light过早未生效，检查bg仍20后重新以可见主题选项恢复白色，再明确关闭实际设置控件，未假恢复。最终截图14覆盖恢复状态并markHandoff。

语言切回中文并进入TanStack时曾长期仅骨架；有限chunk错误日志为空不等于无请求故障。恢复原viewport并正常reload一次后本地页加载正常，但真实aside仅一个/examples/tanstack链接，系统管理/系统日志父项不在AX/DOM，区别于折叠。未从此猜权限/运行模式或擅改菜单/硬编码入口；未检查token/cache/React私有状态、未重复刷新。已主动报总控，需结合当前认证菜单合法响应/权限与运行版本核实，再恢复其余后台表逐张像素检查；此为观察到的异常，不给未证根因定责于display helper。当前页面不是登录页，不再复述旧登录阻塞。

截图均在C:/Users/A/.codex/visualizations/2026/10/13/01a132b1-1500-72e0-a34c-aa9d72fd5200/runtime-20261024：07-table-role-800-right-light.png、08-table-role-800-english.png、09-table-role-fulltext-tooltip.png、10-table-local-600-name-tooltip-light.png、11-table-local-600-unbroken-tooltip.png、12-table-local-600-dark-tooltip.png、13-table-local-600-actions-dark.png、14-table-local-restored-12-light.png。已用本地view_image实际看13，600px图片展示长串换行与动作，无用样式声明冒充像素图。

## 仍未验与交接

14表代码都审/相关回归覆盖，但其余表实际窄屏、不同权限动作数量、授权选择树/Checkbox在真实Modal、真实复杂字典/Tag各组全部像素尚未逐张完成；online Token复制仅源码/合成边界不在真实凭据上操作。已过代表场景不代所有表通过。需总控先核当前业务菜单缺失现象的合法来源，源码继续冻结，后续正式派UI继续。包S获批但其账本0，mode/真实资源ID尚未核，未借本任务造身份/扩大权限；OpenAPI独立隔离结果不当已加载运行证明。

只写自己QA卡和sys矩阵，无源码/依赖/globalCSS/服务/DBHTTP直接写/后台业务或权限/提交push；唯一业务数据变化是已获准且已清理的本地测试记录。所有命令/动作结束，读测/UI窗口交回总控，整体未完成。

## 菜单恢复后补验模块主表代表场景

新鲜正常reload及语言/TanStack往返后业务菜单恢复，扩展阻挡本轮已解除，详情见menu-lifecycle QA卡；不继续沿用旧local-only当当前阻塞。合法只读查看组织模块资源详情，当前可见dialog宽640、form0，按钮Enter关闭成功；只展示原描述/type/path，无精确资源ID/code，未开编辑/保存或变资源。

补模块主表800x900实际像素：先看新鲜截图定位横向滚动条，再真实拖到最右；M01行查看/添加下级/编辑/删除四操作全部可见同排，不点击任何排序/添加/编辑/删除。DOM回读操作cell312.546875px/align center；四项宽44/56/28/28px，client==scroll、whiteSpace nowrap，最右删除right724.71875<800。截图17-module-800-actions-complete.png展示实际完整四操作；只是显示验证，不把M01的旧已锁状态改掉或据仍有操作入口判断新权限问题。视口已reset1912x949，最终中文组织页query空、visibleDialogs0，九菜单链接恢复。原14表逐权限/亮暗/窄屏全部组合仍未完成；本次仅多一个模块主表亮色800代表场景，不扩大结论。
