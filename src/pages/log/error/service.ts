import APIS from '@/apis';
import http from '@/utils/http';

export interface ErrorLogItem {
  id: string;
  className?: string;
  exDesc?: string;
  ip?: string;
  method?: string;
  params?: string;
  requestTime?: string;
  spendTime?: string | number;
}

export interface ErrorLogListResponse {
  data?: ErrorLogItem[];
  total?: number;
  success?: boolean;
}

export const queryErrorLogs = (params: Record<string, unknown>) =>
  http.list<ErrorLogListResponse>(APIS.ERROR_LIST, params);

export const getErrorLog = (id: string) =>
  http.get<{ data?: ErrorLogItem; success?: boolean }>(APIS.ERROR_GET, id);
