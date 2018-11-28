import modelExtend from 'dva-model-extend';
import { queryGoods, removeGoods, addGoods } from '../services/GoodsSvc';
import { pageModel } from '@/common/model/BaseModel';

export default modelExtend(pageModel, {
  namespace: 'goods',
  state: {
    currentItem: {},
    modalVisible: false,
    data:{
      records: [],
    },
    categorys: [],
    modalType: 'create',
    expandForm: false,
    selectedRowKeys: [],
    formValues: {},
  },
  effects: {
    // 查询
    *fetch({ payload }, { call, put }) {
      // 查询数据
      const response = yield call(queryGoods, payload);
      yield put({
        type: 'saveData',
        payload: response.data,
      });
    },
    // 新增
    *add({ payload, callback }, { call, put }) {
      yield put({ type: 'showLoading' });
      const response = yield call(addGoods, payload);

      yield put({
        type: 'saveData',
        payload: response,
      });

      yield put({ type: 'hideLoading' });

      yield put({ type: 'hideModal' });
      if (callback) callback();
    },
    // 删除
    *remove({ payload, callback }, { call, put }) {
      yield put({ type: 'showLoading' });
      const response = yield call(removeGoods, payload);

      yield put({
        type: 'saveData',
        payload: response,
      });

      yield put({ type: 'hideLoading' });

      if (callback) callback();
    },
  },
});
