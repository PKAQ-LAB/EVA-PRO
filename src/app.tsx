import React from 'react';
import type { Settings as LayoutSettings, MenuDataItem } from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
import { SolutionOutlined, RocketFilled, ProfileFilled,
         RadarChartOutlined, FileFilled, HomeFilled, SettingFilled, FlagFilled,
         BarsOutlined, UsergroupAddOutlined, FormOutlined } from '@ant-design/icons';

import type { RequestConfig, RunTimeLayoutConfig } from 'umi';
import { getIntl, getLocale, history, Link } from 'umi';
import type { ResponseError } from 'umi-request';
import type { RequestOptionsInit } from 'umi-request';
import RightContent from '@/components/RightContent';
import Footer from '@/components/Footer';
import setting from '@config/defaultSettings';
import { printANSI } from '@/utils/screenlog.js';
import { notification, message } from 'antd';
import { queryCurrent } from './services/user';

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

// 菜单图标映射
const IconMap = {
  profile: <ProfileFilled/>,
  'radar-chart': <RadarChartOutlined/>,
  file: <FileFilled/>,
  home: <HomeFilled/>,
  setting: <SettingFilled/>,
  flag: <FlagFilled/>,
  bars: <BarsOutlined/>,
  'usergroup-add': <UsergroupAddOutlined/>,
  form: <FormOutlined/>,
  rocket: <RocketFilled />,
  "solution": <SolutionOutlined/>
};

// 自定义菜单渲染
const loopMenuItem = (menus: MenuDataItem[]): MenuDataItem[] => {
  if(!menus) return [];

  return menus.map(({ icon, children, ...item }) => ({
    ...item,
    icon: icon && IconMap[icon as string],
    children: children && loopMenuItem(children),
  }))
};

export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  dict?: object;
  menus?: any[];
  user?: object;
}> {
  // 如果是登录页面，不执行
  if (history.location.pathname !== '/user/login') {
    printANSI();
    const currentUser = await queryCurrent();
    return {
      currentUser,
      settings: setting,
      dict: currentUser?.data?.dict,
      user: currentUser?.data?.user,
      menus: currentUser?.data?.menus
    };
  }

  return {
    menus: [],
    currentUser: {},
    dict: {},
    user: {},
    settings: {},
  };

}

/**
 * 异常处理程序
 const codeMessage = {
    200: '服务器成功返回请求的数据。',
    201: '新建或修改数据成功。',
    202: '一个请求已经进入后台排队（异步任务）。',
    204: '删除数据成功。',
    400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
    401: '用户没有权限（令牌、用户名、密码错误）。',
    403: '用户得到授权，但是访问是被禁止的。',
    404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
    405: '请求方法不被允许。',
    406: '请求的格式不可得。',
    410: '请求的资源被永久删除，且不会再得到的。',
    422: '当创建一个对象时，发生一个验证错误。',
    500: '服务器发生错误，请检查服务器。',
    502: '网关错误。',
    503: '服务不可用，服务器暂时过载或维护。',
    504: '网关超时。',
 };
 * @see https://beta-pro.ant.design/docs/request-cn
 */
export const request: RequestConfig = {
  errorHandler: (error: ResponseError) => {
    const { messages } = getIntl(getLocale());
    const { response } = error;

    if (response && response.status) {
      const { status, statusText, url } = response;
      const requestErrorMessage = messages['app.request.error'];
      const errorMessage = `${requestErrorMessage} ${status}: ${url}`;
      const errorDescription = messages[`app.request.${status}`] || statusText;
      notification.error({
        message: errorMessage,
        description: errorDescription,
      });
    }

    if (!response) {
      notification.error({
        description: '您的网络发生异常，无法连接服务器',
        message: '网络异常',
      });
    }
    throw error;
  },
};

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState }) => {

  return {
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
	menuDataRender: () => loopMenuItem(initialState?.menus || []),
    waterMarkProps: {
      content: initialState?.currentUser?.name,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;

      // 判断是否有user 如果没有 则认为是未登录
      // 如果没有登录，重定向到 login
      if (!initialState?.user && location.pathname !== '/user/login') {
        history.push('/user/login');
      }
    },
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    ...initialState?.settings,
  };
};

/** 异常处理程序
 * @see https://beta-pro.ant.design/docs/request-cn
 */
const errorHandler = (error: ResponseError) => {
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

    if (status === 403) {
      history.push('/exception/403');
    } else if (status >= 404 && status < 422) {
      history.push('/exception/404');
    } else {
      message.error({
        content: '未知网络错误，无法连接服务器',
      });
    }
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
const requestInterceptors = (url: string, options: RequestOptionsInit) => {
  // eslint-disable-next-line no-param-reassign
  const header = {
    ...options.headers,
    Accept: 'application/json',
    'Content-Type': 'application/json; charset=utf-8',
    Pragma: 'no-cache',
    'Cache-Control': 'no-cache',
    'device': 'pc',
    'version': setting.version
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
const responseInterceptors = (response: Response) => {
  response.clone().json().then( r => {
    if (r && r.success) {
      if (r.message) {
        message.success(r.message);
      }
    } else {
      message.error(r.message || '操作失败');
    }
  });

  return response;
};


export const request: RequestConfig = {
  useCache: false,
  // 默认错误处理
  errorHandler,
  // 默认请求是否带上cookie
  credentials: 'include',
  requestInterceptors: [requestInterceptors],
  responseInterceptors: [responseInterceptors]
};
