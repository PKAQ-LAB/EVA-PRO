import { stringify } from 'qs';
import { request } from '@umijs/max';
import { getNoUndefinedString } from '@/utils/utils';

// get请求
async function get(url: string, params: string) {
  return request(`${url}/${getNoUndefinedString(params)}`);
}

// 加载列表
async function list(url: string, params: object) {
  const urls = params ? `${url}?${stringify(params)}` : url;
  return request(urls);
}

// 新增/编辑
export async function edit(url: string, params: object) {
  return request(url, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
// 根据ID删除
export async function del(url: string, params: object) {
  return request(url, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// post请求
async function post(url: string, params: object) {
  return request(url, {
    method: 'POST',
    data: params,
  });
}

export default {
  get,
  list,
  del,
  post,
};
