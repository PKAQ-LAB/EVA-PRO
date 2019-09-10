import request from '@/utils/request';

export interface LoginParamsType {
  userName: string;
  password: string;
  mobile: string;
  captcha: string;
}

export async function login(params: LoginParamsType) {
  return request('/auth/login', {
    method: 'POST',
    data: params,
  });
}
