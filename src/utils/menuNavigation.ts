export interface MenuNavigationItem extends Record<string, unknown> {
  children?: MenuNavigationItem[];
}

export interface MenuNavigationTarget {
  path: string;
}

const routeFallbacks = ['/sys/user', '/sys/account', '/welcome'];

const registeredMenuRoutes = new Set([
  '/welcome',
  '/admin/sub-page',
  '/list',
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
  '/dev',
  '/dev/generator',
  '/dev/workflow',
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
  dev: '开发工具',
  'dev.generator': '代码生成',
  'dev.workflow': '工作流',
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
  dev: '/dev',
  'dev.generator': '/dev/generator',
  'dev.workflow': '/dev/workflow',
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
    .map((item) => {
      const { children: originalChildren, ...itemWithoutChildren } = item;
      const normalizedPath = getMenuPath(item);
      const displayName = getMenuDisplayName(item);
      const children = Array.isArray(originalChildren)
        ? normalizeMenuPaths(originalChildren)
        : undefined;
      return {
        ...itemWithoutChildren,
        ...(displayName ? { name: displayName } : {}),
        ...(normalizedPath
          ? { key: normalizedPath, path: normalizedPath }
          : {}),
        ...(children?.length ? { children } : {}),
      };
    })
    .filter((item) => {
      return (
        (typeof item.path === 'string' &&
          registeredMenuRoutes.has(item.path)) ||
        (Array.isArray(item.children) && item.children.length > 0)
      );
    });
}

function findFirstAccessiblePath(
  items: MenuNavigationItem[],
): string | undefined {
  for (const item of items) {
    const path = getMenuPath(item);
    if (path) return path;
    if (Array.isArray(item.children)) {
      const descendantPath = findFirstAccessiblePath(item.children);
      if (descendantPath) return descendantPath;
    }
  }
  return undefined;
}

function findPreferredChildPath(root: MenuNavigationItem) {
  if (!Array.isArray(root.children)) return undefined;
  for (const child of root.children) {
    const directPath = getMenuPath(child);
    if (directPath) return directPath;
    if (Array.isArray(child.children)) {
      const descendantPath = findFirstAccessiblePath(child.children);
      if (descendantPath) return descendantPath;
    }
  }
  return undefined;
}

export function resolveMenuNavigation(
  menus: MenuNavigationItem[],
): MenuNavigationTarget {
  for (const root of menus) {
    const path = findPreferredChildPath(root) || getMenuPath(root);
    if (!path) continue;
    return { path };
  }
  return {
    path: routeFallbacks.find((path) => registeredMenuRoutes.has(path)) || '/',
  };
}
