import { stringify } from 'qs';
import { request } from 'umi';
import { getNoUndefinedString } from '@/utils/utils';

// 列表
export async function list(params) {
  return request(`/api/pdos/base/goods/list?${stringify(params)}`);
}

// 获取详情
export async function get(params) {
  return request(`/api/pdos/base/goods/get/${getNoUndefinedString(params.id)}`);
}

// 新增/编辑
export async function edit(params) {
  return request('/api/pdos/base/goods/edit', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
// 根据ID删除
export async function del(params) {
  return request('/api/pdos/base/goods/del', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
