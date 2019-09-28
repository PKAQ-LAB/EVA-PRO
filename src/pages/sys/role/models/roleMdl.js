import {
  fetchRoles,
  delRole,
  saveRole,
  checkUnique,
  lockRole,
  getRole,
  listUser,
  listOrg,
  saveUser,
  listModule,
  saveModule,
} from '../services/roleSvc';

export default {
  namespace: 'role',
  state: {
    roleId: '',
    currentItem: {},
    // 新增、查看、编辑
    modalType: '',
    // 授权操作类型
    operateType: '',
    selectedRowKeys: [],
    formValues: {},
    selectedResources: {},
  },
  effects: {
    // 校验编码唯一性
    *checkUnique({ payload }, { call }) {
      return yield call(checkUnique, payload);
    },
    // 切换锁定状态
    *lockSwitch({ payload }, { call, put }) {
      yield call(lockRole, payload);
      yield put({ type: 'fetchRoles' });
    },
    // 加载权限列表
    *fetchRoles({ payload }, { call, put }) {
      const response = yield call(fetchRoles, payload);
      if (response && response.success) {
        yield put({
          type: 'updateState',
          payload: {
            selectedRowKeys: [],
            roles: response.data,
          },
        });
      }
    },
    // 编辑按钮
    *edit({ payload }, { call, put }) {
      const response = yield call(getRole, payload);
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
    // 删除
    *remove({ payload }, { call, put }) {
      const response = yield call(delRole, payload);
      if (response && response.success) {
        yield put({
          type: 'updateState',
          payload: {
            roles: response.data,
            selectedRowKeys: [],
          },
        });
      }
    },
    // 保存提交
    *save({ payload }, { call, put }) {
      const response = yield call(saveRole, payload);
      if (response && response.success) {
        yield put({
          type: 'updateState',
          payload: {
            modalType: '',
            currentItem: {},
            roles: response.data,
          },
        });
      }
    },
    // 保存模块关系表
    *saveUser({ payload }, { call, put }) {
      const response = yield call(saveUser, payload);
      if (response && response.success) {
        yield put({
          type: 'updateState',
          payload: {
            operateType: '',
          },
        });
      }
    },
    // 获取部门树
    *listDepts({ payload }, { call, put }) {
      const orgsData = yield call(listOrg, { status: '0000' });
      yield put({
        type: 'updateState',
        payload: {
          orgs: orgsData.data,
        },
      });
    },
    // 获取所有用户
    *listUser({ payload }, { call, put }) {
      const userData = yield call(listUser, payload);
      const orgsData = yield call(listOrg, { status: '0000' });
      yield put({
        type: 'updateState',
        payload: {
          roleId: payload.roleId,
          operateType: payload.operateType,
          orgs: orgsData.data,
          users: {
            records: userData.data.users,
            checked: userData.data.checked,
          },
        },
      });
    },
    // 根据部门获取用户
    *listUserByDept({ payload }, { call, put }) {
      const userData = yield call(listUser, payload);
      yield put({
        type: 'updateState',
        payload: {
          users: {
            records: userData.data.users,
            checked: userData.data.checked,
          },
        },
      });
    },
    // 保存模块关系表
    *saveModule({ payload }, { call, put }) {
      const response = yield call(saveModule, payload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            operateType: '',
          },
        });
      }
    },
    // 加载模块授权列表
    *listModule({ payload }, { call, put }) {
      const response = yield call(listModule, payload);
      yield put({
        type: 'updateState',
        payload: {
          roleId: payload.roleId,
          operateType: payload.operateType,
          modules: {
            records: response.data.modules,
            checked: response.data.checked,
            checkedResource: response.data.checkedResource,
          },
        },
      });
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
