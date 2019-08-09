import { stringify } from 'qs';
import request from '@/utils/request';
import { getNoUndefinedString } from '@/utils/utils';

// 查询列表
export async function list(params) {
  return request(`/purchasing/list?${stringify(params)}`);
}

// 删除记录
export async function del(params) {
  return request('/purchasing/del', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 校验编码是否唯一
export async function checkCode(params) {
  return request(`/purchasing/checkCode?${stringify(params)}`);
}

// 保存运单信息
export async function edit(params) {
  return request('/purchasing/edit', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 根据id获取运单全部信息
export async function get(params) {
  return request(`/purchasing/get/${getNoUndefinedString(params.id)}`);
}
