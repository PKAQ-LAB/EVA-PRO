/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
/* eslint-disable array-callback-return */
import React, { Suspense } from 'react';
import { Layout, Tabs, Menu, Dropdown, Icon } from 'antd';
import router from 'umi/router';
import { Route } from 'react-router-dom';
import Authorized from '@/utils/Authorized';
import DocumentTitle from 'react-document-title';
import { ContainerQuery } from 'react-container-query';
import pathToRegexp from 'path-to-regexp';
import classNames from 'classnames';
import logo from '../assets/logo.svg';
import Footer from './Footer';
import Header from './Header';
import Context from './MenuContext';
import { connect } from 'dva';
import SiderMenu from '@/components/SiderMenu';
import getPageTitle from '@/utils/getPageTitle';
import styles from './BasicLayout.less';
import Exception404 from '@/pages/404';

// lazy load SettingDrawer
const SettingDrawer = React.lazy(() => import('@/components/SettingDrawer'));

const { Content } = Layout;
const { TabPane } = Tabs;

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
  breadcrumbNameMap: menu.breadcrumbNameMap,
  layout: setting.layout,
  ...setting,
}))
export default class BasicLayout extends React.Component {
  constructor(props) {
    super(props);
    const { routes } = props.route;
    const { location } = this.props;

    // routeKey 为设置首页设置 试试 '/dashboard/analysis' 或其他key值
    const routeKey = location.pathname === '/' ? '/sys/organization' : location.pathname;
    const tabLists = this.updateTree(routes);
    const tabList = [];
    let isTab = true;
    tabLists.map(v => {
      if (v.key === routeKey) {
        if (!v.istab) {
          isTab = false;
          return;
        }
        if (tabList.length === 0) {
          v.closable = false;
          tabList.push(v);
        }
      }
    });
    this.state = {
      tabList,
      tabListKey: [routeKey],
      activeKey: routeKey,
      routeKey,
      isTab,
    };
  }

  componentDidMount() {
    const {
      route: { routes, path, authority },
    } = this.props;

    // 加载菜单
    this.props.dispatch({
      type: 'menu/loadMenuData',
      payload: { routes, authority },
    });
    // 加载配置
    this.props.dispatch({
      type: 'setting/getSetting',
      payload: { routes, path, authority },
    });
  }

  getContext() {
    const { location, breadcrumbNameMap } = this.props;
    return {
      location,
      breadcrumbNameMap,
    };
  }

  updateTree = data => {
    const treeData = data;
    const treeList = [];
    // 递归获取树列表
    const getTreeList = data => {
      data.forEach(node => {
        if (!node.level) {
          treeList.push({
            tab: node.tabname,
            key: node.path,
            locale: node.locale,
            closable: true,
            content: node.component,
            istab: node.istab === false ? node.istab : true,
          });
        }
        if (node.routes && node.routes.length > 0) {
          // !node.hideChildrenInMenu &&
          getTreeList(node.routes);
        }
      });
    };
    getTreeList(treeData);
    return treeList;
  };

  getLayoutStyle = () => {
    const { fixSiderbar, isMobile, collapsed, layout } = this.props;
    if (fixSiderbar && layout !== 'topmenu' && !isMobile) {
      return {
        paddingLeft: collapsed ? '80px' : '220px',
      };
    }
    return null;
  };

