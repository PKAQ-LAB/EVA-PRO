import { stringify } from 'qs';
import request from '@/utils/request';
import { getNoUndefinedString } from '@/utils/utils';
// 查询授权菜单列表
export async function listModule(params) {
  return request(`/api/role/listModule?${stringify(params)}`);
}
// 获取授权角色列表
export async function listUser(params) {
  return request(`/api/role/listUser?${stringify(params)}`);
}
// 查询部门列表
export async function listOrg(params) {
  return request(`/api/organization/list?${stringify(params)}`);
}
// 根据id获取角色信息
export async function getRole(params) {
  return request(`/api/role/get/${getNoUndefinedString(params.id)}`);
}

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

// 保存用户关系
export async function saveUser(params) {
  return request('/api/role/saveUser', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
// 保存模块关系
export async function saveModule(params) {
  return request('/api/role/saveModule', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
