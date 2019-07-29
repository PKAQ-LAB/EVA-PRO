import { routerRedux } from 'dva/router';
import { stringify } from 'qs';
import Cookies from 'universal-cookie';
import { fakeAccountLogin, getFakeCaptcha } from '@/services/api';
import { getPageQuery } from '@/utils/utils';

const cookies = new Cookies();

const USER_KEY = 'user_info';
const TOKEN_KEY = 'auth_token';

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
          },
        });

        cookies.set(USER_KEY, response.data.user || {}, { path: '/' });

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
        // yield put(routerRedux.replace(redirect || '/'));
        window.location.href = '/';
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
      cookies.remove(TOKEN_KEY, { maxAge: -1, path: '/' });
      cookies.remove(USER_KEY, { maxAge: -1, path: '/' });

      yield put({
        type: 'changeLoginStatus',
        payload: {
          status: false,
        },
      });
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
      return {
        ...state,
        status: payload.status,
        type: payload.type,
      };
    },
  },
};
