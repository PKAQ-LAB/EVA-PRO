import { Tooltip, Tag } from 'antd';
import { QuestionCircleOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
import React from 'react';
import { connect } from 'dva';
import screenfull from 'screenfull';
import { formatMessage } from 'umi-plugin-react/locale';
import { ConnectProps, ConnectState } from '@src/models/connect';
import Avatar from './AvatarDropdown';
import styles from './index.less';

export type SiderTheme = 'light' | 'dark';
export interface GlobalHeaderRightProps extends ConnectProps {
  theme?: SiderTheme;
  layout: 'sidemenu' | 'topmenu';
}

const ENVTagColor = {
  dev: 'orange',
  test: 'green',
  pre: '#87d068',
};
export class GlobalHeaderRight extends React.Component<GlobalHeaderRightProps> {
  state = {
    fullscreen: 0,
  }


  f11 = () => {
    this.setState({
      fullscreen: screenfull.isFullscreen ? 0 : 1,
    });
    screenfull.toggle();
  };

  render() {

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
              { fullscreen? <FullscreenExitOutlined/> : <FullscreenOutlined/> }
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
            <QuestionCircleOutlined />
          </a>

        </Tooltip>
        <Avatar menu />
        {REACT_APP_ENV && <Tag color={ENVTagColor[REACT_APP_ENV]}>{REACT_APP_ENV}</Tag>}
      </div>
    )
  };
}

export default connect(({ settings }: ConnectState) => ({
  theme: settings.navTheme,
  layout: settings.layout,
}))(GlobalHeaderRight);
