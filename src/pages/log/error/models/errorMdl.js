import { list, get } from '../services/errorSvc';

export default {
  namespace: 'errorLog',
  state: {
    currentItem: {},
    modalType: '',
    logs: [],
  },
  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(list, payload);
      if (response && response.success) {
        yield put({
          type: 'updateState',
          payload: {
            logs: response.data,
          },
        });
      }
    },
    // 查询单条信息
    *get({ payload }, { call, put }) {
      const response = yield call(get, payload);
      if (response && response.success) {
        yield put({
          type: 'updateState',
          payload: {
            currentItem: response.data,
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
