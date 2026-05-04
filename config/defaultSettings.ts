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
  // 拂晓蓝
  colorPrimary: '#1890ff',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: 'Eva Admin Pro',
  subTitle: 'This is subTitle',
  copyright: `Power by PKAQ © ${new Date().getFullYear()}`,
  version: '6.0',
  pwa: true,
  logo: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
  iconfontUrl: '',
  token: {
    // 参见ts声明，demo 见文档，通过token 修改样式
    //https://procomponents.ant.design/components/layout#%E9%80%9A%E8%BF%87-token-%E4%BF%AE%E6%94%B9%E6%A0%B7%E5%BC%8F
  },
};

export default Settings;
