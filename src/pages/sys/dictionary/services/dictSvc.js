import request from '@src/utils/request';
import { getNoUndefinedString } from '@src/utils/utils';

// 查询字典列表
export async function listDict() {
  return request('/api/sys/dictionary/list');
}

// 新增/编辑字典
export async function editDict(params) {
  return request('/api/sys/dictionary/edit', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 查询字典分类
export async function getDict(params) {
  return request(`/api/sys/dictionary/get/${getNoUndefinedString(params.id)}`);
}

// 删除字典
export async function deleteDict(params) {
  return request(`/api/sys/dictionary/del/${getNoUndefinedString(params.id)}`);
}
