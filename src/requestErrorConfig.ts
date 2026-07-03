import type { RequestOptions } from '@@/plugin-request/request';
import type { RequestConfig } from '@umijs/max';
import { getIntl } from '@umijs/max';
import { message, notification } from 'antd';
import {
  clearAuthState,
  getStoredAccessToken,
  isAuthExpiredCode,
  redirectToLogin,
} from '@/utils/authState';
import { trimRequestPayload } from '@/utils/requestPayload';
import { refreshAccessToken, replayRequest } from '@/utils/tokenRefresh';
import defaultSettings from '../config/defaultSettings';

// 错误处理方案： 错误类型
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}
// 与后端约定的响应数据格式
interface ResponseStructure {
  success: boolean;
  data: unknown;
  code?: string;
  message?: string;
  errorCode?: number | string;
  errorMessage?: string;
  showType?: ErrorShowType;
}

type RetryableRequestOptions = RequestOptions & {
  url?: string;
  method?: string;
  _retryAuth?: boolean;
  _retryCount?: number;
};

const authRequestPaths = [
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/getAlpha',
];

const wait = (timeout: number) =>
  new Promise((resolve) => globalThis.setTimeout(resolve, timeout));

function getAuthErrorCode(payload?: ResponseStructure) {
  return payload?.errorCode ?? payload?.code;
}

function isAuthRequest(url?: string) {
  if (!url) return false;
  return authRequestPaths.some((path) => url.includes(path));
}

async function refreshAndReplayRequest(
  config: RetryableRequestOptions,
  fallbackError?: unknown,
) {
  try {
    const token = await refreshAccessToken();
    return replayRequest(
      {
        ...config,
        _retryAuth: true,
      },
      token,
    );
  } catch {
    clearAuthState();
    redirectToLogin();
    throw fallbackError ?? new Error('登录已失效，请重新登录');
  }
}

async function retryGetRequest(config: RetryableRequestOptions) {
  await wait(300);
  return replayRequest({
    ...config,
    _retryCount: (config._retryCount ?? 0) + 1,
  });
}

/**
 * @name 错误处理
 * pro 自带的错误处理 + EVA-PRO 增强：
 * - HTTP 状态错误 → message.error (含 status 与 服务端 message)
 * - 完全无响应 → notification.error (网络异常)
 * - 业务错误 (success=false) → 由 errorThrower 抛 BizError 后按 showType 处理
 * @doc https://umijs.org/docs/max/request#配置
 */
export const errorConfig: RequestConfig = {
  errorConfig: {
    errorThrower: (res) => {
      const {
        success,
        data,
        code,
        message,
        errorCode,
        errorMessage,
        showType,
      } = res as unknown as ResponseStructure;
      if (!success) {
        const bizMessage = errorMessage || message || '操作失败';
        const error: Error & {
          info?: ResponseStructure;
        } = new Error(bizMessage);
        error.name = 'BizError';
        error.info = {
          success,
          data,
          code,
          message,
          errorCode: errorCode ?? code,
          errorMessage: bizMessage,
          showType,
        };
        throw error;
      }
    },
    errorHandler: (error: any, opts?: { skipErrorHandler?: boolean }) => {
      if (opts?.skipErrorHandler) throw error;
      // 业务错误：errorThrower 抛出的 BizError
      if (error.name === 'BizError') {
        const errorInfo = error.info;
        if (errorInfo) {
          const { errorMessage, errorCode } = errorInfo;
          if (isAuthExpiredCode(errorCode)) {
            clearAuthState();
            message.error(errorMessage || '登录已失效，请重新登录');
            redirectToLogin();
            return;
          }
          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:
              break;
            case ErrorShowType.WARN_MESSAGE:
              message.warning(errorMessage);
              break;
            case ErrorShowType.ERROR_MESSAGE:
              message.error(errorMessage);
              break;
            case ErrorShowType.NOTIFICATION:
              notification.open({
                title: String(errorCode ?? ''),
                description: errorMessage,
              });
              break;
            case ErrorShowType.REDIRECT:
              window.location.href = '/user/login';
              break;
            default:
              message.error(errorMessage);
          }
        }
      } else if (error.response) {
        // HTTP 状态码异常
        const { status, data } = error.response;
        const detail = data?.message;
        if (status === 401) {
          clearAuthState();
          message.error(detail || '登录已失效，请重新登录');
          redirectToLogin();
          return;
        }
        message.error(detail || `[${status}] 网络错误，无法连接服务器`);
      } else if (typeof navigator !== 'undefined' && !navigator.onLine) {
        message.error(
          getIntl().formatMessage({
            id: 'app.request.offline',
            defaultMessage:
              'Network unavailable. Please check your connection and try again.',
          }),
        );
      } else if (error.request) {
        // 请求已发出，没有响应
        notification.error({
          title: '网络异常',
          description: '您的网络发生异常，无法连接服务器',
        });
      } else {
        message.error('请求异常，请稍后重试');
      }
    },
  },

  // 请求拦截器：补全标准 Header（Accept / Content-Type / device / version）
  requestInterceptors: [
    (config: RequestOptions) => {
      const token = getStoredAccessToken();
      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        Pragma: 'no-cache',
        'Cache-Control': 'no-cache',
        device: 'pc',
        version: defaultSettings.version ?? '',
        ...(config.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      return {
        ...config,
        data: trimRequestPayload(config.data),
        params: trimRequestPayload(config.params),
        headers,
      };
    },
  ],

  // 响应拦截器：鉴权失效时尝试刷新 token 并重放原请求；GET 网络无响应时做一次轻量重试。
  responseInterceptors: [
    [
      async (response: any) => {
        const payload = response?.data as ResponseStructure | undefined;
        const config = response?.config as RetryableRequestOptions | undefined;
        if (
          payload?.success === false &&
          isAuthExpiredCode(getAuthErrorCode(payload)) &&
          config &&
          !config._retryAuth &&
          !isAuthRequest(config.url)
        ) {
          return refreshAndReplayRequest(config, response);
        }
        return response;
      },
      async (error: any) => {
        const config = (error?.config || error?.response?.config) as
          | RetryableRequestOptions
          | undefined;
        const status = error?.response?.status;
        if (
          status === 401 &&
          config &&
          !config._retryAuth &&
          !isAuthRequest(config.url)
        ) {
          return refreshAndReplayRequest(config, error);
        }
        const method = (config?.method || 'GET').toUpperCase();
        const canRetryGet =
          config &&
          method === 'GET' &&
          !error?.response &&
          error?.request &&
          (config._retryCount ?? 0) < 1 &&
          !isAuthRequest(config.url) &&
          (typeof navigator === 'undefined' || navigator.onLine);
        if (canRetryGet) {
          return retryGetRequest(config);
        }
        throw error;
      },
    ] as any,
  ] as any,
};
