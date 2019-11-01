import {
  listUser,
  listOrg,
  listRole,
  delUser,
  lockUser,
  saveUser,
  getUser,
  grantUser,
  checkUnique,
} from '../services/accountSvc';

export default {
  namespace: 'account',
  state: {
    currentUser: {},
    orgs: [],
    // 角色列表
    roles: [],
    users: [],
    currentItem: {},
    modalType: '',
    roleModal: '',
    selectedRowKeys: [],
    formValues: {},
  },
  effects: {
    // 查询
    *fetch({ payload }, { call, put }) {
      // 查询数据
      const userData = yield call(listUser, payload);
      const treeData = yield call(listOrg, { status: '0000' });
      const roleData = yield call(listRole, payload);

      yield put({
        type: 'updateState',
        payload: {
          users: userData.data,
          orgs: treeData.data,
          roles: roleData.data,
          selectedRowKeys: [],
        },
      });
    },
    // 右侧按条件查询
    *fetchUser({ payload }, { call, put }) {
      const response = yield call(listUser, payload);
      yield put({
        type: 'updateState',
        payload: {
          users: response.data,
          selectedRowKeys: [],
        },
      });
    },
    // 查询当前用户
    *fetchCurrent({ payload }, { call, put }) {
      const response = yield call(getUser, payload);
      yield put({
        type: 'saveCurrentUser',
        payload: {
          currentUser: response.data,
        },
      });
    },
    // 校验编码唯一性
    *checkUnique({ payload }, { call }) {
      return yield call(checkUnique, payload);
    },
    // 编辑按钮
    *edit({ payload }, { call, put }) {
      const response = yield call(getUser, payload);
      const { data } = response;

      if (response && response.success) {
        if (data.roles) {
          data.roles = data.roles.map(item => item.id);
        }

        yield put({
          type: 'updateState',
          payload: {
            ...payload,
            currentItem: data,
          },
        });
      }
    },
    // 保存提交
    *save({ payload }, { call, put }) {
      const response = yield call(saveUser, payload);
      if (response && response.success) {
        yield put({
          type: 'updateState',
          payload: {
            modalType: '',
            currentItem: {},
            users: response.data,
          },
        });
      }
    },
    // 保存提交
    *grant({ payload }, { call, put }) {
      const response = yield call(grantUser, payload);
      if (response && response.success) {
        yield put({
          type: 'updateState',
          payload: {
            roleModal: '',
          },
        });
      }
    },
    // 切换锁定状态
    *lockSwitch({ payload }, { call, put }) {
      const response = yield call(lockUser, payload);
      if (response && response.success) {
        yield put({
          type: 'updateState',
          payload: {
            users: response.data,
            selectedRowKeys: [],
          },
        });
      }
    },
    // 删除
    *remove({ payload }, { call, put }) {
      const response = yield call(delUser, payload);
      if (response && response.success) {
        yield put({
          type: 'updateState',
          payload: {
            users: response.data,
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
