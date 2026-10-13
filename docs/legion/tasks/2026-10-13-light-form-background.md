# LIGHT-FORM-BACKGROUND-20261013

状态：完成（代码范围独立QA通过，浏览器视觉未验收）。

## 用户目标

- 用户要求明亮模式各种表单组件底色不应为灰色。
- 核对现用ConfigProvider/Umi theme variant、组件token及EVA局部覆盖；亮色正常可编辑控件使用主题正常容器背景，不以全局白色或!important批量覆盖暗色/禁用状态。
- 本轮正常Input/Password、Select/TreeSelect/Cascader、Date/Time/RangePicker、InputNumber、TextArea等实际使用控件及form/query/drawer/modal场景采用一致策略；无需新增未使用组件。
- 保留disabled只读/禁用语义、错误/聚焦/hover边框、selected/checked状态及realDark行为；登录页独立深色输入设计及刚完成4px样式保持不变。

## 责任与范围

- 总控01a0bc51-e17e-7990-ad76-13c63f385f33。
- 实现frontend_developer固定会话01a132b1-0e33-7a73-9344-4ccaee63479c，已有READONLY-DESC-ACTION-ALIGN与INITIAL-PAGE-TITLE任务，由同一成员串行处理，不创建并行写者、不重复相同任务。
- 授权C:/home/workspace/lab/eva-web下 `config/config.ts`、`config/defaultSettings.ts`、必要 `src/app.tsx` 主题配置及真正相关global.css/global.less局部规则/直接测试。优先单一组件API或token策略，不逐页复制背景规则。
- 每次修改前读取完整相关文件与项目/技能/AIBrain规则、当前分支upstream/ahead-behind/工作区；查询实际安装antd版本的ConfigProvider及受影响组件API/token，ProComponents按安装源码核实转发。
- 不改认证/权限/API、其他仓库或全局规则文件的非本任务内容；不升级依赖、不切分支、操作原型stash、提交推送、启动服务浏览器。

## 验收与回报

- 给出灰底来自filled variant、组件token还是局部覆盖的实际证据，区分上游默认与EVA定制。
- 普通亮色控件正常/hover/focus/校验错误背景保持合适正常容器色；禁用语义可保留灰底。确认暗色及登录局部独立样式不被误改。
- 验证实际使用组件家族的配置转发及代表性状态，不声称仅Input验证就覆盖全部表单控件。
- 精准Biome/antd与必要主题/变体回归；构建如必要与其他待办任务合并，不重复无关全仓检查；无浏览器证据时明确视觉限制。
- 完成或受阻先更新自己共享状态子卡，主动向总控回报本ID、来源、涉及文件、组件覆盖范围、命令证据/限制，并交回写锁；QA随后正式派发。
- 默认异步：总控派发即结束，成员不纯确认回报或创建下级代理。

## 前端交付（已独立核验）

- 灰底来源为项目显式filled配置；layout.childrenRender内单一ConfigProvider亮色outlined、realDark filled，并继承主题；layout=false登录独立设计不变。
- 前端报告10控件家族×亮暗×normal/error/disabled的60实例DOM变体/状态检查；hover/focus依据安装token实现，不是浏览器computedStyle或视觉验收。
- 与其他任务合并47/47测试、Biome与一次build通过；已交回写锁。QA独立核验控件覆盖、上下文及状态，详细证据见前端status。
