import {
  canActionResource,
  type ResourcePermissionUser,
} from '@/utils/resourcePermission';

/** 菜单仅用于呈现，管理员资格及租户边界仍由服务端验证。 */
export function canReadLoginLog(
  user: ResourcePermissionUser | undefined,
  key: string,
): boolean {
  return canActionResource(user, '/log/login', key);
}
