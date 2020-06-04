import { Settings as ProSettings } from '@ant-design/pro-layout';

type DefaultSettings = ProSettings & {
  /**是否开启国际化**/
  i18n: boolean;
  /**当前版本**/
  version: string;
  /** 后台请求地址 **/
  url: string;
  /** 图片地址 **/
  imgUrl: string;
  /** token_key **/
  token_key: string;
  /** user_key **/
  user_key: string;
  subTile: string;
  copyright: string;
  pwa: boolean;
};

const proSettings: DefaultSettings = {
  i18n: false,
  version: '1.0.0',
  url: 'http://localhost:9016/api/',
  imgUrl: 'http://localhost:9016/img/',
  token_key: 'auth_token',
  user_key: 'user_info',
  navTheme: 'dark',
  // 拂晓蓝
  primaryColor: '#1890ff',
  layout: 'sidemenu',
  contentWidth: 'Fluid',
  fixedHeader: true,
  fixSiderbar: false,
  colorWeak: false,
  menu: {
    locale: true,
  },
  title: 'EVA Pro',
  subTile: '基于Ant Design Pro的后台管理方案',
  copyright: 'Power by PKAQ © 2019',
  pwa: false,
  iconfontUrl: '',
};

export type { DefaultSettings };

export default proSettings;
