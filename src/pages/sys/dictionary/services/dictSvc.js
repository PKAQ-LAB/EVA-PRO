import request from '@/utils/request';

// 查询字典列表
export async function listDict() {
  return request('/api/dict/list');
}
