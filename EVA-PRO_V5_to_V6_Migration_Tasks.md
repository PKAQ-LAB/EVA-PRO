# EVA-PRO V5 → V6 迁移任务书

> **背景**: EVA-PRO 当前 trunk 分支基于 Ant Design Pro V5 改造（React 18 / antd 5 / Less / @umijs/max 4.0 / ProComponents v2 / ESLint+Prettier / Class+函数式混用）。
> Ant Design Pro 官方已发布 V6（React 19 / antd 6 / Tailwind CSS / utoopack / Biome / ProComponents v3 / React Query / 函数式组件），属于全面技术栈升级。
>
> **迁移策略**: 官方建议「新建 V6 项目，逐步迁移业务代码」。本任务书即以全新 V6 项目为基线，将 V5 EVA-PRO 中 PKAQ 的自定义功能逐项迁移。
>
> **注意事项**:
> - PKAQ 的提交不够标准，一个 commit 中可能掺杂不相关代码，迁移时需甄别有效变更
> - V6 技术栈变化巨大（Less→Tailwind/antd-style、useRequest→React Query、ESLint→Biome、moment→dayjs、lodash→原生API 等），迁移时需适配新技术栈
> - 若 V6 已有更好实现，确认后可跳过

---

## V6 关键技术栈变化（影响迁移的部分）

| 维度 | V5 (当前 EVA-PRO) | V6 (目标) | 迁移影响 |
|------|-------------------|-----------|---------|
| React | 18 | 19 | 并发特性、Server Components |
| antd | 5 | 6 | CSS 变量模式、组件 API 变化 |
| ProComponents | v2 (分散包) | v3 (统一包) | 导入路径变化 |
| 样式 | Less + global.less | Tailwind CSS v4 + antd-style + CSS Modules | **全部 .less 需重写** |
| 构建 | webpack 5 (mfsu) | utoopack (Turbopack) | 配置方式变化 |
| 代码检查 | ESLint + Prettier | Biome | 配置文件替换 |
| 请求 | useRequest / request | React Query (@tanstack/react-query) | 数据请求模式变化 |
| 日期 | moment | dayjs | API 略有差异 |
| 工具 | lodash | 原生 API / clsx | 按需替换 |
| 组件 | Class + 函数式混用 | 纯函数式组件 | Class 组件需重写 |

---

## 任务清单

### TASK-01: 登录密码 MD5 加密

**V5 Commit**: 登录功能改造的一部分
**涉及文件**: `src/pages/User/Login/index.tsx`
**优先级**: 高

**当前 V5 实现**:
```typescript
import { MD5 } from "jscrypto/es6/MD5";
values.password = MD5.hash(values.password).toString();
```
依赖: `jscrypto: 1.0.3`

**V6 对照**: V6 官方登录页无密码加密逻辑。

**迁移动作**:
1. 在 V6 项目中安装 `jscrypto` 依赖
2. 在登录提交逻辑中，调用后端接口前对 `password` 字段进行 MD5 加密
3. 适配 V6 的登录组件结构（V6 使用 ProFormText，与 V5 EVA 相同）

---

### TASK-02: 全屏按钮

**V5 Commit**: `64a7917`
**涉及文件**: `src/components/RightContent/index.tsx`, `package.json`
**优先级**: 中

**当前 V5 实现**:
- 引入 `screenfull` (v6.0.2)
- 在 RightContent 顶部栏添加全屏切换按钮
- 使用 `FullscreenOutlined` / `FullscreenExitOutlined` 图标 + Tooltip

**V6 对照**: V6 的 Header 右上角已重构为独立顶部组件（#11733），但**无全屏功能**。

**迁移动作**:
1. 安装 `screenfull` 依赖
2. 在 V6 的 Header 右上角组件中添加全屏切换按钮
3. ⚠️ V6 使用 antd-style/Tailwind 替代 Less，样式写法需适配
4. ⚠️ V6 的 @ant-design/icons 升级到 v6，确认图标名称是否变化

