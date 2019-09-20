import { stringify } from 'qs';
import request from '@/utils/request';
import { getNoUndefinedString } from '@/utils/utils';

// 查询权限列表
export async function fetchRoles(params) {
  return request(`/api/role/list?${stringify(params)}`);
}
