# account阶段1独立QA（2026-10-24）

状态：本阶段独立代码/聚焦回归通过，未发现新必须修复项；不是全站或运行验收通过。总控授唯一前端验证槽，其他成员仅写隔离目录；本角色不写源码/测试、不浏览器、不build/fulltsc/跨sys广测、不启停服务/读真实cache或secret/DBHTTPRedis/依赖/提交push。已读frontend阶段1最新status、精确Git diff、最新权威eva-web-development及用户覆盖。账号PEER1+原九对象保护，不新增LIMIT/作者或授权。

## 已核实现与边界

account index/list以明确create/edit/view分流，统一AOE1040 Modal；列表查看与双击只走现getAccount/read，显式编辑及frozen1/9999写守卫保留。查看只有关闭，业务Form disabled+字段只读，保存入口函数只允许create/edit；password/confirm不注册或回填秘密，Upload action/beforeUpload/remove/change均阻断。四审计字段createBy/utcCreate/modifyBy/utcModify只在左section末尾，缺—、不用ID/当前人时间伪造，无审计标题或该区Divider；AOE明确写payload及service再过滤审计/assignedRoles/deptName。mode恢复与原密码缺省/frozen/roleIds保存仍有测试。

view右表严格canonical roleIds与assignedRoles摘要交集按canonical顺序，不取候选第一页200补名，不从旧roles覆盖显式空。缺元数据/摘要缺项明确未就绪或不完整，双空才未分配；19位ID保String，已有角色缺名—、状态0/1/9999照实。新后端契约仍在落地，本阶段都是边界mock，不能称真实响应已存在或加载成功。

左右为独立section aria-busy/错误/重试，无全Modal spinner；edit候选慢/错不禁左资料输入或关闭，失败保dirty。view两个区域来自同一详情请求，重试沿该单请求并保先前已就绪资料，不假造第二个GET或将其称为两个独立网络数据源。旧详情/关闭/切目标由sequence和key隔离。部门真实TreeSelect一直存在，19位String受控回填，改姓名保D1/切D2/空候选保原值/清空必填/失败保值已测；未知或拒绝不折成功空。匿名currentUser对象epoch只隔离本地候选，开Modal沿原API refetch，无token/cache读取、不改授权范围/路由参数。

rolelist已按最新用户要求删除单独查看列/按钮，仅row doubleclick或聚焦行Enter打开权限短流程；checkbox/内部控件/Tooltip门户隔离、普通click无读、同roleId去重、切account卸载旧预览。rolemodulesview无原说明文字、Form/save/grant/可改checkbox，沿现GET与当前权限链，过滤已授资源/保结构祖先，失败/403/空/late明确，不扩大角色读范围。中文loading在本次冻结源均精确加载中...；无文案spinner未强加文本。检查本地AntD Modal footer自带DisabledContextProvider false，因此外层只读Form不会让子层关闭footer继承disabled；未据猜测报缺陷。

## 独立命令与证据

先核6测试imports/测试夹具与实际调用：不导入role/org/module AOE或dictionary页面，role权限仅读service/data，account modes用真实AccountPage/Form/TreeSelect/QueryClient与role modal，只有无关layout图标夹具，Umi request为边界mock。未跑sys/recordView/readonlyRows。精确命令：

`pnpm.cmd exec vitest run src/pages/sys/account/modes.test.tsx src/pages/sys/account/roleview.test.tsx src/pages/sys/account/aoeform.test.tsx src/pages/sys/account/list.test.tsx src/pages/sys/account/service.test.ts src/components/DictSelector/index.test.tsx --maxWorkers=1`

独立单轮6files68/68，exit0，17:18:40开始/76.02s，transform2.38/setup1.48/import26.48/tests44.31/environment2.54s；无skip/提高timeout。证据.git/qa-account-stage1-20261024.log。覆盖真实模拟Form/QueryClient/TreeSelect19位ID/同布局模式/审计与无写/assignedRoles不漏200外/缺字段不假空/角色双击与键盘/权限拒绝late/原save和dirty。mock无写不代现场HTTP计数，CSS/DOM不代像素。

