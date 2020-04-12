import { list, get, editSlip, delSlip } from '../services/supplierSvc';

export default {
  namespace: 'supplier',
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
