declare namespace API {
import { message } from 'antd';
  export interface CurrentUser {
    avatar?: string;
    name?: string;
    title?: string;
    group?: string;
    signature?: string;
    tags?: {
      key: string;
      label: string;
    }[];
    userid?: string;
    access?: 'user' | 'guest' | 'admin';
    unreadCount?: number;
    data?: currentUserData;
  }

  export type LoginStateType = {
    code?: string;
    success? : boolean;
    data? : object;
    message?: string;
  };

  export type NoticeIconData = {
    id: string;
    key: string;
    avatar: string;
    title: string;
    datetime: string;
    type: string;
    read?: boolean;
    description: string;
    clickClose?: boolean;
    extra: any;
    status: string;
  };
}

export interface currentUserData {
  menus: Array;
  dict: object;
  user: object;
}
