import modelExtend from 'dva-model-extend';
import { pageModel } from '@/common/model/BaseModel';
import { list, } from '../services/waybillSvc';

export default modelExtend(pageModel, {
  namespace: 'waybill',
  state: {
    // 新增 or 编辑
    editTab: false,
    // 查看
    viewTab: false,
    // 加载状态
    loading: false,
    // 激活的页签
    activeKey: 'list',
    // 当前操作类型
    operateType: '',
    // 已选
    selectedRowKeys:[],
    // 列表数据
    listData: [],
  },
  effects: {
    // 获取所有列表信息
    *fetch({ payload }, { call, put }) {
     // 查询数据
     const response = yield call(list, payload);
     if(response && response.success){
      yield put({
        type: 'updateState',
        payload: {
          listData: response.data.records,
          pagination: {
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: total => `共 ${total} 条`,
            total: response.data.total,
            current: response.data.current,
          },
        },
      });
     }
    },

    // 保存
    *save({ payload }, { call, put }) {
      const response = yield call(edit, payload);
      // 清空表单内容
      yield put({
        type: 'updateState',
        payload: {
          currentItem: {},
        },
      });
      if (response && response.data) {
        //  关闭窗口 - 提示成功 - 加载数据
        yield put({
          type: 'updateState',
          payload: {
            lists: response.data.records,
          },
        });
      }
    },

    // 根据id获取单条信息
    *load({ payload }, { call, put }) {
      const response = yield call(get, payload);
      if (response && response.data) {
        yield put({
          type: 'updateState',
          payload: {
            currentItem: response.data,
          },
        });
      }
    },

    // 删除
    *remove({ payload }, { call, put }) {
      const response = yield call(del, payload);
      if (response && response.success) {
        yield put({
          type: 'updateState',
          payload: {
            lists: response.data.records,
          },
        });
      }
    },
  },

  reducers: {
    // tab界面切换
    tabChange(state, { payload: event }) {
      const tabName = [];
      if (event.tabType === 'add') {
        tabName[0] = '列表';
        tabName[1] = '新增';
      } else if (event.tabType === 'edit') {
        tabName[0] = '列表';
        tabName[1] = '编辑';
      } else if (event.tabType === 'watch') {
        tabName[0] = '列表';
        tabName[1] = '查看';
      } else {
        tabName[0] = '列表';
        tabName[1] = '';
      }
      return {
        ...state,
        // tab页面切换
        tabName,
        tabKey: event.tabType === 'main' ? [0, 1] : [1, 0],
        currentItem: event.tabType === 'main' ? {} : state.currentItem,
        // 隐藏提交按钮
        hideSubmitBtn: event.isHide,
      };
    }
  }
});
