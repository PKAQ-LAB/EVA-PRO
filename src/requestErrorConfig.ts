import type { RequestOptions } from '@@/plugin-request/request';
import type { RequestConfig } from '@umijs/max';
import { getIntl } from '@umijs/max';
import { message, notification } from 'antd';
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
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
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
      const { success, data, errorCode, errorMessage, showType } =
        res as unknown as ResponseStructure;
      if (!success) {
        const error: Error & {
          info?: ResponseStructure;
        } = new Error(errorMessage);
        error.name = 'BizError';
        error.info = {
          success,
          data,
          errorCode,
          errorMessage,
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
      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        Pragma: 'no-cache',
        'Cache-Control': 'no-cache',
        device: 'pc',
        version: defaultSettings.version ?? '',
        ...(config.headers || {}),
      };
      return { ...config, headers };
    },
  ],

  // 响应拦截器：业务约定 data.success 为 false 时弹错误
  responseInterceptors: [
    (response) => {
      const data = response?.data as ResponseStructure | undefined;
      // 仅在响应体形如 { success, data } 时才介入，避免误伤直接返回数组等场景
      if (
        data &&
        typeof data === 'object' &&
        'success' in data &&
        data.success === false
      ) {
        message.error(data.errorMessage || '操作失败');
      }
      return response;
    },
  ],
};
