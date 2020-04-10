import { stringify } from 'qs';
import request from '@/utils/request';
import { getNoUndefinedString } from '@/utils/utils';

// 销售单列表
export async function list(params) {
  return request(`/api/pdos/sale/slip/list?${stringify(params)}`);
}

// 获取销售单详情
export async function get(params) {
  return request(`/api/pdos/sale/slip/get/${getNoUndefinedString(params.id)}`);
}

// 新增/编辑组织信息
export async function editSlip(params) {
  return request('/api/pdos/sale/slip/edit', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
// 根据ID删除角色
export async function delSlip(params) {
  return request('/api/pdos/sale/slip/del', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
