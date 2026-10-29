/**
 * @see https://umijs.org/docs/max/access#access
 * */
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
    canRequest: (method: string, path: string) =>
      canRequestResource(currentUser, method, path),
  };
}
