import { list, get, edit, del } from '../services/goodsSvc';

export default {
  namespace: 'goods',
  state: {
    currentItem: {},
    selectedRowKeys: [],
    goods: [],
    operateType: '',
  },
  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(list, payload);
      if (response && response.success) {
        yield put({
          type: 'updateState',
          payload: {
            selectedRowKeys: [],
            operateType: '',
            currentItem: {},
            goods: response.data,
          },
        });
      }
    },
    *get({ payload }, { call, put }) {
      const response = yield call(get, payload);
      if (response && response.success) {
        yield put({
          type: 'updateState',
          payload: {
            operateType: payload.operateType,
            currentItem: response.data,
          },
        });
      }
    },
    *save({ payload }, { call, put }) {
      const response = yield call(edit, payload);
      if (response && response.success ) {
        yield put({ type: 'fetch' })
      }
    },
    *remove({ payload }, { call, put }) {
      const response = yield call(del, payload);
      if (response && response.success ) {
        yield put({ type: 'fetch' })
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
