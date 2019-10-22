import { list, get } from '../service/bizSvc';

export default {
  namespace: 'bizlog',
  state: {
    logs: [],
    drawerCheck: '',
    currentItemcheck: {},
  },
  effects: {
    // 业务日志列表信息
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
    // 查询单条业务日志
    *check({ payload }, { call, put }) {
      const response = yield call(get, payload);
      if (response && response.success) {
        yield put({
          type: 'updateState',
          payload: {
            drawerCheck: 'check',
            currentItemcheck: response.data,
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
