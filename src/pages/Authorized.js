import React from 'react';
import Redirect from 'umi/redirect';
import pathToRegexp from 'path-to-regexp';
import { connect } from 'dva';
import Authorized from '@/utils/Authorized';
import { getAuthority, isLogin } from '@/utils/authority';
import Exception403 from '@/pages/Exception/403';

function AuthComponent({ children, location, routerData }) {
  const logined = isLogin();
  console.info("logined: " + logined);

  const pathName = children.props.location.pathname;
 
  const getRouteAuthority = (path, routeData) => {
    let authorities;
    routeData.forEach(route => {
      // match prefix
      if (pathToRegexp(`${route.path}(.*)`).test(path)) {
        authorities = route.authority || authorities;

        // get children authority recursively
        if (route.routes) {
          authorities = getRouteAuthority(path, route.routes) || authorities;
        }
      }
    });
    return authorities;
  };

  if(logined){
    if ("/user/login" === pathName){
      return <Redirect to="/"/>
    } else {
      return (
        <Authorized
          authority={getRouteAuthority(location.pathname, routerData)}
          noMatch={ <Exception403 /> }
        >
          {children}
        </Authorized>
      )
    }
  } else {
    return <Redirect to="/user/login"/>
  }
}
export default connect(({ menu: menuModel }) => ({
  routerData: menuModel.routerData,
}))(AuthComponent);
