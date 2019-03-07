import React from 'react';
import Redirect from 'umi/redirect';
import pathToRegexp from 'path-to-regexp';
import { connect } from 'dva';
import Authorized from '@/utils/Authorized';
import { getAuthority, isLogin } from '@/utils/authority';

function AuthComponent({ children, location, routerData, status }) {
  const logined = isLogin();
  const pathName = children.props.location.pathname;
  const getRouteAuthority = (pathname, routeData) => {
    const routes = routeData.slice(); // clone

    const getAuthority = (routeDatas, path) => {
      let authorities;
      routeDatas.forEach(route => {
        // check partial route
        if (pathToRegexp(`${route.path}(.*)`).test(path)) {
          if (route.authority) {
            authorities = route.authority;
          }
          // is exact route?
          if (!pathToRegexp(route.path).test(path) && route.routes) {
            authorities = getAuthority(route.routes, path);
          }
        }
      });
      return authorities;
    };

    return getAuthority(routes, pathname);
  };

  if(logined){
    if ("/user/login" === pathName){
      return <Redirect to="/"/>
    } else {
      return (
        <Authorized
          authority={getRouteAuthority(location.pathname, routerData)}
          noMatch={ <Redirect to="/exception/403" /> }
        >
          {children}
        </Authorized>
      )
    }
  } else {
    return <Redirect to="/user/login"/>
  }
}
export default connect(({ menu: menuModel, login: loginModel }) => ({
  routerData: menuModel.routerData,
  status: loginModel.status,
}))(AuthComponent);
