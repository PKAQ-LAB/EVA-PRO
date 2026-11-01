/** 对应现有 LoginLogVo；Long 沿服务端序列化约定保留字符串。 */
export interface LoginLogItem {
  id: string;
  tenantId?: string;
  userId?: string;
  account?: string;
  loginType?: string;
  success?: boolean;
  failReason?: string;
  ip?: string;
  userAgent?: string;
  device?: string;
  version?: string;
  sessionId?: string;
  deviceType?: string;
  deviceModel?: string;
  osName?: string;
  osVersion?: string;
  browserName?: string;
  browserVersion?: string;
  deviceFingerprint?: string;
  riskFlags?: string;
  lastActiveAt?: string;
  logoutAt?: string;
  logoutReason?: string;
  utcCreate?: string;
}

export interface LoginLogQuery {
  account?: string;
  success?: boolean;
  begin?: string;
  end?: string;
  current?: number;
  pageSize?: number;
}
