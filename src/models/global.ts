import { Subscription, Reducer, Effect } from 'umi';

import { NoticeIconData } from '@src/components/NoticeIcon';
import { queryNotices } from '@src/services/user';
import { ConnectState } from './connect.d';
import { repwd } from '../services/user';

export interface NoticeItem extends NoticeIconData {
  id: string;
  type: string;
  status: string;
}

export interface GlobalModelState {
  collapsed: boolean;
  notices: NoticeItem[];
  dict: Object;
  repwd: boolean;
}

export interface GlobalModelType {
  namespace: 'global';
  state: GlobalModelState;
  effects: {
    fetchNotices: Effect;
    repwd: Effect;
    clearNotices: Effect;
    changeNoticeReadState: Effect;
  };
  reducers: {
    updateState: Reducer<GlobalModelState>;
    changeLayoutCollapsed: Reducer<GlobalModelState>;
    saveNotices: Reducer<GlobalModelState>;
    saveClearedNotices: Reducer<GlobalModelState>;
  };
  subscriptions: { setup: Subscription };
}

const GlobalModel: GlobalModelType = {
  namespace: 'global',

  state: {
    collapsed: false,
    notices: [],
    dict: {},
    repwd: false,
  },

  effects: {
    *fetchNotices(_, { call, put, select }) {
      const data = yield call(queryNotices);
      yield put({
        type: 'saveNotices',
        payload: data,
      });
      const unreadCount: number = yield select(
        (state: ConnectState) => state.global.notices.filter((item) => !item.read).length,
      );
      yield put({
        type: 'user/changeNotifyCount',
        payload: {
          totalCount: data.length,
          unreadCount,
        },
      });
    },
    // 修改密码
    *repwd({ payload }, { put, call }) {
      const res = yield call(repwd, payload);
      if(res && res.success){
        yield put({
          type: 'updateState',
          payload: {
            repwd: false,
          },
        });
      }
    },
    *clearNotices({ payload }, { put, select }) {
      yield put({
        type: 'saveClearedNotices',
        payload,
      });
      const count: number = yield select((state: ConnectState) => state.global.notices.length);
      const unreadCount: number = yield select(
        (state: ConnectState) => state.global.notices.filter((item) => !item.read).length,
      );
      yield put({
        type: 'user/changeNotifyCount',
        payload: {
          totalCount: count,
          unreadCount,
        },
      });
    },
    *changeNoticeReadState({ payload }, { put, select }) {
      const notices: NoticeItem[] = yield select((state: ConnectState) =>
        state.global.notices.map((item) => {
          const notice = { ...item };
          if (notice.id === payload) {
            notice.read = true;
          }
          return notice;
        }),
      );

      yield put({
        type: 'saveNotices',
        payload: notices,
      });

      yield put({
        type: 'user/changeNotifyCount',
        payload: {
          totalCount: notices.length,
          unreadCount: notices.filter((item) => !item.read).length,
        },
      });
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    changeLayoutCollapsed(state = { notices: [], collapsed: true }, { payload }): GlobalModelState {
      return {
        ...state,
        collapsed: payload,
      };
    },
    saveNotices(state, { payload }): GlobalModelState {
      return {
        collapsed: false,
        ...state,
        notices: payload,
      };
    },
    saveClearedNotices(state = { notices: [], collapsed: true }, { payload }): GlobalModelState {
      return {
        collapsed: false,
        ...state,
        notices: state.notices.filter((item): boolean => item.type !== payload),
      };
    },
  },

  subscriptions: {
    setup({ history }): void {
      // Subscribe history(url) change, trigger `load` action if pathname is `/`
      history.listen(({ pathname, search }): void => {
        if (typeof window.ga !== 'undefined') {
          window.ga('send', 'pageview', pathname + search);
        }
      });
    },
  },
};

export default GlobalModel;
