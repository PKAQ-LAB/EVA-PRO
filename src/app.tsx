import { LinkOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import { history, Link } from '@umijs/max';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React from 'react';

// Initialize dayjs plugins globally
dayjs.extend(relativeTime);

import Cookies from 'universal-cookie';
import IconMap from '@/appicon';
import {
  AvatarDropdown,
  DocLink,
  ErrorBoundary,
  Footer,
  FullscreenToggle,
  LangDropdown,
  OfflineBanner,
  PageLoading,
  VersionDropdown,
} from '@/components';
import { user_key } from '@/constant';
import { fetchDict, fetchMenus } from '@/services/user';
import {
  clearAuthState,
  isAuthExpiredError,
  redirectToLogin,
} from '@/utils/authState';
import { loopMenuItem } from '@/utils/DataHelper';
import { printANSI } from '@/utils/screenlog';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';

// 启动时打印 ASCII 欢迎语 (TASK-11)
printANSI();

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';
const loginMenuCacheKey = 'eva_login_menus';
const currentUserCacheKey = 'eva_current_user';
const registeredMenuRoutes = new Set([
  '/welcome',
  '/admin/sub-page',
  '/list',
  '/sys/account',
  '/sys/organization',
  '/sys/role',
  '/sys/module',
  '/sys/dictionary',
  '/log/online',
  '/log/biz',
  '/log/error',
  '/dev/generator',
  '/dev/workflow',
]);

function extractMenus(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  const payload = (data || {}) as Record<string, unknown>;
  const candidates = [
    payload.menus,
    payload.menu,
    payload.routes,
    payload.modules,
    payload.resources,
  ];
  return (candidates.find(Array.isArray) as unknown[]) || [];
}

function normalizeMenuPaths(menus: unknown[]): unknown[] {
  return menus
    .map((menu) => {
      const item = menu as Record<string, unknown>;
      const path = item.path ?? item.routeurl ?? item.routeUrl;
      const normalizedPath =
        typeof path === 'string' && path
          ? path.startsWith('/')
            ? path
            : `/${path}`
          : undefined;
      const children = Array.isArray(item.children)
        ? normalizeMenuPaths(item.children)
        : undefined;
      return {
        ...item,
        ...(normalizedPath ? { path: normalizedPath } : {}),
        ...(children?.length ? { children } : {}),
      };
    })
    .filter((menu) => {
      const item = menu as Record<string, unknown>;
      return (
        (typeof item.path === 'string' &&
          registeredMenuRoutes.has(item.path)) ||
        (Array.isArray(item.children) && item.children.length > 0)
      );
    });
}

function normalizeCurrentUser(
  data: unknown,
  fallbackUser?: Record<string, unknown>,
): API.CurrentUser | undefined {
  const menus = extractMenus(data);
  const baseUser = fallbackUser || {};
  if (Array.isArray(data)) {
    return {
      ...baseUser,
      name:
        (baseUser.name as string | undefined) ??
        (baseUser.nickName as string | undefined) ??
        (baseUser.account as string | undefined) ??
        (baseUser.username as string | undefined) ??
        'Admin',
      access: (baseUser.access as string | undefined) ?? 'admin',
      menus,
    } as API.CurrentUser;
  }
  const payload = (data || {}) as Record<string, unknown>;
  const user =
    (payload.user as Record<string, unknown> | undefined) ??
    (payload.currentUser as Record<string, unknown> | undefined) ??
    (payload.account as Record<string, unknown> | undefined) ??
    (payload.profile as Record<string, unknown> | undefined) ??
    payload;
  const mergedUser = { ...baseUser, ...user };
  if (!mergedUser || Object.keys(mergedUser).length === 0) return undefined;
  return {
    ...mergedUser,
    menus,
    name:
      (mergedUser.name as string | undefined) ??
      (mergedUser.nickName as string | undefined) ??
      (mergedUser.account as string | undefined) ??
      (mergedUser.username as string | undefined) ??
      'Admin',
    access: (mergedUser.access as string | undefined) ?? 'admin',
  } as API.CurrentUser;
}

function getCachedCurrentUser() {
  const cookies = new Cookies();
  const cookieUser = cookies.get(user_key);
  if (cookieUser) {
    if (typeof cookieUser === 'object') {
      return cookieUser as Record<string, unknown>;
    }
    try {
      return JSON.parse(cookieUser) as Record<string, unknown>;
    } catch {
      cookies.remove(user_key, { maxAge: -1, path: '/' });
    }
  }
  const cachedUser = window.sessionStorage.getItem(currentUserCacheKey);
  if (!cachedUser) return undefined;
  try {
    return JSON.parse(cachedUser) as Record<string, unknown>;
  } catch {
    window.sessionStorage.removeItem(currentUserCacheKey);
    return undefined;
  }
}

/**
 * @see https://umijs.org/docs/api/runtime-config#getinitialstate
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  dict?: Record<string, unknown>;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
  fetchDict?: () => Promise<Record<string, unknown> | undefined>;
  settingDrawerOpen?: boolean;
}> {
  const fetchUserInfo = async () => {
    try {
      const cachedUser = getCachedCurrentUser();
      const cachedMenus = window.sessionStorage.getItem(loginMenuCacheKey);
      if (cachedMenus) {
        window.sessionStorage.removeItem(loginMenuCacheKey);
        try {
          return normalizeCurrentUser(JSON.parse(cachedMenus), cachedUser);
        } catch {
          // 缓存只用于登录后首屏加速，异常时继续走后端接口。
        }
      }
      const msg = await fetchMenus({
        skipErrorHandler: true,
      });
      return normalizeCurrentUser(msg.data, cachedUser);
    } catch (error) {
      if (isAuthExpiredError(error)) {
        clearAuthState();
        redirectToLogin();
      }
    }
    return undefined;
  };
  /**
   * 加载全量字典：登录后非登录页时会预加载，挂在 initialState.dict
   * 上供下游业务使用。建议字典字段较多时改用 React Query 长缓存。
   */
  const initDict = async (): Promise<Record<string, unknown> | undefined> => {
    try {
      const res = await fetchDict({ skipErrorHandler: true });
      return (res?.data as Record<string, unknown>) ?? {};
    } catch (error) {
      if (isAuthExpiredError(error)) {
        clearAuthState();
        redirectToLogin();
      }
      return undefined;
    }
  };
  const { location } = history;
  // 非登录页始终请求后端初始化登录态，只有后端 401/鉴权失效码才跳登录。
  if (
    ![loginPath, '/user/register', '/user/register-result'].includes(
      location.pathname,
    )
  ) {
    const [currentUser, dict] = await Promise.all([
      fetchUserInfo(),
      initDict(),
    ]);
    return {
      fetchUserInfo,
      fetchDict: initDict,
      currentUser,
      dict,
      settings: defaultSettings as Partial<LayoutSettings>,
      settingDrawerOpen: false,
    };
  }
  return {
    fetchUserInfo,
    fetchDict: initDict,
    settings: defaultSettings as Partial<LayoutSettings>,
    settingDrawerOpen: false,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({
  initialState,
  setInitialState,
}) => {
  return {
    menuItemRender: (item, dom) => {
      if (item.path) {
        return (
          <Link to={item.path} prefetch>
            {dom}
          </Link>
        );
      }
      return dom;
    },
    /**
     * 远程菜单：从后端 /api/auth/fetchMenus 拉取菜单树，
     * 用 loopMenuItem 将字符串图标名映射成对应的 React 节点。
     * 后端不可达时落空菜单（不会影响 layout 渲染）。
     */
    menu: {
      locale: true,
      request: async () => {
        try {
          const currentMenus = (
            initialState?.currentUser as
              | (API.CurrentUser & { menus?: unknown[] })
              | undefined
          )?.menus;
          if (Array.isArray(currentMenus) && currentMenus.length > 0) {
            return loopMenuItem(
              normalizeMenuPaths(currentMenus) as never[],
              IconMap,
            ) as never[];
          }
          const res = await fetchMenus({ skipErrorHandler: true });
          return loopMenuItem(
            normalizeMenuPaths(extractMenus(res?.data)) as never[],
            IconMap,
          ) as never[];
        } catch (error) {
          if (isAuthExpiredError(error)) {
            clearAuthState();
            redirectToLogin();
          }
          return [];
        }
      },
    },
    actionsRender: () => [
      <DocLink key="doc" />,
      <FullscreenToggle key="fullscreen" />,
      <VersionDropdown key="version" />,
      <LangDropdown key="lang" />,
    ],
    avatarProps: {
      src: initialState?.currentUser?.avatar,
      title: 'ProUser',
      render: (_, avatarChildren) => (
        <AvatarDropdown>{avatarChildren}</AvatarDropdown>
      ),
    },
    // waterMarkProps: {
    //   content: initialState?.currentUser?.name,
    // },
    footerRender: () => <Footer />,
    bgLayoutImgList: [
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],
    links: isDev
      ? [
          <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
            <LinkOutlined />
            <span>OpenAPI 文档</span>
          </Link>,
        ]
      : [],
    // Replace ProLayout's default ErrorBoundary with our offline-aware version,
    // so chunk load errors show friendly messages instead of "Something went wrong."
    ErrorBoundary,
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          <SettingDrawer
            disableUrlParams
            enableDarkTheme
            collapse={initialState?.settingDrawerOpen}
            onCollapseChange={(open) => {
              setInitialState((s) => ({
                ...s,
                settingDrawerOpen: open,
              }));
            }}
            settings={initialState?.settings}
            onSettingChange={(settings) => {
              setInitialState((s) => ({
                ...s,
                settings,
              }));
            }}
          />
        </>
      );
    },
    ...initialState?.settings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request: RequestConfig = {
  baseURL: isDev ? '' : 'https://pro-api.ant-design-demo.workers.dev',
  // 默认请求带上同源 cookie（包含 access_token）
  withCredentials: true,
  ...errorConfig,
};

export function rootContainer(container: React.ReactNode) {
  return (
    <>
      <OfflineBanner />
      <ErrorBoundary>{container}</ErrorBoundary>
    </>
  );
}
