import { parse } from 'querystring';
import { history } from 'umi';
import Cookies from 'universal-cookie';
import setting from '@config/defaultSettings';
import { outLogin } from '@/services/login';

/* eslint no-useless-escape:0 import/prefer-default-export:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export const isUrl = (path: string): boolean => reg.test(path);

export const isAntDesignPro = (): boolean => {
  if (ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site') {
    return true;
  }
  return window.location.hostname === 'preview.pro.ant.design';
};

// 给官方演示站点用，用于关闭真实开发环境不需要使用的特性
export const isAntDesignProOrDev = (): boolean => {
  const { NODE_ENV } = process.env;
  if (NODE_ENV === 'development') {
    return true;
  }
  return isAntDesignPro();
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

// 获取非Undefined字符串
export function getNoUndefinedString(obj: string) {
  return obj || '';
}

export const loginOut = async () => {

  const cookies = new Cookies();

  const USER_KEY = setting.userinfo;
  const access_token = setting.access_token;
  const refresh_token = setting.refresh_token;


  await outLogin();

  // 删除token
  cookies.remove(access_token, { maxAge: -1, path: '/' });
  cookies.remove(refresh_token, { maxAge: -1, path: '/' });
  cookies.remove(USER_KEY, { maxAge: -1, path: '/' });

  const { redirect } = getPageQuery();
  if (window.location.pathname !== '/user/login' && !redirect) {
    history.replace({
      pathname: '/user/login'
    });
  }
};
