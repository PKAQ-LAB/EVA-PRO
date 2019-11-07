import { Reducer } from 'redux';
import { routerRedux } from 'dva/router';
import { Effect } from 'dva';
import { stringify } from 'querystring';
import Cookies from 'universal-cookie';

import { login } from '@src/services/login';
import { setAuthority } from '@src/utils/authority';
import { getPageQuery } from '@src/utils/utils';

export interface StateType {
  status?: 'ok' | 'error';
  type?: string;
  currentAuthority?: 'user' | 'guest' | 'admin';
}

export interface LoginModelType {
  namespace: string;
  state: StateType;
  effects: {
    login: Effect;
    logout: Effect;
  };
  reducers: {
    changeLoginStatus: Reducer<StateType>;
  };
}

const cookies = new Cookies();

const USER_KEY = 'user_info';
const TOKEN_KEY = 'auth_token';

const Model: LoginModelType = {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(login, payload);
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      });
      // Login successfully
      if (response && response.success) {
        // const urlParams = new URL(window.location.href);
        const params = getPageQuery();
        const { redirect } = params as { redirect: string };
        if (redirect) {
          // const redirectUrlParams = new URL(redirect);
          // if (redirectUrlParams.origin === urlParams.origin) {
          //   redirect = redirect.substr(urlParams.origin.length);
          //   if (redirect.match(/^\/.*#/)) {
          //     redirect = redirect.substr(redirect.indexOf('#') + 1);
          //   }
          // } else {
          window.location.href = redirect;
          //   return;
          // }
        }
        // yield put(routerRedux.replace(redirect || '/'));
      }
    },
    *logout(_, { put }) {
      const { redirect } = getPageQuery();
      // 删除token
      cookies.remove(TOKEN_KEY, { maxAge: -1, path: '/' });
      cookies.remove(USER_KEY, { maxAge: -1, path: '/' });

      // redirect
      if (window.location.pathname !== '/user/login' && !redirect) {
        yield put(
          routerRedux.replace({
            pathname: '/user/login',
            search: stringify({
              redirect: window.location.href,
            }),
          }),
        );
      }
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      setAuthority('admin');
      return {
        ...state,
        status: payload.success,
      };
    },
  },
};

export default Model;
