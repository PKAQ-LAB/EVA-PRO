import { history, useModel } from '@umijs/max';
import { useEffect } from 'react';
import {
  type MenuNavigationItem,
  resolveMenuNavigation,
} from '@/utils/menuNavigation';

export default function RootPage() {
  const { initialState, loading } = useModel('@@initialState');
  const menus = (
    initialState?.currentUser as
      | (API.CurrentUser & { menus?: MenuNavigationItem[] })
      | undefined
  )?.menus;
  const targetPath = resolveMenuNavigation(menus || []).path;

  useEffect(() => {
    if (loading) return;
    const hashPath =
      typeof window === 'undefined'
        ? ''
        : window.location.hash.replace(/^#/, '').split('?')[0];
    const currentPath = hashPath || history.location.pathname;
    if ('/' !== currentPath) return;
    history.replace(targetPath);
  }, [loading, targetPath]);

  return null;
}
