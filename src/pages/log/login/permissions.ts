import { getMenuPath } from '@/utils/menuNavigation';
import {
  canRequestResource,
  type ResourcePermissionUser,
} from '@/utils/resourcePermission';

/** 菜单仅用于呈现，管理员资格及租户边界仍由服务端验证。 */
export function canReadLoginLog(
  user: ResourcePermissionUser | undefined,
  path: string,
): boolean {
  if (!user || !canRequestResource(user, 'GET', path)) return false;
  const pending: unknown[] = Array.isArray(user.menus) ? [...user.menus] : [];
  const seen = new Set<object>();
  while (pending.length) {
    const menu = pending.pop();
    if (!menu || typeof menu !== 'object' || seen.has(menu)) continue;
    seen.add(menu);
    if (getMenuPath(menu as Record<string, unknown>) === '/log/login')
      return true;
    const children = (menu as { children?: unknown }).children;
    if (Array.isArray(children)) pending.push(...children);
  }
  return false;
}
