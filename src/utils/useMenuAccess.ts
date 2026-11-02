import { useAccess, useModel } from '@umijs/max';
import { useCallback, useEffect, useRef } from 'react';

/** 每个回调绑定当前身份，旧身份的异步流程不能借新身份继续操作。 */
export default function useMenuAccess(menuIdentifier: string) {
  const access = useAccess();
  const { initialState, loading, error } = useModel('@@initialState');
  const user = initialState?.currentUser;
  const latest = useRef({ user, loading, error, access });
  latest.current = { user, loading, error, access };
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  return useCallback(
    (key: string) =>
      mounted.current &&
      latest.current.user === user &&
      !latest.current.loading &&
      !latest.current.error &&
      latest.current.access.canAction(menuIdentifier, key),
    [user, menuIdentifier],
  );
}
