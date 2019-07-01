import request from '@/utils/request';
import { getNoUndefinedString } from '@/utils/utils';

// 加载采购单编码列表
export async function listPurchasingOrder(params) {
  return request(`/jxc/purchasing/order/list?condition=${getNoUndefinedString(params)}`);
}
// 新增/编辑采购单编码信息
export async function editPurchasingOrder(params) {
  return request('/jxc/purchasing/order/edit', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}
// 获取组织信息
export async function getPurchasingOrder(params) {
  return request(`/jxc/purchasing/order/get/${getNoUndefinedString(params.id)}`);
}
// 根据ID删除组织
export async function deletePurchasingOrder(params) {
  return request('/jxc/purchasing/order/del', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}
