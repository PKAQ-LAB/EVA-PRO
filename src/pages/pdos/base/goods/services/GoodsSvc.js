import { stringify } from 'qs';
import request from '@/utils/request';
import { getNoUndefinedString } from '@/utils/utils';

export async function checkUnique(params) {
  return request('/pdos/base/goods/checkUnique', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function queryGoods(params) {
  return request(`/pdos/base/goods/list?${stringify(params)}`);
}

export async function removeGoods(params) {
  return request('/pdos/base/goods/del', {
    method: 'POST',
    data: {
      ...params,
      method: 'post',
    },
  });
}

// 新增/编辑信息
export async function editGoods(params) {
  return request('/pdos/base/goods/edit', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 获取组织信息
export async function getGoods(params) {
  return request(`/pdos/base/goods/get/${getNoUndefinedString(params.id)}`);
}
