import request from '@src/utils/request';
import { getNoUndefinedString } from '@src/utils/utils';

// 加载分类编码列表
export async function listCategory(params) {
  return request(`/jxc/category/list?condition=${getNoUndefinedString(params)}`);
}
// 校验编码唯一性
export async function checkUnique(params) {
  return request('/jxc/category/checkUnique', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}
// 新增/编辑分类编码信息
export async function editCategory(params) {
  return request('/jxc/category/edit', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}
// 切换状态
export async function switchCategory(params) {
  return request('/jxc/category/switch', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}
// 获取组织信息
export async function getCategory(params) {
  return request(`/jxc/category/get/${getNoUndefinedString(params.id)}`);
}
// 根据ID删除组织
export async function deleteCategory(params) {
  return request('/jxc/category/del', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}
