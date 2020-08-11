import { stringify } from 'qs';
import { request } from 'umi';

// 在线用户查询
export async function fetch(params) {
  return request(`/api/monitor/log/online/list?${stringify(params)}`);
}
