import { request } from '@umijs/max';
import type { API } from './API';

export type LoginParamsType = {
  account: string;
  password: string;
  mobile: string;
  captcha: string;
  type: string;
};

export async function login(params: LoginParamsType) {
  return request<API.LoginStateType>('/api/auth/login', {
    method: 'POST',
    data: params,
  });
}

export async function getFakeCaptcha(mobile: string) {
  return request(`/api/login/captcha?mobile=${mobile}`);
}

export async function outLogin() {
  return request('/api/auth/logout');
}
