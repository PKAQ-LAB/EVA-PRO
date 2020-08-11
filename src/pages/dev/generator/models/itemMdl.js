import { list, getMain, getSub } from '../services/itemSvc';

export default {
  namespace: 'item',

  state: {
    currentItem: {},
    items: {
      mainItem: [],
    },
    saveKey: '',
    tabKey: '0',
    showTab: false,
    panes: [],
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(list, payload);
      if (response && response.data) {
        yield put({
          type: 'updateState',
          payload: {
            currentItem: response.data,
          },
        });
      }
    },
    *getMainByName({ payload }, { call, put }) {
      const response = yield call(getMain, payload);
      if (response && response.data) {
        yield put({
          type: 'updateState',
          payload: {
            items: {
              mainItem: response.data,
            },
          },
        });
      }
    },
    *getSubByName({ payload }, { call, put }) {
      const response = yield call(getSub, payload);
      if (response && response.data) {
        yield put({
          type: 'updateState',
          payload: {
            items: {
              mainItem: response.data,
            },
          },
        });
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
  },
};
