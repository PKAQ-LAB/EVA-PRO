# S0组织校验与字典选择器补修独立QA

日期2026-10-24；限定前端两生产文件及两新增测试的独立代码/安全现场验收，不获S0创建授权窗口。本轮源码只读、测试构建可执行，仅写自己的QA卡/后台矩阵与账本。

## 代码结论与边界

已读最新frontend交锁status、两生产diff/完整代码与新测试、组织service/http/requestPayload调用、当前生成Umi request成功resolve与错误reject、全局BizError处理、当前安装@rc-component/async-validator6.0.0的message替换与validator选择源码。组织原pattern含下划线未变，拆为本地格式/必填与独立checkCode两rule并validateFirst，避免原自定义validator替代pattern及rule.message覆盖远程错误；code/pid/id与原APIS/权限保持。HTTP401/403/5xx、BizError/业务失败/网络/未知空包不再伪装格式错，Form字段拒绝被消费，保存异常保留输入。原合法候选不换码、不补根pid0或修改后端契约。

DictSelector保data优先、原Map及数组兼容，未扩展lines/data.data/result、不硬编码五项或选择ALL，role必填不变；加载/成功空/失败分别显示，失败或加载不展示旧options或通用全部，effect清理忽略旧code/卸载迟结果。没有发现本次增量新的必须修复项；这些是EVA自定义组件的请求/表单边界修复，不是上游AntD政策变更。

临时diagnose只在development且code DATA_SCOPE输出info，字段仅code、phase、requestBegan、response/data类型、标准顶层键名白名单、optionCount/status分类，无原始值/异常消息/身份/地址/header/认证材料；生产及其他code沉默有测试。ok只表示转换完成，不代表原HTTP200。临时诊断及其测试需收证后交frontend新写窗删除，本轮没有自行改源或宣称已清理。

## 独立执行

- 精确定向：`pnpm.cmd exec vitest run src/pages/sys/organization/aoeform.test.tsx src/components/DictSelector/index.test.tsx src/pages/sys/organization/service.test.ts src/pages/sys/role/aoeform.test.tsx --maxWorkers=2`，4files35/35 exit0，12:41:39/10.34s。开发早轮32后补3项组织分类测试，当前实际35，不照抄32。
- 随后串行关联：`pnpm.cmd exec vitest run src/pages/sys src/components/DictSelector src/components/RecordView src/components/TablePresentation src/utils/treeOperations.test.ts --maxWorkers=2`，26files172/172 exit0，12:42:13/70.39s，与定向重叠不累计。
- 精确Biome4files14ms/no fixes/exit0。AntD单文件检查各exit0/partialfalse/skipped0：DictSelector0issue，组织3既有deprecated为maskClosable/dropdownStyle/treeNodeFilterProp。CLI6.6.3提示6.6.7未升级。
- fulltsc exit1，诊断范围与此前64行既有hono/config/appicon/遗留测试引用一致，本次4文件0诊断，不能称全仓类型检查通过。
- 所有测试结束后串行build exit0，utoo pack6082ms、37assets、Build index.html。
- 精确diffcheck无内容错误，既有LF/CRLF提示；暂存空、stash df210e76e0c70ec753800a3d0e52f6d7808a7e25保持。GitNexus兼容问题未重建，本轮按实际调用点/库源码复核。

测试实际使用真实Form、组织service/http、DictSelector/Select/条件挂载Modal，Umi request为边界mock；不能把模拟保存成功称真实组织已创建。真实权限开关/角色授权及服务端运行拒绝矩阵仍不是本轮合成测试的证明。

## 本次现场证据

fresh Edge3 inventory为用户管理页，安全只读核无dialog后进入角色；不读取账号行或凭据。只正常打开一次新增角色空表单、展开DATA_SCOPE：实际恰5个可见选项“全部权限、仅本部门、本人所属部门及下属部门、指定部门、本人创建或修改”。可见DOM option共5，无默认选择，combobox空；未见三岗位范围。DOM未暴露value属性，因此code0000/1/2/3/7通过已批准R code→原标签表对应核对，不冒称直接读到DOM隐藏code或真实HTTP正文。截图22-package-r-five-options-actual.png；此新结果取代前轮20的空选择器现象，R五选项UI当前可通过，旧空的全部根因仍不新增响应证据。

严格按受支持工具读取info级filter eva.dict.diagnostic/limit8：打开前baseline[]、打开后与随后复核均[]。没有读到本次phase/requestBegan/shape/count的日志，不得编造“已见converted5/HTTP200”、推断production/runtime版本或从空记录宣称生产无日志已实际证明。此次五项结论来自真实AX/DOM/截图；源码诊断隐私与dev/prod行为来自代码/测试。没有改consolehook、读React/store/cache/token或自行fetch；未因日志为空重复回源/刷新/删缓存。

角色只收起下拉并取消，不填角色、不保存/授资源。随后正常进入组织新增，原name/code QA_P_20261023、父项留空，编码仅Tab失焦，实际loading结束后check-circle，DOM ant-form-item-has-success且fieldErrors[]、code原值保留。没有出现格式/权限/业务错误；这里只证本次原编码校验通过，不是保存/父PATH/实际ID/HTTP状态证明。未点击确定，截图23-org-original-code-blur-accepted.png后取消，不创建组织。没有采原始响应或异常正文。

最终中文组织页query空/dialog0/viewport1912x949，markHandoff，全部命令与UI结束交总控。包S全部actual仍0/grant0，无密码/身份切换/作者样本或旧QA修改。下一待办为frontend移除临时diagnostic再交锁；随后总控另派S0创建，不能把本轮无保存校验视为已完成S0。新create/view/edit同布局及四真实审计字段规则已重读并在原view卡列待验，本次没有扩大九页面改造或声称全符合。

截图目录：C:/Users/A/.codex/visualizations/2026/10/13/01a132b1-1500-72e0-a34c-aa9d72fd5200/runtime-20261024。无生产源/后端/DBRedis/直接HTTP写/服务启停/依赖/提交push或vault写。

## 临时诊断清理独立通过并转S0实际创建

已核清理status及当前DictSelector完整代码/测试：helper+4calls/元信息、console/env注入删除；src/tests/config临时标记与Selector目录诊断残留0，历史卡/.git证据未删。成功空/加载/失败/过期隔离、Map/array/data优先、noALL及组织规则保留，原两个诊断测试中的BizError/undefined迁实际UI错误参数化并补array兼容。独立精确5files39/39 exit0（12:51:48/13.42s），Biome2files10ms0/no fixes；未扩大重跑172或build。本次清理未发现新增必改项，临时诊断清理待办关闭。

按总控同窗S0授权已真正保存并列表/detail回读4组织和3角色，不能再把上一节“本轮零创建”沿用为当前。完整七ID/name/code/scope/父关系及未证PATH/资源集合见后台自己的quality_reviewer-package-s-20261024.md末快照。CUSTOM选择仅D2后一次真实loading保存未关闭/无可见反馈，取消后完整code UI查询暂无数据，未重试/换code/改scope；浮层未收起时临时误选已在真实submit前撤销，DOM仅D2/popupfalse证据保留。ALL/账号/样本未创建，grant0；当前需backend限定只读核CUSTOM与七对象，QA已正式交UI锁，无源码/服务/依赖/DBHTTP直接写/提交push。
