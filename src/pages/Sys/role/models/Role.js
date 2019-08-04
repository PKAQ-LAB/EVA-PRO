import modelExtend from 'dva-model-extend';
import { pageModel } from '@/common/model/BaseModel';
import {
  list,
  listUser,
  listModule,
  getRole,
  saveUser,
  saveRole,
  saveModule,
  delRole,
  lockRole,
  checkUnique,
  getDictItemByRoleId,
} from '../services/RoleService';
// 角色授权管理model
export default modelExtend(pageModel, {
  namespace: 'role',
  state: {
    currentItem: {},
    roleId: '',
    modalType: '',
    operateType: '',
    selectedRowKeys: [],
    moduleData: {
      data: [],
      checked: [],
      allCheckedKeys: [],
    },
    userData: {
      data: [],
      checked: [],
    },
    configData: [],
    name: '',
    code: '',
  },
  effects: {
    // 校验编码唯一性
    *checkUnique({ payload }, { call }) {
      return yield call(checkUnique, payload);
    },
    // 加载权限列表
    *listRole({ payload }, { call, put }) {
      const response = yield call(list, payload);
      yield put({
        type: 'updateState',
        payload: {
          list: response.data.records,
          pagination: {
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: total => `共 ${total} 条`,
            total: response.data.total,
            current: response.data.current,
          },
        },
      });
    },
    // 切换锁定状态
    *lockSwitch({ payload }, { call }) {
      yield call(lockRole, payload);
    },
    // 编辑按钮
    *edit({ payload }, { call, put }) {
      const response = yield call(getRole, payload);
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
      const response = yield call(saveRole, payload);
      if (response && response.data) {
        yield put({
          type: 'updateState',
          payload: {
            modalType: '',
            list: response.data.records,
            pagination: {
              showSizeChanger: false,
              showQuickJumper: true,
              showTotal: total => `共 ${total} 条`,
              total: response.data.total,
              current: response.data.current,
            },
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
          moduleData: {
            data: response.data.modules,
            checked: response.data.checked,
          },
        },
      });
    },
    // 获取所有授权参数
    *listConfig({ payload }, { call, put }) {
      const response = yield call(getDictItemByRoleId, payload);
      yield put({
        type: 'updateState',
        payload: {
          configData: response,
          operateType: 'Config',
        },
      });
    },
    // 获取所有用户
    *listUser({ payload }, { call, put }) {
      const response = yield call(listUser, payload);
      const data = {
        userData: {
          data: {
            list: response.data.users.records,
            checked: response.data.checked,
            pagination: {
              showSizeChanger: false,
              showQuickJumper: true,
              showTotal: total => `共 ${total} 条`,
              total: response.data.users.total,
              current: response.data.users.current,
            },
          },
          checked: response.data.checked,
        },
      }

      if(payload.currentItem){
        data.currentItem = payload.currentItem;
      }

      yield put({
        type: 'updateState',
        payload: data,
      });
    },
    // 保存模块关系表
    *saveUser({ payload }, { call, put }) {
      yield call(saveUser, payload);

      yield put({
        type: 'updateState',
        payload: {
          operateType: '',
        },
      });
    },
    // 删除
    *remove({ payload }, { call, put }) {
      const response = yield call(delRole, payload);
      if (response && response.success) {
        yield put({
          type: 'updateState',
          payload: {
            list: response.data.records,
            pagination: {
              showSizeChanger: false,
              showQuickJumper: true,
              showTotal: total => `共 ${total} 条`,
              total: response.data.total,
              current: response.data.current,
            },
            selectedRowKeys: [],
          },
        });
      }
    },
    // -- end
  },
});
