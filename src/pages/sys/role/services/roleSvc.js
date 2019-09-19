import request from '@/utils/request';
import { getNoUndefinedString } from '@/utils/utils';
// 加载组织列表
export async function listModule(params) {
  return request(`/api/module/listNoPage/?name=${getNoUndefinedString(params)}`);
}
