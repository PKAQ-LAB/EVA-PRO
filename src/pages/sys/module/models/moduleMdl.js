import {
  editModule,
  getModule,
  listModule,
  deleteModule,
  checkUnique,
  sortModule,
} from '../services/moduleSvc';

export default {
  namespace: 'module',
  state: {
    currentItem: {},
    modalType: '',
    selectedRowKeys: [],
    formValues: {},
    lineData: [],
    operate: '',
    editIndex: '',
  },
  effects: {
    // 校验路径唯一性
    *checkUnique({ payload }, { call }) {
      return yield call(checkUnique, payload);
    },
    // 查询
    *listModule({ payload }, { call, put }) {
      // 查询数据
      const response = yield call(listModule, payload);
      if (response && response.success) {
        yield put({
          type: 'updateState',
          payload: {
            data: response.data,
          },
        });
      }
    },
    // 新增/新增子节点
    *create({ payload }, { put }) {
      // 有id时为新增下级，加载父级节点相关信息
      yield put({
        type: 'updateState',
        payload: {
          ...payload,
          lineData: [],
        },
      });
    },
    // 编辑按钮
    *edit({ payload }, { call, put }) {
      const response = yield call(getModule, payload);

      if (response && response.success) {
        yield put({
          type: 'updateState',
          payload: {
            modalType: 'edit',
            currentItem: response.data,
            lineData: response.data.resources,
          },
        });
      }
    },
    // 排序
    *sortModule({ payload }, { call, put }) {
      const response = yield call(sortModule, payload);
      if (response && response.success) {
        yield put({
          type: 'updateState',
          payload: {
            data: response.data,
          },
        });
      }
    },
    // 保存一条模块信息
    *save({ payload }, { call, put }) {
      const response = yield call(editModule, payload);
      if (response && response.success && response.data) {
        //  关闭窗口 - 提示成功 - 加载数据
        yield put({
          type: 'updateState',
          payload: {
            modalType: '',
            operate: '',
            editIndex: '',
            currentItem: {},
            lineData: [],
            data: response.data,
          },
        });
      }
    },
    // 更改可用状态
    *changeStatus({ payload }, { call, put }) {
      const response = yield call(editModule, payload);
      if (response && response.success) {
        const op = payload;
        op.record.status = payload.status;
        yield put({
          type: 'updateState',
          payload: {
            data: response.data,
            selectedRowKeys: [],
          },
        });
      }
    },
    // 删除数据
    *delete({ payload, callback }, { call, put }) {
      // 查询数据
      const response = yield call(deleteModule, payload);
      // 只有返回成功时才刷新
      if (response && response.success) {
        // 从当前数据对象中找到响应ID记录删除值
        yield put({
          type: 'updateState',
          payload: {
            data: response.data,
            selectedRowKeys: [],
          },
        });
        if (callback) {
          callback();
        }
      } else {
        yield put({
          type: 'updateState',
          payload: {
            loading: { global: false },
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
