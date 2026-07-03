import Cookies from 'universal-cookie';
import { access_token, refresh_token, user_key } from '@/constant';

export const authExpiredCodes = new Set([
  '0x000-00003',
  '0x000-00005',
  '0x000-00011',
  '0x000-00012',
  '0x000-00023',
]);

const accessTokenCacheKey = 'eva_access_token';
const refreshTokenCacheKey = 'eva_refresh_token';

export function isAuthExpiredCode(code?: string | number) {
  return code !== undefined && authExpiredCodes.has(String(code));
}

export function getErrorCode(error: unknown): string | undefined {
  const payload = error as {
    code?: string;
    errorCode?: string | number;
    info?: { code?: string; errorCode?: string | number };
    data?: { code?: string; errorCode?: string | number };
    response?: {
      status?: number;
      data?: { code?: string; errorCode?: string | number };
    };
  };
  const code =
    payload.info?.code ??
    payload.info?.errorCode ??
    payload.data?.code ??
    payload.data?.errorCode ??
    payload.response?.data?.code ??
    payload.response?.data?.errorCode ??
    payload.code ??
    payload.errorCode;
  return code === undefined ? undefined : String(code);
}

export function getErrorMessage(error: unknown) {
  const payload = error as {
    message?: string;
    info?: { message?: string; errorMessage?: string };
    data?: { message?: string; errorMessage?: string };
    response?: { data?: { message?: string; errorMessage?: string } };
  };
  return (
    payload.info?.message ||
    payload.info?.errorMessage ||
    payload.data?.message ||
    payload.data?.errorMessage ||
    payload.response?.data?.message ||
    payload.response?.data?.errorMessage ||
    payload.message
  );
}

export function isAuthExpiredError(error: unknown) {
  const payload = error as { response?: { status?: number } };
  return (
    payload.response?.status === 401 || isAuthExpiredCode(getErrorCode(error))
  );
}

export function getStoredAccessToken() {
  return (
    new Cookies().get(access_token) ||
    (typeof window !== 'undefined'
      ? window.sessionStorage.getItem(accessTokenCacheKey)
      : '') ||
    ''
  );
}

export function setStoredAccessToken(token: string) {
  new Cookies().set(access_token, token, { path: '/', sameSite: 'lax' });
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(accessTokenCacheKey, token);
  }
}

export function getStoredRefreshToken() {
  return (
    new Cookies().get(refresh_token) ||
    (typeof window !== 'undefined'
      ? window.sessionStorage.getItem(refreshTokenCacheKey)
      : '') ||
    ''
  );
}

export function setStoredRefreshToken(token: string) {
  new Cookies().set(refresh_token, token, { path: '/', sameSite: 'lax' });
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(refreshTokenCacheKey, token);
  }
}

export function clearAuthState() {
  const cookies = new Cookies();
  cookies.remove(access_token, { maxAge: -1, path: '/' });
  cookies.remove(refresh_token, { maxAge: -1, path: '/' });
  cookies.remove(user_key, { maxAge: -1, path: '/' });
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem(accessTokenCacheKey);
    window.sessionStorage.removeItem(refreshTokenCacheKey);
    window.sessionStorage.removeItem('eva_current_user');
    window.sessionStorage.removeItem('eva_login_menus');
  }
}

export function redirectToLogin() {
  const { pathname, search, hash } = window.location;
  const redirect = encodeURIComponent(`${pathname}${search}${hash}`);
  window.location.replace(`/#/user/login?redirect=${redirect}`);
}
