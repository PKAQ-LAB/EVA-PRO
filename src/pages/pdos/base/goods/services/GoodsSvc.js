import { stringify } from 'qs';
import request from '@src/utils/request';
import { getNoUndefinedString } from '@src/utils/utils';

export async function checkUnique(params) {
  return request('/jxc/goods/checkUnique', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

export async function queryGoods(params) {
  return request(`/jxc/goods/list?${stringify(params)}`);
}

export async function removeGoods(params) {
  return request('/jxc/goods/del', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}
// 新增/编辑信息
export async function editGoods(params) {
  return request('/jxc/goods/edit', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}
// 获取组织信息
export async function getGoods(params) {
  return request(`/jxc/goods/get/${getNoUndefinedString(params.id)}`);
}