精确Biome15files29ms exit0/no fixes（.git/qa-account-stage1-biome-20261024.log）；AntD单文件AOE/rolelist/rolemodulesview均exit0/partialfalse/skipped0，后两0issue，AOE仅原addonBefore弃用1项；CLI6.6.3提示6.6.7依用户禁止依赖改动未升级（.git/qa-account-stage1-*-antd-20261024.json）。精确diffcheck无内容错误，既有LF/CRLF提示保留、index空。未运行全站类型/构建，不借历史64行既有类型问题称当前全站绿。

开发原6files89中83/89、8files106中100/106及跨域重验主动中断均保留，旧dialog/loading stale-node修正后的开发2files38另轮通过不累计；本独立68轮通过也不冒称106全绿。前次查看列/说明、原不同布局查看现场通过仅历史，现新规范验收必须以新版本为准。

## 交锁与未完成

全部命令结束，前端验证槽交总控，可给排队新成员；本阶段不再触frontend/browser。全源冻结后的统一build/跨域回归/新三模式亮暗窄屏resize像素、真实assignedRoles详情及拒绝、PEER部门实际编辑再读均待安排。字典单击联动/scroll与role/org/module/TanStack的其它成员实现不在本轮覆盖，不称全局已符合。S0/跨tenant/日志边界仍未完；后端assignedRoles独立QA只排队，须按总控资源调度再启动精确177回归，当前没有后端测试运行。
## 2026-10-24 23:31 纯文本及授权先开后载独立复验

已读账号4源/新grant与原授权初始化设计。独立完整去重sys+共享+字典+TanStack38实际文件279/279（284.59s）覆盖账号原8测试、3shared、纯文本1040/四审计/roleIds+assignedRoles、延迟同容器/无POST、grant原单GET/JSON/正确一次初选/候选未齐禁写/旧回包与旧POST/重试保选择。证据.git/qa-unified-text-grant-20261024-a.json/log，不拼历史。30本批文件Biome0，16生产AntD仅31deprecated（账号11）。日志另6files23/23，不算同轮。

fulltsc首次63（旧59+新Umi生成access1+新grant夹具3），据实交总控定向修fixture必有ID窄类型；未改生产targetId/断言或使用cast/非空断言。冻结后按额外授权独立grant1file8/8、21.11s、该fileBiome0，第二fulltsc60仅移除3grant诊断，其余60逐行相同。本批无诊断但全仓仍红；原63失败保留，详情system-view卡及.git/qa-full-tsc-20261024-{b,c}.log。所有命令结束交槽。未构建/UI/刷新/服务/真实业务写；旧prod不能代表新源，实际UI待用户前端正常重启并先证dev资源。S10不变。
## 2026-10-26 部门名称搜索独立复验与UI保留现场

独立同3文件 account/modes、aoeform、service 回归完成：46/46，fail0/skip0，JSON success true，证据 .git/qa-department-search-20261026.json/log。已逐读新增7用例：名称过滤/无关词/清空恢复、已选19位string及原GET次数不变；原AccountPage→service→normalize→Form链的string/null/missing×候选先后6组合，缺失和null不冒领候选且必填阻写。均为合成transport，不能证明真实PEER详情wire。

精确2文件Biome36ms通过/no fixes。项目本地 pnpm.cmd exec antd lint AOE exit0/partialfalse/skipped0，仅原Input addonBefore弃用1条；未升级CLI或依赖。直接antd命令不在PATH的首次失败已纠为项目本地CLI，未把失败称通过。生产本补修为 showSearch={{treeNodeFilterProp:'title'}}，无新增deptName/回填或保存契约改动。

开始UI前新鲜DOM确认#/sys/account、umi.js、PEER行在；但当前已有role=dialog的ant-drawer-section，标题为整体风格设置/主题色/导航模式等开发设置，非上次交接的无抽屉现场。未关闭或操作该抽屉，未开账号编辑、未读phone/email/password，未截图账号全页；为保护用户现场暂停实际搜索回归并交总控。真实QA_D1名称搜索/无关词/清空和选择不变本轮尚未现场通过。部门回填仍未修复，等待总控向用户索取的最小wire证据；其它Alertgap/亮暗及S矩阵保持未完。无业务写/服务/build/缓存/提交push，S10不变。
