import { request } from '@umijs/max';
import { stringify } from 'qs';
import { getNoUndefinedString } from './utils';

/** GET /{url}/{id-or-empty} */
async function get<T = unknown>(url: string, params?: string) {
  return request<T>(`${url}/${getNoUndefinedString(params)}`);
}

/** GET 列表，自动序列化 params 为 query string */
async function list<T = unknown>(
  url: string,
  params?: Record<string, unknown>,
) {
  const finalUrl = params ? `${url}?${stringify(params)}` : url;
  return request<T>(finalUrl);
}

/** POST 通用方法 */
async function post<T = unknown>(url: string, params?: unknown) {
  return request<T>(url, { method: 'POST', data: params });
}

/** 新增 / 编辑：底层走 POST */
export async function edit<T = unknown>(url: string, params?: unknown) {
  return post<T>(url, params);
}

/** 删除：底层走 POST */
export async function del<T = unknown>(url: string, params?: unknown) {
  return post<T>(url, params);
}

const http = { get, list, post, edit, del };
export default http;
