import React, { Suspense } from 'react';
import { Layout } from 'antd';
import DocumentTitle from 'react-document-title';
import isEqual from 'lodash/isEqual';
import memoizeOne from 'memoize-one';
import { connect } from 'dva';
import { ContainerQuery } from 'react-container-query';
import classNames from 'classnames';
import pathToRegexp from 'path-to-regexp';
import { formatMessage } from 'umi/locale';
import Authorized from '@/utils/Authorized';
import logo from '../assets/logo.svg';
import Footer from './Footer';
import Header from './Header';
import Context from './MenuContext';
import Exception403 from '../pages/Exception/403';
import * as AppInfo from '@/common/config/AppInfo';
import PageLoading from '@/components/PageLoading';
import SiderMenu from '@/components/SiderMenu';

// lazy load SettingDrawer
const SettingDrawer = React.lazy(() => import('@/components/SettingDrawer'));

const { Content } = Layout;

const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
    maxWidth: 1599,
  },
  'screen-xxl': {
    minWidth: 1600,
  },
};
@connect(({ global, setting, menu }) => ({
  collapsed: global.collapsed,
  menuData: menu.menuData,
  layout: setting.layout,
  ...setting,
}))
export default class BasicLayout extends React.PureComponent {
  constructor(props) {
    super(props);
    this.getPageTitle = memoizeOne(this.getPageTitle);
    this.getBreadcrumbNameMap = memoizeOne(this.getBreadcrumbNameMap, isEqual);
    this.breadcrumbNameMap = this.getBreadcrumbNameMap();
    this.matchParamsPath = memoizeOne(this.matchParamsPath, isEqual);
  }

  componentDidMount() {
    const {
      dispatch,
      route: { routes, authority },
    } = this.props;

    const USER_KEY = "eva_user";
    const user = JSON.parse(localStorage.getItem(USER_KEY));
    dispatch({
      type: 'account/fetchCurrent',
      payload: {
        id: user.id,
      }
    });
    dispatch({
      type: 'setting/getSetting',
    });
    dispatch({
      type: 'menu/getMenuData',
      payload: { routes, authority },
    });
  }

  componentDidUpdate(preProps) {
    // After changing to phone mode,
    // if collapsed is true, you need to click twice to display
    this.breadcrumbNameMap = this.getBreadcrumbNameMap();
    const { collapsed } = this.props;
    if (!collapsed) {
      this.handleMenuCollapse(false);
    }
  }

  getContext() {
    const { location } = this.props;
    return {
      location,
      breadcrumbNameMap: this.breadcrumbNameMap,
    };
  }

  /**
   * 获取面包屑映射
   * @param {Object} menuData 菜单配置
   */
  getBreadcrumbNameMap() {
    const routerMap = {};
    const { menuData } = this.props;
    const flattenMenuData = data => {
      data.forEach(menuItem => {
        if (menuItem.children) {
          flattenMenuData(menuItem.children);
        }
        // Reduce memory usage
        routerMap[menuItem.path] = menuItem;
      });
    };
    flattenMenuData(menuData);
    return routerMap;
  }

  matchParamsPath = pathname => {
    const pathKey = Object.keys(this.breadcrumbNameMap).find(key =>
      pathToRegexp(key).test(pathname)
    );
    return this.breadcrumbNameMap[pathKey];
  };

  getPageTitle = pathname => {
    const currRouterData = this.matchParamsPath(pathname);

    if (!currRouterData) {
      return AppInfo.title;
    }
    const pageName = formatMessage({
      id: currRouterData.locale || currRouterData.name,
      defaultMessage: currRouterData.name,
    });
    return `${pageName} -${AppInfo.title}`;
  };

  getLayoutStyle = () => {
    const { fixSiderbar, collapsed, layout } = this.props;
    if (fixSiderbar && layout !== 'topmenu') {
      return {
        paddingLeft: collapsed ? '80px' : '256px',
      };
    }
    return null;
  };

  getContentStyle = () => {
    const { fixedHeader } = this.props;
    return {
      margin: '24px 24px 0',
      paddingTop: fixedHeader ? 64 : 0,
    };
  };

  handleMenuCollapse = collapsed => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: collapsed,
    });
  };

  renderSettingDrawer = () => {
    // Do not render SettingDrawer in production
    // unless it is deployed in preview.pro.ant.design as demo
    if (process.env.NODE_ENV === 'production' && APP_TYPE !== 'site') {
      return null;
    }
    return <SettingDrawer />;
  };

  render() {
    const {
      navTheme,
      layout: PropsLayout,
      children,
      location: { pathname },
      menuData,
    } = this.props;
    
    const isTop = PropsLayout === 'topmenu';
    const routerConfig = this.matchParamsPath(pathname);
    const layout = (
      <Layout>
        {isTop ? null : (
          <SiderMenu
            logo={logo}
            theme={navTheme}
            onCollapse={this.handleMenuCollapse}
            menuData={menuData}
            {...this.props}
          />
        )}
        <Layout
          style={{
            ...this.getLayoutStyle(),
            minHeight: '100vh',
          }}
        >
          <Header
            menuData={menuData}
            handleMenuCollapse={this.handleMenuCollapse}
            logo={logo}
            {...this.props}
          />
          <Content style={this.getContentStyle()}>
            <Authorized
              authority={routerConfig && routerConfig.authority}
              noMatch={<Exception403 />}
            >
              {children}
            </Authorized>
          </Content>
          <Footer />
        </Layout>
      </Layout>
    );
    return (
      <React.Fragment>
        <DocumentTitle title={this.getPageTitle(pathname)}>
          <ContainerQuery query={query}>
            {params => (
              <Context.Provider value={this.getContext()}>
                <div className={classNames(params)}>{layout}</div>
              </Context.Provider>
            )}
          </ContainerQuery>
        </DocumentTitle>
        <Suspense fallback={<PageLoading />}>{this.renderSettingDrawer()}</Suspense>
      </React.Fragment>
    );
  }
}
