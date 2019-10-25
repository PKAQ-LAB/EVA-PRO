import { stringify } from 'qs';
import request from '@src/utils/request';
import { getNoUndefinedString } from '@src/utils/utils';

// 业务日志查询
export async function list(params) {
  return request(`/api/monitor/log/biz/list?${stringify(params)}`);
}

// 获取业务日志详情
export async function get(params) {
  return request(`/api/monitor/log/biz/get/${getNoUndefinedString(params.id)}`);
}
