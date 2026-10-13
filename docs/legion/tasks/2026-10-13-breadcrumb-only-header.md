# BREADCRUMB-ONLY-HEADER-20261013

状态：完成（独立QA确认8入口及真实面包屑DOM/点击，heading已去除）。

- 用户明确要求不再需要ant-page-header-heading标题区域，页头只要面包屑；不要依据动态css-u6izyw选择器实现。
- frontend_developer唯一写者，仅eva-web/trunk；先读取项目规则/技能/Git及PageContainer全局和各页面真实配置、安装ProComponents相关API/实现，说明原页头结构上游或EVA来源。
- 优先现有PageContainer/pageHeader API统一取消标题区域并保留真实面包屑，避免隐藏整个页头或伪造面包屑。核对subtitle/extra等是否属于用户不需要的标题行及真实调用影响。
- 标题行去除后无孤立空白高度；保留面包屑导航、亮暗背景、浏览器document title和页面内容/权限。不要删除业务内标题、弹窗标题、登录欢迎语。
- 与SEARCH-RESET-ALIGNMENT串行处理，原发布安全边界协调，已commitpush不撤销；新增本项未经独立QA及正式发布调度不纳入提交push。
- 精确Biome/antd、实际页头及面包屑回归与必要合并构建，明确静态/DOM与浏览器视觉区别；无服务浏览器、后端/契约/依赖/分支或stash操作。
- 完成更新自己status并主动回报总控本ID、统一范围/文件、API证据/来源、验证与发布现状，交回写锁供独立QA；默认异步，无下级代理。
