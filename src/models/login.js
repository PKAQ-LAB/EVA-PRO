import { routerRedux } from 'dva/router';
import { stringify } from 'qs';
import { fakeAccountLogin, getFakeCaptcha } from '@/services/api';
import { setAuthority } from '@/utils/authority';
import { getPageQuery } from '@/utils/utils';
import { reloadAuthorized } from '@/utils/Authorized';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const USER_KEY = 'eva_user';
const TOKEN_KEY = 'eva_token';

export default {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(fakeAccountLogin, payload);
      // 登录鉴权
      if (response && response.success) {
        // 更新用户权限
        yield put({
          type: 'changeLoginStatus',
          payload: {
            ...response,
            currentAuthority: 'admin',
          },
        });

        cookies.set(USER_KEY, response.data.user);

        reloadAuthorized();
        const urlParams = new URL(window.location.href);
        const params = getPageQuery();

        let { redirect } = params;
        if (redirect) {
          const redirectUrlParams = new URL(redirect);
          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);
            if (redirect.match(/^\/.*#/)) {
              redirect = redirect.substr(redirect.indexOf('#') + 1);
            }
          } else {
            redirect = null;
          }
        }
        yield put(routerRedux.replace(redirect || '/'));
      } else {
        yield put({
          type: 'updateState',
          payload: {
            status: 'error',
            type: 'account',
          },
        });
      }
    },

    *getCaptcha({ payload }, { call }) {
      yield call(getFakeCaptcha, payload);
    },

    *logout(_, { put }) {
      // 删除token
      cookies.remove(TOKEN_KEY);
      cookies.remove(USER_KEY);

      yield put({
        type: 'changeLoginStatus',
        payload: {
          status: false,
          currentAuthority: 'guest',
        },
      });
      reloadAuthorized();
      const { redirect } = getPageQuery();
      // redirect
      if (window.location.pathname !== '/user/login' && !redirect) {
        yield put(
          routerRedux.replace({
            pathname: '/user/login',
            search: stringify({
              redirect: window.location.href,
            }),
          })
        );
      }
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    changeLoginStatus(state, { payload }) {
      setAuthority(payload.currentAuthority);
      return {
        ...state,
        status: payload.status,
        type: payload.type,
      };
    },
  },
};
