import { stringify } from 'qs';
import request from '@src/utils/request';
import { getNoUndefinedString } from '@src/utils/utils';

// 异常日志查询
export async function list(params) {
  return request(`/api/monitor/log/error/list?${stringify(params)}`);
}

// 获取异常日志详情
export async function get(params) {
  return request(`/api/monitor/log/error/get/${getNoUndefinedString(params.id)}`);
}