---

### TASK-03: 移除无用国际化文件，只保留简中/繁中/英文

**V5 Commit**: `2a616ff`
**涉及文件**: `src/locales/` 目录, README 文件
**优先级**: 中

**当前 V5 实现**: 删除 `bn-BD`, `fa-IR`, `id-ID`, `ja-JP`, `pt-BR` 等语言文件和对应 README。

**V6 对照**: V6 的语言切换**扩展到全部 8 种语言**（#11733），与你的需求相反。

**迁移动作**:
1. 在 V6 项目中删除 `zh-CN`, `zh-TW`, `en-US` 以外的所有 locale 文件
2. 修改 locale 配置，限制可切换语言为这三种
3. 删除多余的 README 翻译文件

---

### TASK-04: 只保留账号/密码登录

**V5 Commit**: `f62cf94`
**涉及文件**: `src/pages/User/Login/index.tsx`
**优先级**: 高

**当前 V5 实现**: 登录页只有 `account` + `password` 两个字段，移除了手机号验证码、第三方登录、注册链接等。

**V6 对照**: V6 登录页可能包含多种登录方式的示例代码。

**迁移动作**:
1. 精简 V6 登录页，只保留账号密码表单
2. 移除手机号/验证码/第三方登录/注册等 UI 和逻辑
3. 字段名使用 `account`（非默认的 `username`）以匹配后端接口
4. 登录接口指向 `/api/auth/login`（POST）

---

### TASK-05: 自动打开浏览器 + 压缩打包产物

**V5 Commit**: `e04c05c`
**涉及文件**: `config/config.ts`, `package.json`
**优先级**: 低

**当前 V5 实现**:
- `webpack-open-browser` 插件在 `chainWebpack` 中配置自动打开 `http://localhost:8000`
- esbuild CSS/JS 压缩配置（minifyWhitespace, minifyIdentifiers, minifySyntax）

**V6 对照**: V6 使用 utoopack (Turbopack) 构建，**不再使用 webpack**，chainWebpack 配置不适用。utoopack 自带优化。

**迁移动作**:
1. ⚠️ `webpack-open-browser` 不兼容 utoopack，需寻找 utoopack 原生的自动打开浏览器方式（检查 utoo 配置项或 umi 插件）
2. 确认 utoopack 的生产构建压缩配置（可能已内置最佳压缩，无需额外配置）
3. 如 utoopack 不支持自动打开，可通过 npm scripts 中添加 `open` 命令实现

---

### TASK-06: title / subtitle / copyright 可配置

**V5 Commit**: `72c86b5`
**涉及文件**: `config/defaultSettings.ts`, `src/components/Footer/index.tsx`, `src/pages/User/Login/index.tsx`
**优先级**: 高

**当前 V5 实现**:
```typescript
// defaultSettings.ts
title: 'Ant Design Pro',
subTitle: 'This is subTitle',
copyright: 'Power by PKAQ © 2022',
version: '5.0',
```
Footer 和 Login 页面从 defaultSettings 读取这些值。

**V6 对照**: V6 Footer 显示版本号和 commit hash（#11660），结构已重构。

**迁移动作**:
1. 在 V6 的 `defaultSettings.ts` 中添加 `subTitle`, `copyright`, `version` 字段（含类型声明）
2. 修改 V6 Footer 组件，使用 `settings.copyright` 替代默认内容
3. 修改 V6 Login 页面的 `LoginForm`，使用 `settings.title` 和 `settings.subTitle`
4. ⚠️ V6 的 Footer 可能使用 Tailwind 样式，注意适配

---

### TASK-07: 自定义组件（第一批：BizIcon / WaterFall / Selector / TreeSelector 等）

**V5 Commit**: `59231ea`
**涉及文件**: `src/components/` 下 13 个新组件
**优先级**: 高

