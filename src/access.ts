/**
 * @see https://umijs.org/docs/max/access#access
 * */

import APIS from '@/apis';
import { canReadLoginLog } from '@/pages/log/login/permissions';
import {
  canRequestResource,
  type ResourcePermissionUser,
} from '@/utils/resourcePermission';

export default function access(
  initialState: { currentUser?: ResourcePermissionUser } | undefined,
) {
  const { currentUser } = initialState ?? {};
  return {
    canAdmin: currentUser && currentUser.access === 'admin',
    canReadLoginLogs: canReadLoginLog(currentUser, APIS.LOGINLOG_LIST),
    canRequest: (method: string, path: string) =>
      canRequestResource(currentUser, method, path),
  };
}
