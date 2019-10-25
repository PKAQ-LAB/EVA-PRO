import modelExtend from 'dva-model-extend';
import { queryGoods, removeGoods, editGoods, checkUnique, getGoods } from '../services/GoodsSvc';
import { pageModel } from '@src/common/model/BaseModel';
import { message } from 'antd';

export default modelExtend(pageModel, {
  namespace: 'goods',
  state: {
    currentItem: {},
    modalVisible: false,
    data: {
      records: [],
    },
    categorys: [],
    modalType: '',
    expandForm: false,
    selectedRowKeys: [],
    formValues: {},
  },
  effects: {
    *checkUnique({ payload }, { call }) {
      return yield call(checkUnique, payload);
    },
    // 查询
    *fetch({ payload }, { call, put }) {
      // 查询数据
      const response = yield call(queryGoods, payload);
      yield put({
        type: 'saveData',
        payload: response.data,
      });
    },
    // 编辑按钮
    *edit({ payload }, { call, put }) {
      const response = yield call(getGoods, payload);
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
    // 保存一条模块信息
    *save({ payload }, { call, put }) {
      const response = yield call(editGoods, payload);
      if (response && response.data) {
        //  关闭窗口 - 提示成功 - 加载数据
        yield put({
          type: 'updateState',
          payload: {
            modalType: '',
            currentItem: {},
            data: response.data,
          },
        });
        message.success('操作成功');
      } else {
        yield put({
          type: 'updateState',
          payload: {
            modalType: '',
            currentItem: {},
          },
        });
        message.success('操作失败');
      }
    },
    // 删除
    *remove({ payload, callback }, { call, put }) {
      const response = yield call(removeGoods, payload);

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
        message.error(`操作失败： ${response.message ? response.message : '请联系管理员'}.`);
        yield put({
          type: 'updateState',
          payload: {
            loading: { global: false },
          },
        });
      }
    },
  },
});