**当前 V5 组件清单**:
BizIcon, CopyBlock, CountDown, DictSelector, IconSelect, LunarCalendar, Page, PageLoading, PatternLock, Selector, SideLayout, TreeSelector, WaterFall

**V6 对照**: V6 新增了骨架屏 Loading 组件（#11505），提取了共享组件（#11692），但**无上述业务组件**。

**迁移动作**:
1. 将所有自定义组件复制到 V6 项目的 `src/components/`
2. ⚠️ **样式重写**：所有组件的 `.less` 文件需迁移为 Tailwind / antd-style / CSS Modules
3. ⚠️ **Class→函数式**：SideLayout, IconSelect, LunarCalendar, CountDown 等 Class 组件需重写为函数式组件
4. ⚠️ **lodash 替换**：检查组件中 lodash 使用，按 V6 规范替换为原生 API
5. ⚠️ **antd API**：antd 5→6 的组件 API 变化需逐一检查
6. PageLoading 可能与 V6 新增的骨架屏 Loading 组件功能重叠，评估合并

---

### TASK-08: 系统管理模块（sys / log / dev）

**V5 Commit**: `49642b8`
**涉及文件**: `src/pages/sys/`, `src/pages/log/`, `src/pages/dev/`
**优先级**: 高

**当前 V5 模块**:
- `sys/`: account(用户), dictionary(字典), module(模块), organization(组织), role(角色)
- `log/`: biz(业务日志), error(错误日志), online(在线用户)
- `dev/`: generator(代码生成), workflow(工作流)

**V6 对照**: V6 **无上述业务模块**（V6 只有示例页面）。

**迁移动作**:
1. 将所有业务模块页面复制到 V6 项目
2. ⚠️ **全面重构工作量最大的任务**：
   - 所有 `.jsx` 文件需转为 `.tsx`
   - Less 样式需迁移为 Tailwind / CSS Modules
   - `useRequest` 需替换为 React Query（`useQuery` / `useMutation`）
   - Class 组件（如 EditableList）需重写为函数式
   - ProTable/ProForm API 需适配 ProComponents v3
   - lodash 按需替换
3. 在 V6 的 `config/routes.ts` 中注册这些页面路由
4. API 路径常量文件 `src/apis.js`（→ `.ts`）需一并迁移

---

### TASK-09: 页面加载 loading

**V5 Commit**: `f3b0fdd`
**涉及文件**: `src/app.tsx`, `public/scripts/loading.js`
**优先级**: 中

**当前 V5 实现**:
- `public/scripts/loading.js`：首次加载白屏时显示 loading 动画
- `config/config.ts` 中 headScripts 引入该脚本
- `app.tsx` 的 childrenRender 中使用 `<PageLoading />`

**V6 对照**: V6 已有骨架屏 Loading 组件（#11505, #11510），且修复了首次加载白屏问题（#10347）。

**迁移动作**:
1. 评估 V6 内置的 Loading 方案是否满足需求
2. 如果 V6 方案足够好 → **跳过迁移**
3. 如果需要保留 EVA 的 loading 样式 → 将 `loading.js` 复制到 V6，在 config 中配置 headScripts
4. ⚠️ V6 使用 utoopack，headScripts 的配置方式可能有变化，需确认

---

### TASK-10: 自定义工具类

**V5 Commit**: `697c7bb`
**涉及文件**: `src/utils/`
**优先级**: 高

**当前 V5 工具类**:
- `DataHelper.ts` — 菜单格式化（loopMenuItem）、树操作、字典过滤
- `events.ts` — EventEmitter 实例
- `screenlog.ts` — 控制台 ASCII Logo
- `utils.ts` — URL 判断、登出、cookie 清除、getPageQuery
- `http.ts` — HTTP 请求封装（get/list/edit/del/post）

**V6 对照**: V6 使用 React Query 替代自定义请求封装，lodash 替换为原生 API。

