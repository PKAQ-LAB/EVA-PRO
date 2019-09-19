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
    const {
      prefixCls,
      className,
      children,
      title,
      width,
      layoutStyle,
      body,
      bodyStyle,
    } = this.props;
    const { openSide } = this.state;
    return (
      <Layout className={cx(prefixCls, className)} style={layoutStyle}>
        <Sider
          trigger={null}
          collapsible
          collapsed={!openSide}
          collapsedWidth={45}
          width={width}
          className={style.layout}
        >
          {/* 表头 */}
          <div className={style.title}>
            <div>
              <Icon type="folder" />
              &nbsp; {title}
            </div>
            <a className="side-handle" onClick={this.toggle} title={openSide ? '收起' : '展开'}>
              <Icon type={openSide ? 'caret-left' : 'caret-right'} />
            </a>
          </div>
          {/* 内容 */}
          {openSide && (
            <div className={style.body} style={bodyStyle}>
              {body}
            </div>
          )}
        </Sider>
        <Content className={style.content}>{children}</Content>
      </Layout>
    );
  }
}

export default SideLayout;
