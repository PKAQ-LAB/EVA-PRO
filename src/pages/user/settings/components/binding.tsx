import { FormattedMessage, formatMessage } from 'umi';
import { AlipayOutlined, DingdingOutlined, TaobaoOutlined } from '@ant-design/icons';
import { List } from 'antd';
import React, { Component, Fragment } from 'react';

class BindingView extends Component {
  getData = () => [
    {
      title: formatMessage({ id: 'user-setting.binding.taobao' }, {}),
      description: formatMessage({ id: 'user-setting.binding.taobao-description' }, {}),
      actions: [
        <a key="Bind">
          <FormattedMessage id="user-setting.binding.bind" defaultMessage="Bind" />
        </a>,
      ],
      avatar: <TaobaoOutlined className="taobao" />,
    },
    {
      title: formatMessage({ id: 'user-setting.binding.alipay' }, {}),
      description: formatMessage({ id: 'user-setting.binding.alipay-description' }, {}),
      actions: [
        <a key="Bind">
          <FormattedMessage id="user-setting.binding.bind" defaultMessage="Bind" />
        </a>,
      ],
      avatar: <AlipayOutlined className="alipay" />,
    },
    {
      title: formatMessage({ id: 'user-setting.binding.dingding' }, {}),
      description: formatMessage({ id: 'user-setting.binding.dingding-description' }, {}),
      actions: [
        <a key="Bind">
          <FormattedMessage id="user-setting.binding.bind" defaultMessage="Bind" />
        </a>,
      ],
      avatar: <DingdingOutlined className="dingding" />,
    },
  ];

  render() {
    return (
      <Fragment>
        <List
          itemLayout="horizontal"
          dataSource={this.getData()}
          renderItem={item => (
            <List.Item actions={item.actions}>
              <List.Item.Meta
                avatar={item.avatar}
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Fragment>
    );
  }
}

export default BindingView;
