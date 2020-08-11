import { Settings as LayoutSettings } from '@ant-design/pro-layout';

export default {
  version: '1.0.0',
  url: 'http://localhost:9016/api/',
  imgUrl: 'http://localhost:9016/img/',
  token_key: 'auth_token',
  user_key: 'user_info',
  subTile: '基于Ant Design Pro的后台管理方案',
  copyright: 'Power by PKAQ © 2019',
  // 自定义属性结束
  navTheme: 'dark',
  // 拂晓蓝
  primaryColor: '#1890ff',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: true,
  fixSiderbar: false,
  colorWeak: false,
  menu: {
    locale: true,
  },
  title: 'EVA Pro',
  pwa: false,
  iconfontUrl: '',
} as LayoutSettings & {
  pwa: boolean;
};
