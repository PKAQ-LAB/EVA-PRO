import { stringify } from 'qs';
import request from '@/utils/request';
// import { getNoUndefinedString } from '@/utils/utils';

// 查询权限列表
export async function fetchRoles(params) {
  return request(`/api/role/list?${stringify(params)}`);
}

// 根据ID删除角色
export async function delRole(params) {
  return request('/api/role/del', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