  handleMenuCollapse = collapsed => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: collapsed,
    });
  };

  renderSettingDrawer = () => {
    if (
      process.env.NODE_ENV === 'production' &&
      ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION !== 'site'
    ) {
      return null;
    }
    return <SettingDrawer />;
  };

  getRouterAuthority = (pathname, routeData) => {
    let routeAuthority = ['noAuthority'];
    const getAuthority = (key, routes) => {
      routes.map(route => {
        if (route.path && pathToRegexp(route.path).test(key)) {
          routeAuthority = route.authority;
        } else if (route.routes) {
          routeAuthority = getAuthority(key, route.routes);
        }
        return route;
      });
      return routeAuthority;
    };
    return getAuthority(pathname, routeData);
  };

  // 点击左侧菜单
  onHandlePage = e => {
    const { routes } = this.props.route;
    const { key } = e;
    const tabLists = this.updateTree(routes);
    const { tabListKey, tabList } = this.state;
    if (key === 'logout') {
      // 退出登录
      this.props.dispatch({
        type: 'login/logout',
      });
    } else {
      router.push(key);
      this.setState({
        activeKey: key,
      });
      tabLists.map(v => {
        if (v.key === key && v.content) {
          if (!v.istab) {
            this.setState({
              isTab: false,
            });
            return;
          }
          this.setState({
            isTab: true,
          });
          if (tabList.length === 0) {
            v.closable = false;
            this.setState({
              tabList: [...tabList, v],
            });
          } else if (!tabListKey.includes(v.key)) {
            this.setState({
              tabList: [...tabList, v],
              tabListKey: [...tabListKey, v.key],
            });
          }
        }
      });
    }
  };

  // 切换 tab页 router.push(key);
  onChange = key => {
    this.setState({ activeKey: key });
    router.push(key);
  };

  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };

  remove = targetKey => {
    let { activeKey } = this.state;
    let lastIndex;
    this.state.tabList.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const tabList = [];
    const tabListKey = [];
    this.state.tabList.map(pane => {
      if (pane.key !== targetKey) {
        tabList.push(pane);
        tabListKey.push(pane.key);
      }
    });
    if (lastIndex >= 0 && activeKey === targetKey) {
      activeKey = tabList[lastIndex].key;
    }
    router.push(activeKey);
    this.setState({
      tabList,
      activeKey,
      tabListKey,
    });
  };

  // 菜单点击事件
  onClickHover = e => {
    const { key } = e;
    const { activeKey, routeKey } = this.state;
    let { tabList, tabListKey } = this.state;

    if (key === '1') {
      tabList = tabList.filter(v => v.key !== activeKey || v.key === routeKey);
      tabListKey = tabListKey.filter(v => v !== activeKey || v === routeKey);
      this.setState({
        activeKey: routeKey,
        tabList,
        tabListKey,
      });
    } else if (key === '2') {
      tabList = tabList.filter(v => v.key === activeKey || v.key === routeKey);
      tabListKey = tabListKey.filter(v => v === activeKey || v === routeKey);
      this.setState({
        activeKey,
        tabList,
        tabListKey,
      });
    } else if (key === '3') {
      tabList = tabList.filter(v => v.key === routeKey);
      tabListKey = tabListKey.filter(v => v === routeKey);
      this.setState({
        activeKey: routeKey,
        tabList,
        tabListKey,
      });
    }
  };

  render() {
    const {
      navTheme,
      layout: PropsLayout,
      children,
      location: { pathname },
      menuData,
      breadcrumbNameMap,
      route: { routes },
      fixedHeader,
      hidenAntTabs,
    } = this.props;
    const { activeKey, isTab } = this.state;
    let pathName = pathname;
    if (pathname !== activeKey) {
      pathName = activeKey;
    }

    const isTop = PropsLayout === 'topmenu';
    const contentStyle = !fixedHeader ? { paddingTop: 0 } : {};
    const routerConfig = this.getRouterAuthority(pathName, routes);
    this.props.location.onHandlePage = this.onHandlePage;
    const menu = (
      <Menu onClick={this.onClickHover}>
        <Menu.Item key="1">关闭当前标签页</Menu.Item>
        <Menu.Item key="2">关闭其他标签页</Menu.Item>
        <Menu.Item key="3">关闭全部标签页</Menu.Item>
      </Menu>
    );
    const operations = (
      <Dropdown overlay={menu}>
        <a className="ant-dropdown-link" href="#">
          操作
          <Icon type="down" />
        </a>
      </Dropdown>
    );
    const layout = (
      <Layout>
        {isTop ? null : (
          <SiderMenu
            logo={logo}
            theme={navTheme}
            onCollapse={this.handleMenuCollapse}
            menuData={menuData}
            {...this.props}
            onHandlePage={this.onHandlePage}
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
            onMenuClick={this.onHandlePage}
          />
          <Content className={styles.content} style={contentStyle}>
            {hidenAntTabs || !isTab ? (
              <Authorized authority={routerConfig} noMatch={<Exception404 />}>
                {children}
              </Authorized>
            ) : this.state.tabList && this.state.tabList.length ? (
              <Tabs
                activeKey={activeKey}
                onChange={this.onChange}
                tabBarExtraContent={operations}
                tabBarStyle={{
                  background: '#fff',
                  marginBottom: '0',
                  paddingBottom: '1px',
                  borderBottom: '1.5px solid #1890ff',
                }}
                tabPosition="top"
                tabBarGutter={-1}
                hideAdd
                type="editable-card"
                onEdit={this.onEdit}
              >
                {this.state.tabList.map(item => (
                  <TabPane tab={item.tab} key={item.key} closable={item.closable}>
                    <Authorized authority={routerConfig} noMatch={<Exception404 />}>
                      <Route
                        key={item.key}
                        path={item.path}
                        component={item.content}
                        exact={item.exact}
                      />
                    </Authorized>
                  </TabPane>
                ))}
              </Tabs>
            ) : null}
          </Content>
          <Footer />
        </Layout>
      </Layout>
    );
    return (
      <React.Fragment>
        <DocumentTitle title={getPageTitle(pathname, breadcrumbNameMap)}>
          <ContainerQuery query={query}>
            {params => (
              <Context.Provider value={this.getContext()}>
                <div className={classNames(params)}>{layout}</div>
              </Context.Provider>
            )}
          </ContainerQuery>
        </DocumentTitle>
        <Suspense fallback={null}>{this.renderSettingDrawer()}</Suspense>
      </React.Fragment>
    );
  }
}
