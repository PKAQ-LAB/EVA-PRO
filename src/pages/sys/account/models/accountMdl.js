import {
  listUser,
  listOrg,
  delUser,
  lockUser,
  saveUser,
  getUser,
  checkUnique,
} from '../services/accountSvc';

export default {
  namespace: 'account',
  state: {
    currentUser: {},
    orgs: [],
    users: [],
    currentItem: {},
    modalType: '',
    selectedRowKeys: [],
    formValues: {},
  },
  effects: {
    // 查询
    *fetch({ payload }, { call, put }) {
      // 查询数据
      const userData = yield call(listUser, payload);
      const treeData = yield call(listOrg, { status: '0001' });
      yield put({
        type: 'updateState',
        payload: {
          users: userData.data,
          orgs: treeData.data,
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
        },
      });
    },
    // 查询当前用户
    *fetchCurrent({ payload }, { call, put }) {
      const response = yield call(getUser, payload);
      yield put({
        type: 'saveCurrentUser',
        payload: response.data,
      });
    },
    // 校验编码唯一性
    *checkUnique({ payload }, { call }) {
      return yield call(checkUnique, payload);
    },
    // 编辑按钮
    *edit({ payload }, { call, put }) {
      const response = yield call(getUser, payload);
      if (response && response.data) {
        yield put({
          type: 'updateState',
          payload: {
            modalType: 'edit',
            currentItem: response.data,
          },
        });
      }
    },
    // 保存提交
    *save({ payload }, { call, put }) {
      const response = yield call(saveUser, payload);
      if (response && response.data) {
        yield put({
          type: 'updateState',
          payload: {
            modalType: '',
            currentItem: {},
            users: response.data,
          },
        });
      } else {
        yield put({
          type: 'updateState',
          payload: {
            modalType: '',
            currentItem: {},
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
