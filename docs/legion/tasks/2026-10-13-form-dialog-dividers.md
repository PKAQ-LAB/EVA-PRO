# FORM-DIALOG-DIVIDERS-20261013

状态：完成（独立QA确认6表单接入、亮暗header/footer语义边框及保存回归）。

- 用户要求新增弹窗title与主要内容之间有灰色线，下方提交按钮区域与内容之间也有灰色线。
- frontend_developer唯一写者，仅eva-web/trunk；先读取项目规则/技能/Git和当前新增Modal/Drawer实现、共享样式及真实调用，明确原样式是上游默认还是EVA定制。
- 使用安装版AntD的Semantic DOM/styles或已有共享主题配置：header底边和footer顶边各细分隔线，用colorBorderSecondary等实际适用语义token，不硬编码亮色灰、不依赖动态css-*。
- 范围为实际新增/编辑表单的Modal/Drawer；先核对共同实现再最小统一。不要误加到Tooltip/登录或纯通知弹窗，不改正文内容、表单校验、保存关闭行为、padding和尺寸。
- 保留亮暗切换，检查原已有边框避免双线；不存在footer时不凭空新增提交区。
- 与搜索对齐/面包屑任务由同一成员串行处理，原发布继续安全暂停，新内容未独立QA不发布。已完成提交不得撤销。
- 精准检查和相关真实DOM/header/footer/token回归，必要构建合并；无浏览器证据明示，不启服务浏览器，不改后端/依赖/分支/stash。
- 完成先更新自己status，再主动报告总控本ID、文件/覆盖组件、来源/语义token、验证与发布状态，交锁供独立QA；不创建下级代理。
