import request from '@src/utils/request';

export interface LoginParamsType {
  userName: string;
  password: string;
  mobile: string;
  captcha: string;
}

export async function login(params: LoginParamsType) {
  return request('/api/auth/login', {
    method: 'POST',
    data: params,
  });
}
