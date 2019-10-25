import { stringify } from 'qs';
import request from '@src/utils/request';
import { getNoUndefinedString } from '@src/utils/utils';
// 查询授权菜单列表
export async function listModule(params) {
  return request(`/api/sys/role/listModule?${stringify(params)}`);
}
// 获取授权角色列表
export async function listUser(params) {
  return request(`/api/sys/role/listUser?${stringify(params)}`);
}
// 查询部门列表
export async function listOrg(params) {
  return request(`/api/sys/organization/list?${stringify(params)}`);
}
// 根据id获取角色信息
export async function getRole(params) {
  return request(`/api/sys/role/get/${getNoUndefinedString(params.id)}`);
}

// 查询权限列表
export async function fetchRoles(params) {
  return request(`/api/sys/role/list?${stringify(params)}`);
}

// 根据ID删除角色
export async function delRole(params) {
  return request('/api/sys/role/del', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 保存角色信息
export async function saveRole(params) {
  return request('/api/sys/role/save', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 校验编码唯一性
export async function checkUnique(params) {
  return request('/api/sys/role/checkUnique', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 切换锁定状态
export async function lockRole(params) {
  return request('/api/sys/role/lock', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 保存用户关系
export async function saveUser(params) {
  return request('/api/sys/role/saveUser', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
// 保存模块关系
export async function saveModule(params) {
  return request('/api/sys/role/saveModule', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
