export const model = {
  state: {
    data: [],
  },
  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveData(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};

export const pageModel = {
  state: {
    listData: [],
    pagination: {
      showSizeChanger: false,
      showQuickJumper: true,
      showTotal: total => `共 ${total} 条`,
      current: 1,
      total: 0,
    },
  },
  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveData(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};
