import {
  listCategory,
  checkUnique,
  editCategory,
  getCategory,
  deleteCategory,
  switchCategory,
} from '../services/categorySvc';

export default {
  namespace: 'category',
  state: {
    currentItem: {},
    modalType: '',
    selectedRowKeys: [],
    formValues: {},
  },
  effects: {
    // 校验分类编码唯一性
    *checkUnique({ payload }, { call }) {
      return yield call(checkUnique, payload);
    },
    // 查询
    *list({ payload }, { call, put }) {
      // 查询数据
      const response = yield call(listCategory, payload);
      if (response && response.success) {
        yield put({
          type: 'updateState',
          payload: {
            data: [...response.data]
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
        },
      });
    },
    // 编辑按钮
    *edit({ payload }, { call, put }) {
      const response = yield call(getCategory, payload);
      if (response && response.success) {
        yield put({
          type: 'updateState',
          payload: {
            modalType: 'edit',
            currentItem: response.data,
          },
        });
      }
    },
    // 保存一条模块信息
    *save({ payload }, { call, put }) {
      const response = yield call(editCategory, payload);
      const state = {
        modalType: '',
        currentItem: {},
      }
      if (response && response.success) {
        state.data = [...response.data];
      }

      yield put({
        type: 'updateState',
        payload: {
         ...state
        },
      });
    },
    // 更改可用状态
    *changeStatus({ payload }, { call, put }) {
      const response = yield call(switchCategory, payload);
      if (response) {
        payload.list.status = payload.status;
        yield put({
          type: 'updateState',
          currentItem: payload.list,
        });
      }
    },
    // 删除数据
    *delete({ payload }, { call, put }) {
      // 查询数据
      const response = yield call(deleteCategory, payload);
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
