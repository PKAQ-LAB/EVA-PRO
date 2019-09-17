import { listDict } from '../services/dictSvc';

export default {
  namespace: 'dict',
  state: {
    // 左侧表格数据
    dicts: [],
    // 子表数据
    lineData: [],
    // 当前编辑项得索引
    editIndex: '',
    // 当前编辑项
    currentItem: {},
    // 窗口状态
    modalType: '',
  },
  effects: {
    // 加载字典分类
    *listDict({ payload }, { call, put }) {
      const response = yield call(listDict, payload);
      yield put({
        type: 'updateState',
        payload: {
          dicts: response.data,
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
  },
};
