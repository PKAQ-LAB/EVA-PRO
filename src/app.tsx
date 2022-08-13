import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import { LinkOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { PageLoading } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RequestConfig, ResponseInterceptor, RunTimeLayoutConfig } from '@umijs/max';
import { history, Link } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { currentUser as queryCurrentUser } from './services/ant-design-pro/api';

import setting from '@config/defaultSettings';
import { printANSI } from '@/utils/screenlog';
import { message, notification } from 'antd';
printANSI();

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser({
        skipErrorHandler: true,
      });
      return msg.data;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };
  // 如果不是登录页面，执行
  if (window.location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    waterMarkProps: {
      content: initialState?.currentUser?.name,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    layoutBgImgList: [
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
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
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children, props) => {
      if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {!props.location?.pathname?.includes('/login') && (
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
          )}
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
const requestInterceptors = (url: string, options: any) => {
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
const responseInterceptors = (response: ResponseInterceptor) => {
    if (response && response.success) {
      if (response.message) {
        message.success(response.message);
      }
    } else {
      message.error(response.message || '操作失败');
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


