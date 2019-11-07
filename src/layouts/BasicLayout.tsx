import ProLayout, {
  MenuDataItem,
  BasicLayoutProps as ProLayoutProps,
  Settings,
} from '@ant-design/pro-layout';
import React, { useEffect } from 'react';
import Link from 'umi/link';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-react/locale';

// import Authorized from '@src/utils/Authorized';
import RightContent from '@src/components/GlobalHeader/RightContent';
import { ConnectState } from '@src/models/connect';
import logo from '../assets/logo.svg';

export interface BasicLayoutProps extends ProLayoutProps {
  breadcrumbNameMap: {
    [path: string]: MenuDataItem;
  };
  settings: Settings;
  dispatch: Dispatch;
}
export type BasicLayoutContext = { [K in 'location']: BasicLayoutProps[K] } & {
  breadcrumbNameMap: {
    [path: string]: MenuDataItem;
  };
};

/**
 * use Authorized check all menu item
 * 再过滤一次菜单以处理权限
 */
// const menuDataRender = (menuList: MenuDataItem[]): MenuDataItem[] =>
// menuList.map(item => {
//   const localItem = {
//     ...item,
//     children: item.children ? menuDataRender(item.children) : [],
//   };
//   return Authorized.check(item.authority, localItem, null) as MenuDataItem;
// });

const footerRender: BasicLayoutProps['footerRender'] = () => (
  <>
    <div
      style={{
        backgroundColor: '#fff',
        borderTop: '1.5px solid #00abff ',
        padding: '8px',
        textAlign: 'center',
      }}
    >
      Copyright <Icon type="copyright" /> 2019 By PKAQ
    </div>
  </>
);

const BasicLayout: React.FC<BasicLayoutProps> = props => {
  const { dispatch, children, settings, menuData } = props;
  /**
   * constructor
   */

  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'user/fetch',
      });
    }
  }, []);

  /**
   * init variables
   */
  const handleMenuCollapse = (payload: boolean): void => {
    if (dispatch) {
      dispatch({
        type: 'global/changeLayoutCollapsed',
        payload,
      });
    }
  };

  return (
    <ProLayout
      style={{ marginBottom: -24 }}
      logo={logo}
      onCollapse={handleMenuCollapse}
      menuItemRender={(menuItemProps, defaultDom) => {
        if (menuItemProps.isUrl) {
          return defaultDom;
        }
        return <Link to={menuItemProps.path}>{defaultDom}</Link>;
      }}
      breadcrumbRender={(routers = []) => [
        {
          path: '/',
          breadcrumbName: formatMessage({
            id: 'menu.home',
            defaultMessage: 'Home',
          }),
        },
        ...routers,
      ]}
      itemRender={(route, params, routes, paths) => {
        const first = routes.indexOf(route) === 0;
        return first ? (
          <Link to={paths.join('/')}>{route.breadcrumbName}</Link>
        ) : (
          <span>{route.breadcrumbName}</span>
        );
      }}
      footerRender={footerRender}
      menuDataRender={() => menuData}
      formatMessage={formatMessage}
      rightContentRender={rightProps => <RightContent {...rightProps} />}
      {...props}
      {...settings}
    >
      {children}
    </ProLayout>
  );
};

export default connect(({ global, settings, menu }: ConnectState) => ({
  collapsed: global.collapsed,
  settings,
  menuData: menu.menuData,
}))(BasicLayout);
