import modelExtend from 'dva-model-extend';
import { pageModel } from '@/common/model/BaseModel';
import {
  listUser,
  delUser,
  lockUser,
  saveUser,
  getUser,
  checkUnique,
} from '../services/AccountService';
import { listOrgByAttr } from '../../organization/services/Organization';

export default modelExtend(pageModel, {
  namespace: 'account',
  state: {
    currentUser: {},
    orgData: [],
    currentItem: {},
    modalType: '',
    selectedRowKeys: [],
    formValues: {},
  },
  effects: {
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
    // 右侧按条件查询
    *fetchUser({ payload }, { call, put }) {
      const response = yield call(listUser, payload);
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
    // 查询
    *fetch({ payload }, { call, put }) {
      // 查询数据
      const userData = yield call(listUser, payload);
      const treeData = yield call(listOrgByAttr, { status: '0001' });
      yield put({
        type: 'updateState',
        payload: {
          list: userData.data.records,
          pagination: {
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: total => `共 ${total} 条`,
            total: userData.data.total,
            current: userData.data.current,
          },
          orgData: treeData.data,
        },
      });
    },
    // 切换锁定状态
    *lockSwitch({ payload }, { call, put }) {
      const response = yield call(lockUser, payload);
      if (response && response.success) {
        yield put({
          type: 'updateState',
          payload: {
            list: response.data.records,
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
  },
});
