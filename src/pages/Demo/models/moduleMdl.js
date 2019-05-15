import modelExtend from 'dva-model-extend';
import { model } from '@/common/model/BaseModel';
import { message } from 'antd';
import {
  editModule,
  getModule,
  listModule,
  deleteModule,
  checkUnique,
  sortModule,
} from '../services/moduleSvc';

// 使用 modelExtend 继承 BaseModel 中的  model 对象
export default modelExtend(model, {
  // connect进行绑定时绑定的是此处的值而不是文件名
  namespace: 'module',
  // 该模块涉及的状态对象 用来操作一切数据
  state: {
    currentItem: {},
    modalType: '',
    selectedRowKeys: [],
    formValues: {},
  },
  // effects函数， 用来触发crud等异步操作
  effects: {
    // 校验路径唯一性
    // 这里的 * 代表本函数是一个 生成器函数
    // https://www.liaoxuefeng.com/wiki/1022910821149312/1023024381818112
    *checkUnique({ payload }, { call }) {
      // payload 装载了所有调用此函数时候传入的参数
      // 直接将 yield call(checkUnique, payload) 的结果返回
      // checkUnique是调用了moduleSvc中定义的checkUnique方法
      return yield call(checkUnique, payload);
    },
    // 查询
    *listModule({ payload }, { call, put }) {
      // 查询数据
      const response = yield call(listModule, payload);
      // 如果返回了正确的查询结果 调用reducer块中的saveData方法来更改上面state块中对应的数据
      // 本文件中无法找到reducer块是由于本文件中该块继承自 BaseModel- model
      if (response && response.data) {
        yield put({
          type: 'saveData',
          payload: response.data,
        });
      }
    },
    // 新增/新增子节点
    *create({ payload }, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          ...payload,
        },
      });
    },
    // 编辑按钮
    *edit({ payload }, { call, put }) {
      const response = yield call(getModule, payload);

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
    // 排序
    *sortModule({ payload }, { call, put }) {
      const response = yield call(sortModule, payload);
      if (response && response.data) {
        yield put({
          type: 'updateState',
          payload: {
            data: response.data,
          },
        });
      }
    },
    // 保存一条模块信息
    *save({ payload }, { call, put }) {
      const response = yield call(editModule, payload);
      if (response && response.success && response.data) {
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
    // 更改可用状态
    *changeStatus({ payload }, { call, put }) {
      const response = yield call(editModule, payload);
      const oldRecord = payload.record;

      if (response && response.success) {
        oldRecord.status = payload.status;
        yield put({
          type: 'updateState',
          payload: {
            data: response.data,
            selectedRowKeys: [],
          },
        });
      }
    },
    // 删除数据
    *delete({ payload, callback }, { call, put }) {
      // 查询数据
      const response = yield call(deleteModule, payload);
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
        message.error(`操作失败： ${response.message || '请联系管理员'}.`);
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
