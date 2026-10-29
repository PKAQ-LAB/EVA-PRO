export type ResourcePermissionUser = API.CurrentUser & {
  menus?: unknown;
  resourcePermissionEnabled?: boolean;
};

export type CanRequest = (method: string, path: string) => boolean;

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

function validPath(path: string): boolean {
  return (
    path.startsWith('/') &&
    !/[\\\s%]/.test(path) &&
    !path.includes('//') &&
    !path.split('/').some((part) => part === '.' || part === '..')
  );
}

function segmentPattern(segment: string): RegExp | undefined {
  let pattern = '';
  for (let index = 0; index < segment.length; index += 1) {
    const char = segment[index];
    if (char === '{') {
      const end = segment.indexOf('}', index);
      const name = segment.slice(index + 1, end);
      // 本轮支持命名路径变量；自定义正则变量未知时拒绝，避免扩大授权。
      if (end < 0 || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) return;
      pattern += '.*';
      index = end;
    } else if (char === '}') {
      return;
    } else if (char === '*') {
      pattern += '.*';
    } else if (char === '?') {
      pattern += '.';
    } else {
      pattern += char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
  }
  return new RegExp(`^${pattern}$`);
}

/** 按路径段匹配 Ant 通配，** 仅在独立段中跨层。 */
export function matchesResourcePath(pattern: string, path: string): boolean {
  if (!validPath(pattern) || !validPath(path) || /[#]/.test(pattern))
    return false;
  const patterns = pattern.slice(1).split('/');
  const parts = path.slice(1).split('/');
  const matchers = patterns.map((part) =>
    part === '**' ? undefined : segmentPattern(part),
  );
  if (patterns.some((part, index) => part !== '**' && !matchers[index]))
    return false;
  const cache = new Map<string, boolean>();
  const match = (patternIndex: number, pathIndex: number): boolean => {
    const key = `${patternIndex}:${pathIndex}`;
    const cached = cache.get(key);
    if (cached !== undefined) return cached;
    const result =
      patternIndex === patterns.length
        ? pathIndex === parts.length
        : patterns[patternIndex] === '**'
          ? match(patternIndex + 1, pathIndex) ||
            (pathIndex < parts.length && match(patternIndex, pathIndex + 1))
          : pathIndex < parts.length &&
            Boolean(matchers[patternIndex]?.test(parts[pathIndex])) &&
            match(patternIndex + 1, pathIndex + 1);
    cache.set(key, result);
    return result;
  };
  return match(0, 0);
}

export function canRequestResource(
  currentUser: ResourcePermissionUser | undefined,
  method: string,
  requestPath: string,
): boolean {
  if (!currentUser || !/^[A-Za-z]+$/.test(method)) return false;
  const pathname = requestPath.split(/[?#]/, 1)[0];
  if (!validPath(pathname)) return false;
  const path =
    pathname === '/api'
      ? '/'
      : pathname.startsWith('/api/')
        ? pathname.slice(4)
        : pathname;
  if (currentUser.resourcePermissionEnabled === false) return true;
  if (currentUser.resourcePermissionEnabled !== true) return false;
  const seen = new Set<object>();
  const visit = (menus: unknown): boolean => {
    if (!Array.isArray(menus)) return false;
    return menus.some((menu) => {
      if (!menu || typeof menu !== 'object' || seen.has(menu)) return false;
      seen.add(menu);
      const resources: unknown = menu.resources;
      const granted =
        Array.isArray(resources) &&
        resources.some((resource: unknown) => {
          if (!resource || typeof resource !== 'object') return false;
          const { resourceType, resourceUrl } = resource as Record<
            string,
            unknown
          >;
          if (
            typeof resourceType !== 'string' ||
            typeof resourceUrl !== 'string'
          )
            return false;
          const verb = resourceType.trim().toUpperCase();
          const pattern = resourceUrl.trim();
          if (verb !== '*' && verb !== method.toUpperCase()) return false;
          if (matchesResourcePath(pattern, path)) return true;
          if (
            verb !== '*' ||
            pattern === '/' ||
            !validPath(pattern) ||
            /[?*{}#]/.test(pattern)
          )
            return false;
          // 后端仅 method=* 支持非根路径下级兼容，必须逐段比较边界。
          const prefix = pattern.replace(/\/$/, '').split('/');
          const target = path.split('/');
          return (
            target.length > prefix.length &&
            prefix.every((part, index) => part === target[index])
          );
        });
      return granted || visit(menu.children);
    });
  };
  return visit(currentUser.menus);
}
