export type ResourcePermissionUser = API.CurrentUser & {
  menus?: unknown;
  resourcePermissionEnabled?: boolean;
  dataPermissionEnabled?: boolean;
};

export type CanAction = (menuIdentifier: string, key: string) => boolean;

/** 只信任成功认证响应的外层布尔值，禁止从缓存身份回填开关。 */
export function resourcePermissionFromResponse(response: {
  success?: boolean;
  status?: string;
  resourcePermissionEnabled?: unknown;
}): boolean | undefined {
  return response.success !== false &&
    (response.success === true || response.status === 'ok') &&
    typeof response.resourcePermissionEnabled === 'boolean'
    ? response.resourcePermissionEnabled
    : undefined;
}

function visitMenus(
  menus: unknown,
  visit: (menu: Record<string, unknown>) => void,
) {
  const seen = new Set<object>();
  const walk = (nodes: unknown) => {
    if (!Array.isArray(nodes)) return;
    for (const node of nodes) {
      if (!node || typeof node !== 'object' || seen.has(node)) continue;
      seen.add(node);
      visit(node);
      walk(node.children);
    }
  };
  walk(menus);
}

const canonicalRoute = (route: string) =>
  route === '/sys/user' ? '/sys/account' : route;

/** 页面路由只在唯一精确匹配时解析到稳定菜单 ID。 */
export function resolveMenuId(
  user: ResourcePermissionUser | undefined,
  route: string,
) {
  const matches: string[] = [];
  visitMenus(user?.menus, (menu) => {
    const path = typeof menu.routeUrl === 'string' ? menu.routeUrl : undefined;
    if (
      path &&
      canonicalRoute(path) === canonicalRoute(route) &&
      typeof menu.id === 'string' &&
      menu.id.trim()
    )
      matches.push(menu.id);
  });
  return matches.length === 1 ? matches[0] : undefined;
}

/** 只按指定菜单的显式动作 key 判断，HTTP 元数据不参与按钮授权。 */
export function canActionResource(
  user: ResourcePermissionUser | undefined,
  menuIdentifier: string,
  key: string,
): boolean {
  if (!user || !/^[a-z][A-Za-z0-9_]{0,63}$/.test(key)) return false;
  const id = menuIdentifier.startsWith('/')
    ? resolveMenuId(user, menuIdentifier)
    : menuIdentifier;
  if (!id) return false;
  const matches: Record<string, unknown>[] = [];
  visitMenus(user.menus, (menu) => {
    if (menu.id === id) matches.push(menu);
  });
  if (matches.length !== 1) return false;
  if (user.resourcePermissionEnabled === false) return true;
  if (user.resourcePermissionEnabled !== true) return false;
  const resources = matches[0].resources;
  return (
    Array.isArray(resources) &&
    resources.every((value) => typeof value === 'string') &&
    resources.includes(key)
  );
}