**迁移动作**:
1. `DataHelper.ts` → 迁移，将 lodash 的 `cloneDeep` 替换为 `structuredClone` 或保留 lodash 局部引入
2. `events.ts` → 迁移（极简，无依赖变化）
3. `screenlog.ts` → 迁移（纯 console 输出，无依赖变化）
4. `utils.ts` → 迁移，cookie 操作保留 `universal-cookie`，确认 `qs` 库版本兼容
5. `http.ts` → ⚠️ 评估是否保留。V6 推荐 React Query，但 http.ts 用于非 hook 场景（service 层），两者可共存。建议保留为底层请求工具

---

### TASK-11: 控制台打印 logo

**V5 Commit**: `13e1afc`
**涉及文件**: `src/app.tsx`, `src/utils/screenlog.ts`
**优先级**: 低

**当前 V5 实现**: `printANSI()` 在 app.tsx 顶层调用，打印 EVA PRO ASCII Art。

**V6 对照**: V6 无此功能。

**迁移动作**:
1. 复制 `screenlog.ts` 到 V6 项目
2. 在 V6 的 `src/app.tsx` 顶层调用 `printANSI()`
3. 更新 Build date 和版本号

---

### TASK-12: request 异常处理增强

**V5 Commit**: `9673fb7`
**涉及文件**: `src/app.tsx`, `config/defaultSettings.ts`
**优先级**: 高

**当前 V5 实现**:
- `errorHandler`: HTTP 状态码判断、网络异常 notification
- `requestInterceptors`: 注入 Accept, Content-Type, device, version 等 header
- `responseInterceptors`: 判断 `data.success`，失败弹出 message.error
- 导出 `request: RequestConfig` 配置

**V6 对照**: V6 使用 React Query 替代 useRequest，请求管线已重构（#11693）。但 umi 的 request 配置仍然可用。

**迁移动作**:
1. ⚠️ 需理解 V6 的请求架构：React Query 管理缓存/状态，底层仍可使用 umi request
2. 在 V6 的 `app.tsx` 中配置 `request` 的 errorConfig、requestInterceptors、responseInterceptors
3. requestInterceptors 中注入自定义 headers（device, version）
4. responseInterceptors 中处理 `data.success` 判断
5. 确保 React Query 的 error handling 与 request errorHandler 不冲突

---

### TASK-13: 从后台加载信息（service 层 + 图标映射 + 远程菜单）

**V5 Commits**: `05e5acf`, `e9bc6ac`, `04cf251`
**涉及文件**: `src/services/`, `src/appicon.jsx`, `src/app.tsx`, `src/utils/DataHelper.ts`
**优先级**: 高

**当前 V5 实现**:
- `services/login.ts` — 登录接口 `/api/auth/login`
- `services/user.ts` — `fetchMenus()`, `fetchDict()`, `repwd()` 等接口
- `services/API.d.ts` — 类型定义
- `apis.js` — 全部 API 路径常量集中管理
- `appicon.jsx` — 菜单图标映射（12 个 antd icon）
- `app.tsx` 的 `menu.request` — 远程加载菜单 + `loopMenuItem` 渲染自定义图标

**V6 对照**: V6 使用 Cloudflare Worker 后端 + React Query，菜单配置为本地路由。

**迁移动作**:
1. 迁移 `services/login.ts`, `services/user.ts`, `services/API.d.ts` 到 V6
2. 迁移 `apis.js` → `apis.ts`
3. 迁移 `appicon.jsx` → `appicon.tsx`，确认 @ant-design/icons v6 中图标名称/API 是否变化
4. 在 V6 的 `app.tsx` 中配置 `menu.request`，使用 `loopMenuItem` 处理远程菜单数据
5. ⚠️ V6 的 layout 插件配置方式可能有变化，需确认 `RunTimeLayoutConfig` 的 `menu` 选项

---

