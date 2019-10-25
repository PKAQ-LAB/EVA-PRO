import { Icon, Tooltip } from 'antd';
import React from 'react';
import { connect } from 'dva';
import screenfull from 'screenfull';
import { formatMessage } from 'umi-plugin-react/locale';
import { ConnectProps, ConnectState } from '@src/models/connect';
import setting from '../../../config/defaultSettings';

import Avatar from './AvatarDropdown';
import SelectLang from '../SelectLang';
import styles from './index.less';

export type SiderTheme = 'light' | 'dark';
export interface GlobalHeaderRightProps extends ConnectProps {
  theme?: SiderTheme;
  layout: 'sidemenu' | 'topmenu';
}

export class GlobalHeaderRight extends React.Component<GlobalHeaderRightProps> {
  state = {
    fullscreen: 0,
  };

  f11 = () => {
    this.setState({
      fullscreen: screenfull.isFullscreen ? 0 : 1,
    });
    screenfull.toggle();
  };

  render() {
    const fullscreenIcon = ['fullscreen', 'fullscreen-exit'];
    const fullscreenText = ['全屏', '退出全屏'];
    const { fullscreen } = this.state;

    const { theme, layout } = this.props;
    let className = styles.right;

    if (theme === 'dark' && layout === 'topmenu') {
      className = `${styles.right}  ${styles.dark}`;
    }

    return (
      <div className={className}>
        {/* 全屏 */}
        <Tooltip title={fullscreenText[fullscreen]}>
          <span className={styles.action} onClick={() => this.f11()}>
            <Icon type={fullscreenIcon[fullscreen]} />
          </span>
        </Tooltip>

        <Tooltip
          title={formatMessage({
            id: 'component.globalHeader.help',
          })}
        >
          <a
            target="_blank"
            href="https://pro.ant.design/docs/getting-started"
            rel="noopener noreferrer"
            className={styles.action}
          >
            <Icon type="question-circle-o" />
          </a>
        </Tooltip>
        <Avatar menu />
        {setting.i18n && <SelectLang className={styles.action} />}
      </div>
    );
  }
}

export default connect(({ settings }: ConnectState) => ({
  theme: settings.navTheme,
  layout: settings.layout,
}))(GlobalHeaderRight);
