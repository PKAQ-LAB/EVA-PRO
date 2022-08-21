import { FormattedMessage, formatMessage } from 'umi';
import React, { Component, Fragment } from 'react';

import { List } from 'antd';

type Unpacked<T> = T extends (infer U)[] ? U : T;

const passwordStrength = {
  strong: (
    <span className="strong">
      <FormattedMessage id="user-setting.security.strong" defaultMessage="Strong" />
    </span>
  ),
  medium: (
    <span className="medium">
      <FormattedMessage id="user-setting.security.medium" defaultMessage="Medium" />
    </span>
  ),
  weak: (
    <span className="weak">
      <FormattedMessage id="user-setting.security.weak" defaultMessage="Weak" />
      Weak
    </span>
  ),
};

export default class SecurityView extends Component {

  // 重置密码
  handleResetPwd = () =>{

    const { dispatch } = this.props;

    dispatch({
      type: 'global/updateState',
      payload: {
        repwd: true
      },
    });
  }

  getData = () => [
    {
      title: formatMessage({ id: 'user-setting.security.password' }, {}),
      description: (
        <Fragment>
          {formatMessage({ id: 'user-setting.security.password-description' })}：
          {passwordStrength.strong}
        </Fragment>
      ),
      actions: [
        <a key="Modify" onClick={()=> this.handleResetPwd()}>
          <FormattedMessage id="user-setting.security.modify" defaultMessage="Modify" />
        </a>,
      ],
    },
    {
      title: formatMessage({ id: 'user-setting.security.phone' }, {}),
      description: `${formatMessage(
        { id: 'user-setting.security.phone-description' },
        {},
      )}：138****8293`,
      actions: [
        <a key="Modify">
          <FormattedMessage id="user-setting.security.modify" defaultMessage="Modify" />
        </a>,
      ],
    },
    {
      title: formatMessage({ id: 'user-setting.security.question' }, {}),
      description: formatMessage({ id: 'user-setting.security.question-description' }, {}),
      actions: [
        <a key="Set">
          <FormattedMessage id="user-setting.security.set" defaultMessage="Set" />
        </a>,
      ],
    },
    {
      title: formatMessage({ id: 'user-setting.security.email' }, {}),
      description: `${formatMessage(
        { id: 'user-setting.security.email-description' },
        {},
      )}：ant***sign.com`,
      actions: [
        <a key="Modify">
          <FormattedMessage id="user-setting.security.modify" defaultMessage="Modify" />
        </a>,
      ],
    },
    {
      title: formatMessage({ id: 'user-setting.security.mfa' }, {}),
      description: formatMessage({ id: 'user-setting.security.mfa-description' }, {}),
      actions: [
        <a key="bind">
          <FormattedMessage id="user-setting.security.bind" defaultMessage="Bind" />
        </a>,
      ],
    },
  ];

  render() {
    const data = this.getData();
    return (
      <Fragment>
        <List<Unpacked<typeof data>>
          itemLayout="horizontal"
          dataSource={data}
          renderItem={item => (
            <List.Item actions={item.actions}>
              <List.Item.Meta title={item.title} description={item.description} />
            </List.Item>
          )}
        />
      </Fragment>
    );
  }
}
