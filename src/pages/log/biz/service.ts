import APIS from '@/apis';
import http from '@/utils/http';

export interface BizLogItem {
  id: string;
  operateDatetime?: string;
  operateType?: string;
  operator?: string;
  description?: string;
}

export interface BizLogListResponse {
  data?: BizLogItem[];
  total?: number;
  success?: boolean;
}

export const queryBizLogs = (params: Record<string, unknown>) =>
  http.list<BizLogListResponse>(APIS.BIZLOG_LIST, params);

export const getBizLog = (id: string) =>
  http.get<{ data?: BizLogItem; success?: boolean }>(APIS.BIZLOG_GET, id);
