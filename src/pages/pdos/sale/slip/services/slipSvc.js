import { stringify } from 'qs';
import request from '@src/utils/request';
import { getNoUndefinedString } from '@src/utils/utils';

// 销售单列表
export async function list(params) {
  return request(`/api/sale/list?${stringify(params)}`);
}

// 获取销售单详情
export async function get(params) {
  return request(`/api/sale/get/${getNoUndefinedString(params.id)}`);
}

// 新增/编辑组织信息
export async function editSlip(params) {
  return request('/api/sale/edit', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
// 根据ID删除角色
export async function delSlip(params) {
  return request('/api/sale/del', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
