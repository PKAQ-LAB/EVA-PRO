import { stringify } from 'qs';
import request from '@src/utils/request';
import { getNoUndefinedString } from '@src/utils/utils';

// 获取表单的数据
export async function list(params) {
  return request(`/base/project/list/${stringify(params)}`);
}
// 根据name获取主表信息
export async function getMain(params) {
  return request(`/base/category/getMain/${getNoUndefinedString(params.name)}`);
}
// 根据name获取主表信息
export async function getSub(params) {
  return request(`/base/category/getSub/${getNoUndefinedString(params.name)}`);
}
