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

// 保存角色信息
export async function saveRole(params) {
  return request('/api/role/save', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 校验编码唯一性
export async function checkUnique(params) {
  return request('/api/role/checkUnique', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 切换锁定状态
export async function lockRole(params) {
  return request('/api/role/lock', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
