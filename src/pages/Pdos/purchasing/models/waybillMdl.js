import modelExtend from 'dva-model-extend';
import { pageModel } from '@/common/model/BaseModel';
import {
  list,
  delWaybill,
  checkByWillnum,
  saveWaybill,
  getWaybill,
  gameOver,
  isBlackCar,
} from '../services/waybillSvc';

export default modelExtend(pageModel, {
  namespace: 'waybillMgt',
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
    // 列表数据
    listData: [],
    // 明细数据
    lineData: [],
    // 明细窗口状态
    modalType: '',
    // 当前编辑项得索引
    editItem: '',
    // 已选行的对象
    sr: [],
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
            listData: response.data.records,
            pagination: {
              showSizeChanger: false,
              showQuickJumper: true,
              showTotal: total => `共 ${total} 条`,
              total: response.data.total,
              current: response.data.current,
            },
          },
        });
      }
    },
    // 加载运单信息
    *getWaybill({ payload }, { call, put }) {
      const response = yield call(getWaybill, payload);
      if (response && response.success) {
        yield put({
          type: 'updateState',
          payload: {
            currentItem: response.data,
            lineData: response.data.lineList,
            editTab: true,
            activeKey: 'edit',
            operateType: 'edit',
          },
        });
      }
    },
    // 根据运单号和企业id获取当前运单信息
    *checkByWillnum({ payload }, { call }) {
      return yield call(checkByWillnum, payload);
    },
    // 检查黑名单
    *isBlackCar({ payload }, { call }) {
      return yield call(isBlackCar, payload);
    },
    // 保存
    *save({ payload }, { call, put }) {
      const response = yield call(saveWaybill, payload);
      // 清空表单内容
      if (response && response.data) {
        //  关闭窗口 - 提示成功 - 加载数据
        yield put({
          type: 'updateState',
          payload: {
            editTab: false,
            activeKey: 'list',
            operateType: '',
            listData: response.data.records,
            pagination: {
              showSizeChanger: false,
              showQuickJumper: true,
              showTotal: total => `共 ${total} 条`,
              total: response.data.total,
              current: response.data.current,
            },
          },
        });
      }
    },
    // 删除
    *remove({ payload }, { call, put }) {
      const response = yield call(delWaybill, payload);
      if (response && response.success) {
        yield put({
          type: 'updateState',
          payload: {
            listData: response.data.records,
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
    *gameOver({ payload }, { call, put }) {
      const response = yield call(gameOver, payload);
      if (response && response.success) {
        yield put({
          type: 'updateState',
          payload: {
            listData: response.data.records,
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
