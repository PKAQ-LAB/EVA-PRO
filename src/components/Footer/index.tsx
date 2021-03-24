import { DefaultFooter } from '@ant-design/pro-layout';
import setting from '@config/defaultSettings';

export default () => (
  <DefaultFooter
    copyright={setting.copyright}
    links={[]}
  />
);