### TASK-14: 判断本地登录信息，未登录跳转登录页

**V5 Commit**: `01f1f9d`
**涉及文件**: `src/app.tsx`, `src/constant.tsx`
**优先级**: 高

**当前 V5 实现**:
```typescript
// constant.tsx
export const access_token = 'access_token';
export const refresh_token = 'refresh_token';

// app.tsx getInitialState
if(!cookie.get(access_token)){
  history.push(loginPath);
}
// layout.onPageChange
if (!cookie.get(access_token) && location.pathname !== loginPath) {
  history.push(loginPath);
}
```

**V6 对照**: V6 可能使用不同的认证判断方式（基于 initialState 或 access 插件）。

**迁移动作**:
1. 迁移 `constant.tsx` 到 V6
2. 安装 `universal-cookie` 依赖
3. 在 V6 的 `getInitialState` 中添加 cookie 检查逻辑
4. 在 V6 的 `layout.onPageChange` 中添加登录重定向逻辑
5. ⚠️ 确认 V6 的 access 插件是否有冲突，可能需要整合

---

### TASK-15: 登录后设置 cookie

**V5 Commit**: `7c2c272`
**涉及文件**: `src/pages/User/Login/index.tsx`, `src/app.tsx`
**优先级**: 高

**当前 V5 实现**（从 diff 确认）:
```typescript
import Cookies from 'universal-cookie';
const cookie = new Cookies();
// 登录成功后
cookie.set("access_token", "access_token");
```
同时优化了 responseInterceptors 逻辑和移除了 console 调试语句。

**V6 对照**: V6 无 cookie 管理逻辑。

**迁移动作**:
1. 在 V6 登录成功回调中添加 cookie 写入逻辑
2. ⚠️ 目前 V5 写入的是硬编码值 `cookie.set("access_token", "access_token")`，建议改为写入后端返回的真实 token
3. 配合 TASK-14 的 cookie 检查逻辑

---

### TASK-16: 自定义组件（第二批：用户设置页 / withAuth / 更多页面）

**V5 Commit**: `fd5f539`
**涉及文件**: 大量文件（用户设置页面、权限包装组件、页面修改等）
**优先级**: 中

**当前 V5 新增**:
- `src/pages/User/settings/` — 完整的用户设置页（基本信息/安全设置/账号绑定/通知设置/修改密码）
- `src/pages/withAuth.jsx` — 鉴权高阶组件
- `src/apis.js` — API 常量（已含在 TASK-13）

**V6 对照**: V6 有更新的个人中心示例页面。

**迁移动作**:
1. 迁移 `src/pages/User/settings/` 全部文件
2. ⚠️ Less→Tailwind/CSS Modules 样式重写
3. ⚠️ Class 组件（notification.tsx, base.tsx）→ 函数式组件
4. 迁移 `withAuth.jsx` → `withAuth.tsx`
5. 在 routes 中注册用户设置页面路由
6. 评估 V6 的 access 插件是否可替代 withAuth

---

### TASK-17: 全局样式调整

**V5 Commits**: `8bf14a8`, `761de5e`
**涉及文件**: `src/global.less`
**优先级**: 高

**当前 V5 实现**: 大量全局样式覆盖（表格/表单/布局/滚动条/菜单/内容区等），约 250 行 Less。

**V6 对照**: V6 **完全移除了 Less**，使用 Tailwind CSS + antd-style + CSS Modules。

**迁移动作**:
1. ⚠️ **这是工作量最大的样式任务**
2. 逐条审查 `global.less` 中的样式规则，决定迁移策略：
   - antd 组件覆盖样式 → 通过 antd 6 的 CSS 变量 / ConfigProvider theme token 实现
   - 布局样式 → Tailwind 工具类
   - 自定义 class（`.eva-ribbon`, `.eva-body`, `.eva-alert`, `.eva-locked` 等）→ CSS Modules 或全局 CSS 文件
   - 滚动条样式 → 保留为全局 CSS
