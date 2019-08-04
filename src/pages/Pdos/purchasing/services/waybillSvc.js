import { stringify } from 'qs';
import request from '@/utils/request';

// 查询列表
export async function list(params) {
  return request(`/business/waybillLine/list?${stringify(params)}`);
}
