import { list, del, checkCode, edit, get } from '../services/purchasingSvc';

export default {
  namespace: 'purchasing',
  state: {
    // 新增 or 编辑
    editTab: false,
    // 激活的页签
    activeKey: 'list',
    // 当前操作类型
    operateType: '',
    // 已选
    selectedRowKeys: [],
    // 已选明细
    selectedLineRowKeys: [],
    // 当前编辑主表内容
    currentItem: {},
    // 明细数据
    lineData: [],
    // 当前编辑主表内容
    viewItem: {},
    // 明细数据
    viewLineData: [],
    // 明细窗口状态
    modalType: '',
    // 当前编辑项得索引
    editItem: '',
  },
  effects: {
    // 获取所有列表信息
    *fetch({ payload }, { call, put }) {
      // 查询数据
      const response = yield call(list, payload);
      if (response && response.success) {
        yield put({
          type: 'updateState',
          payload: {
            selectedRowKeys: [],
            selectedLineRowKeys: [],
            listData: response.data,
          },
        });
      }
    },
    // 加载采购入库单信息
    *get({ payload }, { call, put }) {
      const response = yield call(get, payload);
      if (response && response.success) {
        yield put({
          type: 'updateState',
          payload: {
            editTab: true,
            activeKey: 'edit',
            operateType: 'edit',
            currentItem: response.data,
            lineData: response.data.line,
          },
        });
      }
    },
    // 查看采购入库单信息
    *view({ payload }, { call, put }) {
      const response = yield call(get, payload);
      if (response && response.success) {
        yield put({
          type: 'updateState',
          payload: {
            activeKey: 'view',
            operateType: 'view',
            viewTab: true,
            viewItem: response.data,
            viewLineData: response.data.line,
          },
        });
      }
    },
    // 根据运单号和企业id获取当前运单信息
    *checkCode({ payload }, { call }) {
      return yield call(checkCode, payload);
    },
    // 保存
    *save({ payload }, { call, put }) {
      const response = yield call(edit, payload);
      // 清空表单内容
      if (response && response.success) {
        //  关闭窗口 - 提示成功 - 加载数据
        yield put({
          type: 'updateState',
          payload: {
            editTab: false,
            activeKey: 'list',
            operateType: '',
            currentItem: {},
            lineData: [],
          },
        });
        yield put({
          type: 'fetch',
        });
      }
    },
    // 删除
    *remove({ payload }, { call, put }) {
      const response = yield call(del, payload);
      if (response && response.success) {
        yield put({
          type: 'fetch',
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
