import { getMenuData } from '@/services/menu';
import { Effect } from 'dva';
import { Reducer } from 'redux';
import { MenuDataItem } from '@ant-design/pro-layout';

export interface MenuModelState {
  menuData: MenuDataItem[];
}

export interface MenuModelType {
  namespace: 'menu';
  state: MenuModelState;
  effects: {
    getMenuData: Effect;
  };
  reducers: {
    save: Reducer<MenuModelState>;
  };
}

const MenuModel: MenuModelType = {
  namespace: 'menu',
  state: {
    menuData: [],
  },
  effects: {
    *getMenuData({ callback }, { call, put }) {
      const response = yield call(getMenuData);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback(response);
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        menuData: action.payload || [],
      };
    },
  },
};
export default MenuModel;
