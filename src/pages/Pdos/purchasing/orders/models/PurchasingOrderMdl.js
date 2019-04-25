import modelExtend from 'dva-model-extend';
import { model } from '@/common/model/BaseModel';
import { message } from 'antd';
import {listPurchasingOrder,
        getPurchasingOrder,
        editPurchasingOrder,
        deletePurchasingOrder} from '../services/PurchasingOrderSvc';
export default modelExtend(model, {
  namespace: 'purchasingOrder',
  state: {
    currentItem: {},
    modalType: '',
    selectedRowKeys: [],
    formValues: {},
  },
  effects: {
    // 查询
    *list({ payload }, { call, put }) {
      // 查询数据
      const response = yield call(listPurchasingOrder, payload);
      if (response && response.data) {
        yield put({
          type: 'saveData',
          payload: response.data,
        });
      }
    },
    // 新增
    *create({ payload }, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          ...payload,
        },
      });
    },
    // 编辑按钮
    *edit({ payload }, { call, put }) {
      const response = yield call(getPurchasingOrder, payload);
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
      const response = yield call(editPurchasingOrder, payload);
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
    // 删除数据
    *delete({ payload, callback }, { call, put }) {
      // 查询数据
      const response = yield call(deletePurchasingOrder, payload);
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
        message.error(`操作失败： ${response.statusText ? response.statusText : '请联系管理员'}.`);
        yield put({
          type: 'updateState',
          payload: {
            loading: { global: false },
          },
        });
      }
    },
  }
})
