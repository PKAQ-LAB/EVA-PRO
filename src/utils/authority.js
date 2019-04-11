// import Cookies from 'universal-cookie';

// const cookies = new Cookies();

// use localStorage to store the authority info, which might be sent from server in actual project.
export function getAuthority(str) {
  // return localStorage.getItem('antd-pro-authority') || ['admin', 'user'];
  const authorityString = str;
  // typeof str === 'undefined' ? localStorage.getItem('antd-pro-authority') : str;
  // authorityString could be admin, "admin", ["admin"]
  let authority;
  try {
    authority = JSON.parse(authorityString);
  } catch (e) {
    authority = authorityString;
  }
  if (typeof authority === 'string') {
    return [authority];
  }
  if (!authority && APP_TYPE === 'site') {
    return ['admin'];
  }
  return authority;
}
/**
 * 持久化token
 * @returns {boolean}
 */
export function isLogin() {
  // const eva_token = cookies.get('eva_token');
  const evaToken = localStorage.getItem('eva_token');

  return evaToken && evaToken !== '';
}

export function setAuthority(authority) {
  const proAuthority = typeof authority === 'string' ? [authority] : authority;
  return localStorage.setItem('antd-pro-authority', JSON.stringify(proAuthority));
}
