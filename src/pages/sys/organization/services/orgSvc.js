import { stringify } from 'qs';
import request from '@src/utils/request';
import { getNoUndefinedString } from '@src/utils/utils';
// 获取组织信息
export async function getOrg(params) {
  return request(`/api/sys/organization/get/${getNoUndefinedString(params.id)}`);
}
// 加载组织列表
export async function listOrg(params) {
  return request(`/api/sys/organization/list/?${stringify(params)}`);
}
// 根据属性加载组织列表
export async function listOrgByAttr(params) {
  return request(`/api/sys/organization/list/?${stringify(params)}`);
}
// 排序组织信息
export async function sortOrg(params) {
  return request('/api/sys/organization/sort', {
    method: 'POST',
    data: params,
  });
}
// 新增/编辑组织信息
export async function editOrg(params) {
  return request('/api/sys/organization/edit', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
// 切换可用状态
export async function switchStatus(params) {
  return request('/api/sys/organization/switchStatus', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
// 根据ID删除组织
export async function deleteOrg(params) {
  return request('/api/sys/organization/del', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
// 校验path唯一性
export async function checkUnique(params) {
  return request('/api/sys/organization/checkUnique', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
