export interface MenuNavigationItem extends Record<string, unknown> {
  children?: MenuNavigationItem[];
}

export interface MenuNavigationTarget {
  path: string;
}

const noPermissionPath = '/exception/403';

const redirectOnlyRoutes = new Set(['/sys', '/log']);

const registeredMenuRoutes = new Set([
  '/sys',
  '/sys/account',
  '/sys/user',
  '/sys/organization',
  '/sys/role',
  '/sys/module',
  '/sys/dictionary',
  '/log',
  '/log/online',
  '/log/biz',
  '/log/error',
]);

const menuDisplayNames: Record<string, string> = {
  sys: '系统管理',
  'sys.account': '用户管理',
  'sys.user': '用户管理',
  'sys.organization': '组织管理',
  'sys.role': '角色管理',
  'sys.module': '模块管理',
  'sys.dictionary': '字典管理',
  log: '系统日志',
  'log.online': '在线用户',
  'log.biz': '业务日志',
  'log.error': '错误日志',
};

const menuRouteAliases: Record<string, string> = {
  sys: '/sys',
  'sys.account': '/sys/user',
  'sys.user': '/sys/user',
  'sys.organization': '/sys/organization',
  'sys.role': '/sys/role',
  'sys.module': '/sys/module',
  'sys.dictionary': '/sys/dictionary',
  log: '/log',
  'log.online': '/log/online',
  'log.biz': '/log/biz',
  'log.error': '/log/error',
};

function normalizeRoutePath(path?: unknown) {
  if (typeof path !== 'string' || !path || path === '/user/login') {
    return undefined;
  }
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return registeredMenuRoutes.has(normalizedPath) ? normalizedPath : undefined;
}

function getMenuCandidates(item: MenuNavigationItem) {
  return [
    item.code,
    item.name,
    item.title,
    item.menuCode,
    item.moduleCode,
    item.permission,
    item.authority,
  ];
}

// 移除整个开发工具分组，避免后台遗留菜单继续提供访问入口。
function isRemovedDevMenu(item: MenuNavigationItem) {
  const hasDevPath = [
    item.routeurl,
    item.routeUrl,
    item.url,
    item.router,
    item.path,
  ].some(
    (value) => typeof value === 'string' && /^\/?dev(?:\/|$|[?#])/.test(value),
  );
  return (
    hasDevPath ||
    getMenuCandidates(item).some(
      (value) =>
        typeof value === 'string' && /^(?:menu\.)?dev(?:\.|$)/.test(value),
    )
  );
}

export function getMenuDisplayName(item: MenuNavigationItem) {
  for (const identity of getMenuCandidates(item)) {
    if (typeof identity !== 'string') continue;
    if (menuDisplayNames[identity]) return menuDisplayNames[identity];
    if (identity.startsWith('menu.') && menuDisplayNames[identity.slice(5)]) {
      return menuDisplayNames[identity.slice(5)];
    }
  }
  return typeof item.title === 'string'
    ? item.title
    : typeof item.name === 'string'
      ? item.name
      : undefined;
}

export function getMenuPath(item: MenuNavigationItem) {
  if (isRemovedDevMenu(item)) return undefined;
  const explicitPath =
    normalizeRoutePath(item.routeurl) ||
    normalizeRoutePath(item.routeUrl) ||
    normalizeRoutePath(item.url) ||
    normalizeRoutePath(item.router) ||
    normalizeRoutePath(item.path);
  if (explicitPath) return explicitPath;

  for (const identity of getMenuCandidates(item)) {
    if (typeof identity !== 'string') continue;
    if (menuRouteAliases[identity]) return menuRouteAliases[identity];
    if (identity.startsWith('menu.') && menuRouteAliases[identity.slice(5)]) {
      return menuRouteAliases[identity.slice(5)];
    }
  }
  return undefined;
}

export function extractMenus(data: unknown): MenuNavigationItem[] {
  if (Array.isArray(data)) return data as MenuNavigationItem[];
  const payload = (data || {}) as Record<string, unknown>;
  const candidates = [
    payload.menus,
    payload.menu,
    payload.routes,
    payload.modules,
    payload.resources,
  ];
  return (candidates.find(Array.isArray) as MenuNavigationItem[]) || [];
}

export function normalizeMenuPaths(menus: MenuNavigationItem[]): unknown[] {
  return menus
    .flatMap((item) => {
      if (isRemovedDevMenu(item)) return [];
      const { children: originalChildren, ...itemWithoutChildren } = item;
      const normalizedPath = getMenuPath(item);
      const displayName = getMenuDisplayName(item);
      const children = Array.isArray(originalChildren)
        ? normalizeMenuPaths(originalChildren)
        : undefined;
      if (originalChildren?.length && !children?.length) return [];
      return [
        {
          ...itemWithoutChildren,
          ...(displayName ? { name: displayName } : {}),
          ...(normalizedPath
            ? { key: normalizedPath, path: normalizedPath }
            : {}),
          ...(children?.length ? { children } : {}),
        },
      ];
    })
    .filter((item) => {
      const hasChildren =
        Array.isArray(item.children) && item.children.length > 0;
      return (
        (typeof item.path === 'string' &&
          registeredMenuRoutes.has(item.path) &&
          !redirectOnlyRoutes.has(item.path)) ||
        hasChildren
      );
    });
}

function findFirstAccessibleLeafPath(
  items: MenuNavigationItem[],
): string | undefined {
  for (const item of items) {
    if (isRemovedDevMenu(item)) continue;
    if (Array.isArray(item.children) && item.children.length > 0) {
      const descendantPath = findFirstAccessibleLeafPath(item.children);
      if (descendantPath) return descendantPath;
      continue;
    }
    const path = getMenuPath(item);
    if (path && !redirectOnlyRoutes.has(path)) return path;
  }
  return undefined;
}

export function resolveMenuNavigation(
  menus: MenuNavigationItem[],
): MenuNavigationTarget {
  return { path: findFirstAccessibleLeafPath(menus) || noPermissionPath };
}
