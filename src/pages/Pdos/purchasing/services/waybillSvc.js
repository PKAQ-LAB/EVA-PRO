import { stringify } from 'qs';
import request from '@/utils/request';
import { getNoUndefinedString } from '@/utils/utils';

// 查询列表
export async function list(params) {
  return request(`/business/waybillLine/list?${stringify(params)}`);
}

// 删除记录
export async function delWaybill(params) {
  return request('/business/waybillLine/del', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 批量结束
export async function gameOver(params) {
  return request('/business/waybillLine/gameover', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 根据运单号和企业id获取当前运单信息
export async function checkByWillnum(params) {
  return request(`/business/waybill/checkByWillnum?${stringify(params)}`);
}

// 看看是不是黑名单
export async function isBlackCar(params) {
  return request(`/business/blacklist/isBlackCar?${stringify(params)}`);
}

// 保存运单信息
export async function saveWaybill(params) {
  return request('/business/waybill/edit', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 根据id获取运单全部信息
export async function getWaybill(params) {
  return request(`/business/waybill/get/${getNoUndefinedString(params.id)}`);
}
