import { history } from '@umijs/max';
import { parse } from 'qs';
import Cookies from 'universal-cookie';
import { access_token, refresh_token, user_key } from '@/constant';

/* eslint no-useless-escape:0 import/prefer-default-export:0 */
const reg =
  /(((^https?:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export const isUrl = (path: string): boolean => reg.test(path);

export const isAntDesignProOrDev = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

export const getPageQuery = () => {
  const { href } = window.location;
  const qsIndex = href.indexOf('?');
  const sharpIndex = href.indexOf('#');

  if (qsIndex !== -1) {
    if (qsIndex > sharpIndex) {
      return parse(href.split('?')[1]);
    }
    return parse(href.slice(qsIndex + 1, sharpIndex));
  }

  return {};
};

/** 获取非 undefined 字符串，避免拼接 URL 时出现 "/undefined" */
export function getNoUndefinedString(obj: string | undefined | null): string {
  return obj ?? '';
}

/**
 * 退出登录：清理本地 cookie，并跳转到登录页
 */
export const loginOut = async () => {
  const cookies = new Cookies();
  cookies.remove(access_token, { maxAge: -1, path: '/' });
  cookies.remove(refresh_token, { maxAge: -1, path: '/' });
  cookies.remove(user_key, { maxAge: -1, path: '/' });

  const { redirect } = getPageQuery();
  if (window.location.pathname !== '/user/login' && !redirect) {
    history.replace({ pathname: '/user/login' });
  }
};
