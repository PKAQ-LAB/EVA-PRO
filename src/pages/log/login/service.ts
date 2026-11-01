import APIS from '@/apis';
import http from '@/utils/http';
import { normalizePageData, normalizePageParams } from '../../sys/adapter';
import type { LoginLogItem, LoginLogQuery } from './data.d';

export const queryLoginLogs = (params: LoginLogQuery) =>
  http
    .list<{ success?: boolean; data?: unknown }>(
      APIS.LOGINLOG_LIST,
      normalizePageParams({ ...params }),
    )
    .then((res) => {
      const page = normalizePageData<LoginLogItem>(res.data);
      return { ...res, data: page.list, total: Number(page.total) };
    });

export const getLoginLog = (id: string) =>
  http.get<{ success?: boolean; data?: LoginLogItem }>(APIS.LOGINLOG_GET, id);
