import { Navigate, useModel } from '@umijs/max';
import React, { useMemo } from 'react';
import Cookies from 'universal-cookie';
import { access_token } from '@/constant';

const cookies = new Cookies();

/**
 * 登录态判定：cookie 中存在 access_token AND initialState 中已有 currentUser。
 *
 * V6 推荐做路由级权限判定时优先使用 access 插件 + access.ts 的 canX 规则
 * （routes 中 access: 'canAdmin'）。这里保留 useAuth + withAuth 主要是为了:
 *  - 兼容旧 EVA-PRO 业务代码
 *  - 在脱离路由 access 插件场景 (例如组件内条件渲染) 也能复用
 */
export const useAuth = (): { isLogin: boolean; isReady: boolean } => {
  const initialState = useModel('@@initialState');
  return useMemo(() => {
    const hasToken = !!cookies.get(access_token);
    const hasUser = !!initialState?.initialState?.currentUser;
    return {
      isLogin: hasToken && hasUser,
      isReady: !initialState?.loading,
    };
  }, [initialState]);
};

export interface WithAuthOptions {
  /** 未登录时跳转的路径，默认 /user/login */
  redirectTo?: string;
}

/**
 * 高阶组件：包装一个路由组件，未登录时自动重定向到登录页。
 *
 * 用法:
 *   export default withAuth(MyPage);
 *   export default withAuth(MyPage, { redirectTo: '/user/login' });
 *
 * 等价于在 routes.ts 中给路由配置 access: 'canLogin' (推荐)。
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {},
): React.FC<P> {
  const { redirectTo = '/user/login' } = options;
  const Wrapped: React.FC<P> = (props) => {
    const { isLogin, isReady } = useAuth();
    if (!isReady) return null;
    if (!isLogin) {
      const { pathname, search, hash } = window.location;
      const redirect = encodeURIComponent(`${pathname}${search}${hash}`);
      return <Navigate to={`${redirectTo}?redirect=${redirect}`} replace />;
    }
    return <Component {...props} />;
  };
  Wrapped.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;
  return Wrapped;
}

export default withAuth;
