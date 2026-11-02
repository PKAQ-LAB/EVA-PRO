/**
 * @see https://umijs.org/docs/max/access#access
 * */

import { canReadLoginLog } from '@/pages/log/login/permissions';
import {
  canActionResource,
  type ResourcePermissionUser,
} from '@/utils/resourcePermission';

export default function access(
  initialState: { currentUser?: ResourcePermissionUser } | undefined,
) {
  const { currentUser } = initialState ?? {};
  return {
    canAdmin: currentUser && currentUser.access === 'admin',
    canReadLoginLogs: canReadLoginLog(currentUser, 'list'),
    canAction: (menuIdentifier: string, key: string) =>
      canActionResource(currentUser, menuIdentifier, key),
  };
}
