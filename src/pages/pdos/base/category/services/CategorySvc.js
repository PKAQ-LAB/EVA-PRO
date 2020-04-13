import request from '@/utils/request';
import { getNoUndefinedString } from '@/utils/utils';

// 加载分类编码列表
export async function listCategory(params) {
  return request(`/api/pdos/base/category/list?condition=${getNoUndefinedString(params)}`);
}
// 校验编码唯一性
export async function checkUnique(params) {
  return request('/api/pdos/base/category/checkUnique', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
// 新增/编辑分类编码信息
export async function editCategory(params) {
  return request('/api/pdos/base/category/edit', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
// 切换状态
export async function switchCategory(params) {
  return request('/api/pdos/base/category/switch', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
// 获取组织信息
export async function getCategory(params) {
  return request(`/api/pdos/base/category/get/${getNoUndefinedString(params.id)}`);
}
// 根据ID删除组织
export async function deleteCategory(params) {
  return request('/api/pdos/base/category/del', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
