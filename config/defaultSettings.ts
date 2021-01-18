import { Settings as LayoutSettings } from '@ant-design/pro-layout';

const Settings: LayoutSettings & {
  pwa?: boolean;
  logo?: string;
  version?: string;
  url?: string;
  imgUrl?: string;
  access_token?: string;
  refresh_token?: string;
  user_key?: string;
  subTitle?: string;
  copyright?: string;
} = {
  version: '1.0.0',
  url: 'http://localhost:9016/api/',
  imgUrl: 'http://localhost:9016/img/',
  access_token: 'tk_alpha',
  refresh_token: 'tk_bravo',
  user_key: 'user_info',
  subTitle: '基于Ant Design Pro的后台管理方案',
  copyright: 'Power by PKAQ © 2019',
  // 自定义属性结束
  navTheme: 'dark',
  // 拂晓蓝
  primaryColor: '#1890ff',
  layout: 'side',
  contentWidth: 'Fluid',
  fixedHeader: true,
  fixSiderbar: true,
  colorWeak: false,
  title: 'EVA Pro',
  pwa: false,
  logo: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
  iconfontUrl: '',
};

export default Settings;
