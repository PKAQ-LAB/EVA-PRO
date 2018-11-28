import { stringify } from 'qs';
import request from '@/utils/request';

export async function queryGoods(params) {
  return request(`/jxc/goods/list?${stringify(params)}`);
}

export async function removeGoods(params) {
  return request('/jxc/goods/de', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

export async function addGoods(params) {
  return request('/jxc/goods/edit', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}
