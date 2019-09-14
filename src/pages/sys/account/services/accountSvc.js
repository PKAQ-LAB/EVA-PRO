import { stringify } from 'qs';
import request from '@/utils/request';
import { getNoUndefinedString } from '@/utils/utils';

// 查询用户列表
export async function listUser(params) {
  return request(`/api/account/list?${stringify(params)}`);
}
// 查询用户列表
export async function listOrg(params) {
  return request(`/api/organization/list?${stringify(params)}`);
}
// 根据id获取用户信息
export async function getUser(params) {
  return request(`/api/account/get/${getNoUndefinedString(params.id)}`);
}
// 校验编码唯一性
export async function checkUnique(params) {
  return request('/api/account/checkUnique', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
// 保存用户信息
export async function saveUser(params) {
  return request('/api/account/edit', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
// 根据ID删除用户
export async function delUser(params) {
  return request('/api/account/del', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 切换锁定状态
export async function lockUser(params) {
  return request('/api/account/lock', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
