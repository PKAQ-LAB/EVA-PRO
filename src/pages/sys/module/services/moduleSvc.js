import request from '@src/utils/request';
import { getNoUndefinedString } from '@src/utils/utils';
// 获取组织信息
export async function getModule(params) {
  return request(`/api/sys/module/get/${getNoUndefinedString(params.id)}`);
}
// 加载组织列表
export async function listModule(params) {
  return request(`/api/sys/module/listNoPage/?name=${getNoUndefinedString(params)}`);
}
// 新增/编辑组织信息
export async function editModule(params) {
  return request('/api/sys/module/edit', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
// 排序组织信息
export async function sortModule(params) {
  return request('/api/sys/module/sort', {
    method: 'POST',
    data: params,
  });
}
// 根据ID删除组织
export async function deleteModule(params) {
  return request('/api/sys/module/del', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
// 校验path唯一性
export async function checkUnique(params) {
  return request('/api/sys/module/checkUnique', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
