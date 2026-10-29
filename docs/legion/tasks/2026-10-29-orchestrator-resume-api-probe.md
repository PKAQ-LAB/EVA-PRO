# 2026-10-29 总控恢复检查点

用户暂停后明确“继续”，现恢复本地只读 API 脚本准备和独立审查。不会因恢复自动发送真实请求，密码仍由用户在本地输入。

## 最新已完成证据

- 后端菜单完整回归曾实际 26 类 219 项全过；后续 JDBCv1 独立补验四类 11 项及八实例本机监听、RUN 数据目录、nonce 证据、进程终态全部通过。证据分轮保留，不拼接成同轮结果。
- 资源权限能力配置沿用 `eva.resource-permission.enable`，登录及 fetchMenus 成功响应同级返回 `resourcePermissionEnabled`，原 data 形状保持。后端三类六方法和完整独立后验通过。
- 前端组织资源守卫八文件 126 项独立通过，源码独审通过；Windows 长路径导致的副本误报已独立复现、更正并保留原记录。
- 用户重启后，LIMIT 正常刷新实屏通过：组织菜单恢复，查询/新增/查看/编辑可用，删除/批删/排序隐藏。未现场验证权限开关 false，不把自动化替代该现场。
- LIMIT 本人备注编辑并恢复已回读。PEER 列表精确查询 LIMIT 样本名称/编码不可见，未据此冒称真实 get/edit 接口拒绝。
- 两条专用样本已创建，数量 2/2，不再创建：LIMIT `2115435549295775746`，PEER `2115579583561605122`。开发 PG 只读核作者分别为 LIMIT `2114719096971497474`、PEER `2113894345662021633`；两行均 pid=0，path 为自身 ID 根路径，未删除未锁定。LIMIT 修改者也是本人，PEER 修改者为空。
- 两账号均仅 SELF 角色 `2113857683657629697`、范围 `0007`，SELF 精确四资源 `1000000000000011009` 至 `1000000000000011012`；对应 checkUnique/list/get/edit，未授 del/sort。其他四测试角色资源仍空。暂停和恢复均保留这些测试授权，不擅清理。

## 当前恢复工作与下一步

1. backend_developer 完成 ignored `.gradle/org-self-stage1-20261029.py` 收口及纯 fake HTTP 自测，technical_designer 按后端 `docs/legion/design/2026-10-29-local-api-read-probe-contract.md` 独立审查。中断时脚本已从 cookie 初稿统一为 Bearer，未真实执行；最终 SHA 和可运行命令尚待交付。
2. 用户已明确批准本地专用 API 脚本。第一阶段仅本地 `localhost:9016/api`、两个账号两条样本，最多十请求：每主体 login、fetchMenus、精确自身 list、get 自身、get 对方。密码 getpass 无回显、与前端同 MD5，令牌仅本次登录 body 取得并留内存，不读浏览器 token、不 Set-Cookie fallback、不持久化或打印凭据。
3. 无代理、重定向或自动重试；响应和异常只输出安全白名单。双方自身读取基线都成功后，跨主体 get 仅精确记录不存在业务码及空失败 data 才可记不可见；成功空值和未知失败均不能算通过。资源拒绝、编辑拒绝明确未覆盖，不发 edit/del/授权请求。
4. 审查通过后交用户本地运行命令，不由成员擅自登录真实服务或接收密码。返回安全摘要后再确定后续测试。
   最新进展：脚本 SHA `69AE56AF3E8D60700F2BE58784C380E721ABA19793299E1F56309478AB27CB59` 已独审及独立离线自测通过。用户首次本地真实运行返回 `LOGIN_FAILED`、requests=1、LIM success=false/checks=[]；跨读取 NOT_VERIFIED，资源及编辑拒绝 NOT_COVERED。尚未执行任何样本读取，不能归因数据权限。总控已停止建议登录重试，派 backend/designer 仅只读核登录协议及安全诊断字段；未取得 HTTP 状态/业务码，不能判坏密码或锁定。禁止索取密码、令牌、原始响应。
   后续已审安全诊断版 SHA `D005A1E898CD5B900FB75E3149F78D20F1E99BCC2E7529424C79F5E2F95335AE` 保原认证/请求/成功条件，补 loginObservation，独立离线自测通过。用户提供该版真实本地运行摘要：`success=true`、`READ_PHASE_PASSED`、requests=10，两主体自身 list/get 各 count=1/HTTP200/0000；对方 get 均 count=0/HTTP200/0x000-02001。两号登录与菜单 resourcePermissionEnabled 均 true，主体均 success。可确认当前 SELF 读取不可见，不能据此确认资源拒绝、编辑拒绝或具体插件根因，三个相应标记仍 NOT_COVERED/NOT_PROVEN。loginObservation 的 LOGIN_TOKEN 为已达阶段，不是本次成功结果的失败。保旧首失败历史，不补造原因；证据来源为用户提供安全摘要而非 QA 原始网络抓取。
5. 部门/子部门/自定义范围/多角色并集/日志受限权限及真实跨主体编辑拒绝等仍未完成。QA 已有批次方案，任何授权扩大须按具体行动确认，API/数据库契约变化仍等用户确认。
   C1 后续进展：用户行动确认后，SELF 资源已从四项缩为仅 `1000000000000011010`、`1000000000000011011` 两项 GET。UI 重开和独立 PG 只读核均通过；两账号仍仅 SELF/D1，permVer 实读 PEER=6、LIMIT=2，两样本不变。LIMIT 新登录实屏本人 list/get 可用，新增/编辑/添加下级/删除/批删/排序隐藏。旧会话未保留，不能声称旧会话失效通过。
   C1 独立脚本 `.gradle/org-c1-get-probe-20261029.py` SHA `AF5FEFBA9B317CA98C8CEA1241B53CCB8FB69A96E28B891BC7913F4DA2A514A3` 已源审及独立离线自测通过。用户实际五请求摘要 `success=true`、`RESOURCE_GATE_DENIED`：本人 list/get 均 HTTP200/0000/count1，未授合成 SELF 角色详情 GET 返回 HTTP200/false/0x000-00024 且无数据。可确认当前只读接口资源门禁拒绝；不证明撤销的 POST edit 拒绝，也不证明旧会话失效。编辑拒绝、后续部门范围等仍待。
6. 原个人设置空白问题尚待分析；字典明细查看形式冲突仍需按实际待确认事项处理。不得宣称 all done。

## 持续约束

源码和原证据冻结，当前仅专用脚本及本人状态/设计文档允许必要更新。不得 reset、覆盖用户修改、自动启动/重启服务、提交、推送或创建 PR。所有编辑使用 apply_patch。Edge 在主屏，恢复 UI 前必须 fresh 状态；当前无 UI 新派发，不读取密码或 token，不检查 matchMedia。保留被自动审批拒绝清理的空自检目录，不绕过。JEV disabled，不调用云端。总控使用独立成员会话，单一写锁和重验证槽，禁止重复派发和轮询。
