import { list, get, editSlip, delSlip } from '../services/slipSvc';

export default {
  namespace: 'saleSlip',
  state: {
    currentItem: {},
    selectedRowKeys: [],
    slips: [],
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
            slips: response.data,
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
            operateType: payload.operateType,
            currentItem: response.data,
          },
        });
      }
    },
    *save({ payload }, { call, put }) {
      const response = yield call(editSlip, payload);
      if (response && response.success ) {
        yield put({ type: 'fetch' })
      }
    },
    *remove({ payload }, { call, put }) {
      const response = yield call(delSlip, payload);
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
