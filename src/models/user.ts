import { Effect, Reducer, history } from 'umi';

import { queryCurrent } from '@/services/user';
import { getFirstLeaf } from '@/utils/DataHelper';

export interface CurrentUser {
  avatar?: string;
  name?: string;
  title?: string;
  group?: string;
  signature?: string;
  tags?: {
    key: string;
    label: string;
  }[];
  id?: string;
  unreadCount?: number;
}

export interface UserModelState {
  currentUser?: CurrentUser;
}

export interface UserModelType {
  namespace: 'user';
  state: UserModelState;
  effects: {
    fetch: Effect;
  };
  reducers: {
    saveCurrentUser: Reducer<UserModelState>;
    changeNotifyCount: Reducer<UserModelState>;
  };
}

const UserModel: UserModelType = {
  namespace: 'user',

  state: {
    currentUser: {},
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryCurrent);

      yield put({
        type: 'saveCurrentUser',
        payload: response.data.user,
      });
      yield put({
        type: 'menu/save',
        payload: response.data.menus,
      });
      yield put({
        type: 'global/updateState',
        payload: {
          dict: response.data.dict,
        },
      });

      const url = getFirstLeaf(response.data.menus);

      history.push(url);
    },
  },

  reducers: {
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload || {},
      };
    },
    changeNotifyCount(
      state = {
        currentUser: {},
      },
      action,
    ) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload.totalCount,
          unreadCount: action.payload.unreadCount,
        },
      };
    },
  },
};

export default UserModel;
