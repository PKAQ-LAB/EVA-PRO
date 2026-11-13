import APIS from '@/apis';
import http from '@/utils/http';

export interface OnlineUserItem {
  id: string | number;
  account?: string;
  device?: string;
  version?: string;
  loginTime?: string | number;
  issuedAt?: string | number;
  expireAt?: string | number;
  token?: string;
}

export interface OnlineUserListResponse {
  data?: OnlineUserItem[];
  total?: number;
  success?: boolean;
}

export const queryOnlineUsers = (params: Record<string, unknown>) =>
  http.list<OnlineUserListResponse>(APIS.ONLINE_LIST, params);
