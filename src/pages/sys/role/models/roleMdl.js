import { fetchRoles } from '../services/roleSvc';

export default {
  namespace: 'role',
  state: {
    currentItem: {},
    modalType: '',
    selectedRowKeys: [],
    formValues: {},
  },
  effects: {
    // 加载权限列表
    *fetchRoles({ payload }, { call, put }) {
      const response = yield call(fetchRoles, payload);
      if (response && response.success) {
        yield put({
          type: 'updateState',
          payload: {
            roles: response.data,
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