3. 部分样式可能因 V6 的布局重构而不再需要，需逐一验证
4. 建议创建 `src/global.css`（非 Less）存放仍需全局覆盖的样式

---

### TASK-18: 登录成功后加载字典

**V5 Commit**: `ddbabbc`
**涉及文件**: `src/app.tsx`, `src/services/user.ts`, `src/services/ant-design-pro/typings.d.ts`
**优先级**: 高

**当前 V5 实现**:
```typescript
// services/user.ts
export async function fetchDict() { return request('/api/auth/fetchDicts', { method: 'GET' }); }

// app.tsx getInitialState
const initDict = async () => { return await fetchDict(); }
// 非登录页时调用
const dict: any = initDict();
return { dict: dict?.data, settings: ... };
```

**V6 对照**: V6 无字典加载逻辑。

**迁移动作**:
1. 在 V6 的 `services/` 中添加 `fetchDict` 方法
2. 在 `getInitialState` 中调用并存储字典数据
3. 在 `typings.d.ts` 中添加 `dict` 类型
4. ⚠️ 考虑是否使用 React Query 缓存字典数据（推荐，字典数据适合长缓存）

---

### TASK-19: 登录优化

**V5 Commit**: `4c0021e`
**涉及文件**: `src/app.tsx`, `src/pages/User/Login/index.tsx`, `src/services/`
**优先级**: 中

**当前 V5 实现**:
- MD5 加密（已含在 TASK-01）
- `flushSync` 同步更新 initialState
- `setTimeout` 解决内存泄漏后再跳转
- `refresh()` 刷新全局状态

**V6 对照**: V6 的登录流程为标准示例。

**迁移动作**:
1. 整合到 TASK-01 和 TASK-15 中一并实现
2. 确保登录成功后的执行顺序：MD5加密 → 调用接口 → 设置cookie → flushSync更新state → refresh → setTimeout跳转
3. ⚠️ React 19 中 flushSync 行为可能有变化，需测试

---

### TASK-20: CRUD 通用 service 方法

**V5 Commit**: `d93b3ac`
**涉及文件**: `src/services/service.js` → 应迁移为 `src/utils/http.ts`（V5 EVA 已合并）
**优先级**: 中

**V5 Commit 具体内容**（从 diff 确认）:
向 service.js 添加了 `edit` 和 `del` 两个 POST 方法。V5 EVA trunk 已将其合并到 `http.ts`。

**V6 对照**: V6 使用 React Query，无通用 service 封装层。

**迁移动作**:
1. 迁移 `src/utils/http.ts`（包含 get/list/edit/del/post 方法）到 V6
2. ⚠️ 底层 request 确认使用 `@umijs/max` 的 request 还是 V6 新增的其他方式
3. 此工具类作为业务模块（TASK-08）的数据请求底层，即使 V6 推荐 React Query，非 hook 场景仍需要

---

### TASK-21: 防抖远程选择组件（DebounSelector）

**V5 Commit**: `3a0872a`
**涉及文件**: `src/components/DebounSelector/index.jsx`
**优先级**: 中

**当前 V5 实现**: 基于 `lodash/debounce` + `Select` + `Spin` 的防抖远程搜索选择器。

**V6 对照**: V6 无此组件。

**迁移动作**:
1. 复制到 V6 项目
2. `.jsx` → `.tsx`，添加 TypeScript 类型
3. ⚠️ `lodash/debounce` → 可用原生 `setTimeout` 实现或保留 lodash 单函数引入
4. ⚠️ 确认 antd 6 的 Select API 兼容性

---

### TASK-22: 列表加载判空

**V5 Commit**: `6f1c40a`
**涉及文件**: `src/utils/http.js` → V6 对应 `src/utils/http.ts`
**优先级**: 低

