import APIS from '@/apis';
import http from '@/utils/http';
import { normalizePageData, normalizePageParams } from '../../sys/adapter';

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

export const queryErrorLogs = (params: Record<string, unknown>) => {
  const { pageSize, ...query } = normalizePageParams(params) ?? {};
  return http
    .list<{ data?: unknown; success?: boolean }>(APIS.ERROR_LIST, {
      ...query,
      pageCount: params.pageCount ?? pageSize,
    })
    .then((res): ErrorLogListResponse => {
      const page = normalizePageData<ErrorLogItem>(res.data);
      return { ...res, data: page.list, total: Number(page.total) };
    });
};

export const getErrorLog = (id: string) =>
  http.get<{ data?: ErrorLogItem; success?: boolean }>(APIS.ERROR_GET, id);
