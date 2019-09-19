import { listDict, editDict, getDict, deleteDict } from '../services/dictSvc';

export default {
  namespace: 'dict',
  state: {
    // 操作
    operate: '',
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
          dicts: response.data || [],
        },
      });
    },
    // 加载字典项
    *getDict({ payload }, { call, put }) {
      const response = yield call(getDict, payload);
      const { operate } = payload;
      if (response && response.success) {
        yield put({
          type: 'updateState',
          payload: {
            operate,
            currentItem: response.data || {},
            lineData: response.data.lines || [],
          },
        });
      }
    },
    // 删除一条字典项
    *deleteDict({ payload }, { call, put }) {
      const response = yield call(deleteDict, payload);
      if (response && response.success) {
        yield put({
          type: 'updateState',
          payload: {
            dicts: response.data || [],
          },
        });
      }
    },
    // 新增/编辑字典分类
    *editDict({ payload }, { call, put }) {
      const response = yield call(editDict, payload);
      if (response && response.success) {
        yield put({
          type: 'updateState',
          payload: {
            dicts: response.data || [],
            operate: '',
            editIndex: '',
            currentItem: {},
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
