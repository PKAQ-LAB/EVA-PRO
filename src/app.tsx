import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import { LinkOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { PageLoading } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RequestConfig, ResponseInterceptor, RunTimeLayoutConfig } from '@umijs/max';
import { history, Link } from '@umijs/max';
// import { currentUser as queryCurrentUser } from './services/ant-design-pro/api';
import { fetchMenus, fetchDict } from '@/services/user';
import React from 'react';
import { loopMenuItem } from '@/utils/DataHelper';
import defaultSettings from '@config/defaultSettings';
import { printANSI } from '@/utils/screenlog';
import { message, notification } from 'antd';

// import { createRef } from 'react';
import { access_token } from './constant'
import Cookies from 'universal-cookie';
const cookie = new Cookies();

import bgA from '../public/bgA.webp';
import bgB from '../public/bgB.webp';
import bgC from '../public/bgC.webp';

// 打印控制台欢迎语句
printANSI();

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

// export const layoutActionRef = createRef<{ reload: () => void }>();

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  dict?: API.dict;
  loading?: boolean;
  initDict?: () => Promise<API.dict | undefined>;
  // fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  /**
       * 加载字典
       */
  const initDict = async () => {
    return await fetchDict();
  }
  // 判断本地是否有用户登录信息 未登录跳转登录页

  if(!cookie.get(access_token)){
    history.push(loginPath);
  }

  // 如果不是登录页面 且已经登录，执行
  const { location } = history;
  if (location.pathname !== loginPath) {
    const dict = initDict();
    return {
      dict: dict?.data,
      settings: defaultSettings,
    };
  }
  return {
    // fetchUserInfo,
    settings: defaultSettings,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    rightContentRender: () => <RightContent />,
    // waterMarkProps: {
    //   content: initialState?.currentUser?.name,
    // },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!cookie.get(access_token) && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    layoutBgImgList: [
      {
        src: bgA,
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: bgB,
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: bgC,
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],
    links: isDev
      ? [
          <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
            <LinkOutlined />
            <span>OpenAPI 文档</span>
          </Link>,
        ]
      : [],
    menuHeaderRender: undefined,
    menu: {
      locale: false,
      // 每当 initialState?.currentUser?.userid 发生修改时重新执行 request
      params: initialState,
     // 调用下面的代码手动刷新菜单
     // request().then(() => {
     //   layoutActionRef.current.reload();
     // });
      // actionRef: layoutActionRef,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      request: async (_params, _defaultMenuData) => {
        const res = await fetchMenus();
        const menus = res.data;
        // return menus;
        return loopMenuItem(menus);
      },
    },
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          <SettingDrawer
            disableUrlParams
            enableDarkTheme
            settings={initialState?.settings}
            onSettingChange={(settings) => {
              setInitialState((preInitialState) => ({
                ...preInitialState,
                settings,
              }));
            }}
          />
        </>
      );
    },
    ...initialState?.settings,
  };
};

/****
 * request 增强处理
 */

/** 异常处理程序
 * @see https://beta-pro.ant.design/docs/request-cn
 */
 const errorHandler = (error: any) => {

  const { response } = error;
  if (response && response.status) {
    const { status } = response;

   // if (status === 401) {
      // @HACK
      /* eslint-disable no-underscore-dangle */
      // TODO
      // 若退出登录接口返回了401, 则此处会进入退出死循环调用
      //loginOut();
     // return;
 //   }
    const msgtxt = response.data?.message;
    message.error({
      content: msgtxt || '['+status+'] 网络错误，无法连接服务器',
    });
  }

  if (!response) {
    notification.error({
      description: '您的网络发生异常，无法连接服务器',
      message: '网络异常',
    });
  }
  throw error;
};

// request拦截器, 改变url 或 options.
const requestInterceptors = (url: string, options: any) => {
  // eslint-disable-next-line no-param-reassign
  const header = {
    ...options.headers,
    Accept: 'application/json',
    'Content-Type': 'application/json; charset=utf-8',
    Pragma: 'no-cache',
    'Cache-Control': 'no-cache',
    'device': 'pc',
    'version': defaultSettings.version
  };

  return {
    url,
    options: {
      ...options,
      header,
      interceptors: true,
    },
  };
};

/**
 * 4. 基于response interceptors
 */
const responseInterceptors = (response: ResponseInterceptor) => {
  const { data } = response;
  if (!!!data?.success) {
    message.error(data?.message || '操作失败');
  }

  return response;
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request: RequestConfig = {
  useCache: false,
  // 默认错误处理
  errorConfig:{
    errorHandler,
  },
  // 默认请求是否带上cookie
  credentials: 'include',
  requestInterceptors: [requestInterceptors],
  responseInterceptors: [responseInterceptors]
};


