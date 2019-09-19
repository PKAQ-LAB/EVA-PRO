import { listModule } from '../services/roleSvc';

export default {
  namespace: 'role',
  state: {
    currentItem: {},
    modalType: '',
    selectedRowKeys: [],
    formValues: {},
  },
  effects: {
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
    // 编辑按钮
    // 排序
    // 保存一条模块信息
    // 更改可用状态
    // 删除数据
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
