import { DefaultFooter, MenuDataItem } from '@ant-design/pro-layout';
import DocumentTitle from 'react-document-title';
import Link from 'umi/link';
import React from 'react';
import { connect } from 'dva';

import SelectLang from '@src/components/SelectLang';
import { ConnectProps, ConnectState } from '@src/models/connect';
import setting from '../../config/defaultSettings';

import logo from '../assets/logo.svg';
import styles from './UserLayout.less';

export interface UserLayoutProps extends ConnectProps {
  breadcrumbNameMap: { [path: string]: MenuDataItem };
}

const UserLayout: React.SFC<UserLayoutProps> = props => {
  const { children } = props;

  return (
    <DocumentTitle title={setting.title}>
      <div className={styles.container}>
        <div className={styles.lang}>
          <SelectLang />
        </div>
        <div className={styles.content}>
          <div className={styles.top}>
            <div className={styles.header}>
              <Link to="/">
                <img alt="logo" className={styles.logo} src={logo} />
                <span className={styles.title}>{setting.title}</span>
              </Link>
            </div>
            <div className={styles.desc}>{setting.subTile}</div>
          </div>
          {children}
        </div>
        <DefaultFooter links={[]} copyright={setting.copyright} />
      </div>
    </DocumentTitle>
  );
};

export default connect(({ settings }: ConnectState) => ({
  ...settings,
}))(UserLayout);
