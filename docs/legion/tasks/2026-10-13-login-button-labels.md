# LOGIN-BUTTON-LABELS-20261013

状态：完成（代码范围独立QA通过；浏览器视觉及本轮打包未执行）。

## 目标

- 用户明确要求登录按钮圆角改为4px，不显示「账号」「密码」两个字段标签。
- 保留输入框placeholder、输入框4px圆角、各状态统一背景、错误边框、密码显隐、校验和登录请求及导航逻辑。
- 标签移除后仍为两个输入提供准确的无障碍名称，不用placeholder作为唯一可访问名称。

## 绑定与写入范围

- 唯一总控：01a0bc51-e17e-7990-ad76-13c63f385f33。
- 实现：frontend_developer 固定会话01a132b1-0e33-7a73-9344-4ccaee63479c；仅可写 `src/pages/user/login/index.tsx`、有必要且与变动直接相关的 `src/menuNavigation.wiring.test.tsx`、自己的 `docs/legion/status/frontend_developer.md`。
- 审查：quality_reviewer 固定会话01a132b1-1500-72e0-a34c-aa9d72fd5200；实现交回锁后只读验证，只写自己的status子卡。
- 目录C:/home/workspace/lab/eva-web，当前trunk；不得切分支、修改后端、依赖、全局样式或其他稳定文件。
- 修改前重读适用AGENTS/CLAUDE、eva-frontend/antd技能及refs、AIBrain全局前端规则、当前Git状态及相关代码；查实际Button/Input/Form API。
- 保留原型stash df210e76e0c70ec753800a3d0e52f6d7808a7e25，不apply/pop/drop/clear。不提交、不推送、不启动服务/浏览器。

## 验收与回报

- 登录按钮normal/hover/focus/loading等状态均为4px；不改变背景/动作，不扩大到密码显隐按钮、语言按钮等其他控件。
- 页面不显示两个独立字段标签；输入仍可通过无障碍名称、placeholder和键盘使用。
- 保留已有必填校验消息与布局合理间距；不因删除标签留下空label区域。
- 对精准修改文件做Biome/antd lint和有价值的登录wiring检查，不能把静态证据说成浏览器视觉验收；不重复无关全仓检查。
- 开发完成先更新自己的共享status子卡，交回业务写锁，主动发含任务ID、状态、文件及证据的消息给总控。QA随后由总控明确派发，不抢先运行。
- 默认异步：总控派发后即结束，不等待确认或结果；成员不得形成纯确认回报循环。

## 前端交付（待独立核验）

- 登录按钮本体及hover覆盖层圆角均改为4px，两个Form.Item label移除；输入aria-label复用已有国际化placeholder key，原输入提示与必填校验保留。
- 实现成员报告：Biome2文件通过、登录antd lint无问题、wiring6/6通过（3.39s）、diff检查通过。完整命令见前端共享状态子卡。
- 本轮仅登录样式、标签及直接相关wiring断言，没有修改认证、跳转或其他已稳定行为；命令全部结束，业务写锁交回。
- 未重复tsc/build，既有dist不代表本次更新；未运行浏览器视觉验收，不声明打包产物已更新。
- 下一步：固定QA只读核验代码及定向检查，先更新自己的共享状态子卡，再主动回报总控；不得修改业务文件。

## 独立QA结果

- QA已主动回报完成，无本次P0/P1/P2及阻塞；完整证据见 `../status/quality_reviewer.md`。
- 独立Biome2文件通过、登录antd lint无问题、wiring6/6通过（3.55s），包括可访问名称定位、无独立标签区域及有效提交导航。
- 按钮本体与hover层均4px，输入提示、校验、密码显隐、认证导航及此前输入状态CSS保留；相关样式为源码/声明证据，不是浏览器视觉验证。
- 本轮未build，旧dist不代表更新；全仓tsc任务外报错继续保留。未提交、未推送，备份stash不变，无执行中的命令或业务写锁。
