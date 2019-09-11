import React, { Component } from 'react';
import { Layout, Icon } from 'antd';
import cx from 'classnames';
import style from './style/index.less';

const { Content, Sider } = Layout;

class SideLayout extends Component {
  static defaultProps = {
    prefixCls: 'eva-side-layout',
    width: 300,
  };

  state = {
    openSide: true,
  };

  toggle = e => {
    e.stopPropagation();
    e.preventDefault();

    const { openSide } = this.state;

    this.setState({
      openSide: !openSide,
    });
  };

  render() {
    const { prefixCls, className, children, title, width } = this.props;
    const { openSide } = this.state;
    return (
      <Layout className={cx(prefixCls, className)}>
        <Sider
          trigger={null}
          collapsible
          collapsed={!openSide}
          collapsedWidth={45}
          width={width}
          className={style.layout}
        >
          <div className={style.title}>
            <div>
              <Icon antd type="folder" />
              &nbsp; {title}
            </div>
            <a className="side-handle" onClick={this.toggle} title={openSide ? '收起' : '展开'}>
              <Icon antd type={openSide ? 'caret-left' : 'caret-right'} />
            </a>
          </div>
        </Sider>
        <Content className={style.content}>{children}</Content>
      </Layout>
    );
  }
}

export default SideLayout;