**V5 Commit 具体内容**（从 diff 确认）:
```typescript
// 修改前
return request(`${url}?${stringify(params)}`);
// 修改后
const urls = params ? `${url}?${stringify(params)}` : url;
return request(urls);
```

**迁移动作**: 已包含在 TASK-20 的 http.ts 迁移中，V5 EVA trunk 的 http.ts 已有此判空逻辑，无需单独处理。

---

### TASK-23: 设置 title

**V5 Commit**: `15bafaf`
**涉及文件**: `src/locales/`, `src/pages/User/Login/index.tsx`
**优先级**: 低

**当前 V5 实现**:
```typescript
document.title = `登录 - ${setting.title}`;
```
同时更新了 locale 文件中的 title 相关翻译。

**V6 对照**: V6 已修复了刷新时标题不显示的问题（#10455），且修复了 `title={false}` 不生效的问题（#11364）。

**迁移动作**:
1. 在 V6 Login 页面中通过 `document.title` 或 Helmet 设置登录页标题
2. 更新 locale 文件中的 title 翻译
3. 利用 TASK-06 中 `settings.title` 的配置

---

## 📋 推荐迁移顺序

按依赖关系和优先级排列：

### 第一阶段：基础设施（无 UI，其他任务依赖）
1. **TASK-10** — 工具类（http.ts / DataHelper.ts / utils.ts 等）← 其他任务的基础依赖
2. **TASK-14** — 登录判断 + constant.tsx ← 登录流程的前置
3. **TASK-12** — request 增强 ← 所有接口请求的基础
4. **TASK-13** — service 层 + API 常量 + 图标映射 ← 业务模块的基础

### 第二阶段：登录流程
5. **TASK-04** — 精简登录页（只保留账号密码）
6. **TASK-01** — 密码 MD5 加密
7. **TASK-15** — 登录后设置 cookie
8. **TASK-18** — 登录后加载字典
9. **TASK-19** — 登录优化（整合上述）

### 第三阶段：布局与配置
10. **TASK-06** — title/subtitle/copyright 可配置
11. **TASK-02** — 全屏按钮
12. **TASK-03** — 国际化文件精简
13. **TASK-23** — 设置 title
14. **TASK-11** — 控制台 logo
15. **TASK-05** — 自动打开浏览器

### 第四阶段：样式（工作量大，建议独立进行）
16. **TASK-17** — 全局样式 Less → Tailwind/CSS 迁移

### 第五阶段：组件与页面
17. **TASK-07** — 自定义组件（第一批）
18. **TASK-21** — DebounSelector
19. **TASK-16** — 自定义组件（第二批）+ 用户设置页
20. **TASK-20** — CRUD service（已含在 TASK-10）
21. **TASK-22** — 判空（已含在 TASK-20）
22. **TASK-09** — 页面 loading（评估 V6 方案后决定）

### 第六阶段：业务模块（工作量最大，Class→函数式+Less→Tailwind+useRequest→React Query）
23. **TASK-08** — 系统管理全部模块

---

## ⚠️ 全局注意事项

1. **Less 全部不可直接用**: V6 移除了 Less 支持，所有 `.less` 文件必须重写为 Tailwind / antd-style / CSS Modules
2. **Class 组件必须重写**: V6 已全面转向函数式组件
3. **lodash 按需替换**: V6 推荐原生 API，如 `cloneDeep` → `structuredClone`，但业务代码中复杂用法可保留 lodash 单函数引入
4. **useRequest → React Query**: 业务模块中的数据请求需迁移，但底层 `request()` 函数仍可用
5. **antd 5→6 API 变化**: 需逐一检查组件属性变化
6. **@ant-design/icons 5→6**: 图标名称和导入方式可能变化
7. **ProComponents v2→v3**: 导入从分散包改为统一 `@ant-design/pro-components`，部分 API 变化
8. **TypeScript 升级**: V6 使用 TS 6.x，可能有类型检查差异
