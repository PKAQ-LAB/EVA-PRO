import { request } from '@umijs/max';
import { getErrorCode, isAuthExpiredError } from '@/utils/authState';
import { DictionaryIntegrityError, type DictionaryResult, validDictionary } from '@/utils/dictionaryState';

/** 获取所有用户 GET /api/users */
export async function queryUsers() {
  return request<API.CurrentUser[]>('/api/users');
}

/** 获取登录用户的菜单树 GET /api/auth/fetchMenus */
export async function fetchMenus(options?: Record<string, unknown>) {
  return request<{
    success?: boolean;
    resourcePermissionEnabled?: boolean;
    dataPermissionEnabled?: boolean;
    data?: unknown;
  }>('/api/auth/fetchMenus', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取全部字典 GET /api/auth/fetchDicts */
export async function fetchDict(
  options?: Record<string, unknown>,
  etag?: string,
): Promise<DictionaryResult> {
  try {
    const headers = {
      ...(options?.headers as Record<string, string> | undefined),
    };
    delete headers['If-None-Match'];
    if (etag) headers['If-None-Match'] = etag;
    const response = await request<{ success?: boolean; data?: unknown }>(
      '/api/auth/fetchDicts',
      {
        ...options,
        method: 'GET',
        headers,
        getResponse: true,
        skipErrorHandler: true,
        validateStatus: (status: number) => status === 200 || status === 304,
      },
    );
    if (!response || !response.headers)
      throw new DictionaryIntegrityError('字典响应无效');
    const returnedEtag = response.headers.etag;
    if (
      typeof returnedEtag !== 'string' ||
      !/^W\/"dict-v1-[a-f0-9]{64}"$/.test(returnedEtag)
    )
      throw new DictionaryIntegrityError('字典版本无效');
    if (response.status === 304)
      return { kind: 'unchanged', etag: returnedEtag };
    if (
      response.status !== 200 ||
      response.data?.success !== true ||
      !validDictionary(response.data.data)
    )
      throw new DictionaryIntegrityError('字典结构无效');
    return { kind: 'updated', data: response.data.data, etag: returnedEtag };
  } catch (error) {
    const status = (error as { response?: { status?: number } })?.response
      ?.status;
    const business = error as { name?: string; info?: { success?: boolean } };
    if (
      isAuthExpiredError(error) ||
      status === 403 ||
      ['0x0000-10002', '0x000-00006', '0x000-00024'].includes(
        getErrorCode(error) ?? '',
      ) ||
      (business.name === 'BizError' &&
        business.info?.success === false &&
        (status == null || status < 500))
    ) {
      throw Object.assign(new DictionaryIntegrityError('字典快照不可用'), {
        code: getErrorCode(error),
        response: status ? { status } : undefined,
      });
    }
    throw error;
  }
}

/** 通知列表 GET /api/notices */
export async function queryNotices() {
  return request<{ data: API.NoticeIconItem[] }>('/api/notices');
}

/** 修改密码 POST /api/sys/account/repwd */
export async function repwd(params: {
  oldPassword?: string;
  newPassword?: string;
  [k: string]: unknown;
}) {
  return request<{ success?: boolean; data?: unknown }>(
    '/api/sys/account/repwd',
    {
      method: 'POST',
      data: { ...params },
    },
  );
}
