import APIS from '@/apis';
import http from '@/utils/http';

export interface OnlineUserItem {
  id: string | number;
  account?: string;
  device?: string;
  version?: string;
  loginTime?: string;
  issuedAt?: string;
  expireAt?: string;
  token?: string;
}

export interface OnlineUserListResponse {
  data?: OnlineUserItem[];
  total?: number;
  success?: boolean;
}

export const queryOnlineUsers = (params: Record<string, unknown>) =>
  http.list<OnlineUserListResponse>(APIS.ONLINE_LIST, params);
