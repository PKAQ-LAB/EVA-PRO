import type { ProLayoutProps } from '@ant-design/pro-components';

/**
 * @name 项目站点级配置
 * @description title / subTitle / copyright / version 字段会被 Footer 与
 * Login 页消费，方便整站统一品牌信息。
 */
const Settings: ProLayoutProps & {
  logo?: string;
  subTitle?: string;
  copyright?: string;
  version?: string;
} = {
  navTheme: 'light',
  colorPrimary: '#1890ff',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: true,
  fixSiderbar: true,
  title: 'Eva Admin Pro',
  subTitle: 'This is subTitle',
  copyright: 'Power by PKAQ © 2026',
  version: '6.0',
  logo: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
  token: {},
  splitMenus: false,
  siderMenuType: 'sub',
};

export default Settings;
