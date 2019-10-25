import { stringify } from 'qs';
import request from '@src/utils/request';
import { getNoUndefinedString } from '@src/utils/utils';

// 查询用户列表
export async function listUser(params) {
  return request(`/api/sys/account/list?${stringify(params)}`);
}
// 查询部门列表
export async function listOrg(params) {
  return request(`/api/sys/organization/list?${stringify(params)}`);
}
// 查询角色列表
export async function listRole(params) {
  return request(`/api/sys/role/listAll?${stringify(params)}`);
}
// 根据id获取用户信息
export async function getUser(params) {
  return request(`/api/sys/account/get/${getNoUndefinedString(params.id)}`);
}
// 校验编码唯一性
export async function checkUnique(params) {
  return request('/api/sys/account/checkUnique', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
// 保存用户信息
export async function saveUser(params) {
  return request('/api/sys/account/edit', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
// 保存用户权限信息
export async function grantUser(params) {
  return request('/api/sys/account/grant', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
// 根据ID删除用户
export async function delUser(params) {
  return request('/api/sys/account/del', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 切换锁定状态
export async function lockUser(params) {
  return request('/api/sys/account/lock', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
