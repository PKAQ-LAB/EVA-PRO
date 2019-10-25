import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Tree, Row, Col, Card, Form, Input, Icon, Button, message, Popconfirm } from 'antd';
import List from './List';
import Detail from './AOEForm';
import Page from '@src/components/Page';
import PageHeaderWrapper from '@src/components/PageHeaderWrapper';
import styles from './Index.less';

const FormItem = Form.Item;
const { TreeNode } = { ...Tree };

// 连接组件和store
// 把state.goods定给组件的goods
@connect(state => ({
  goods: state.goods,
  categorys: state.category,
}))
@Form.create()
export default class Index extends PureComponent {
  // 组件加载完成后加载数据
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'category/list',
    });
  }
  // 树节点选择
  onSelect = selectedKeys => {
    const { dispatch } = this.props;
    const values = {
      category: '0' === selectedKeys[0] ? null : selectedKeys[0],
    };
    dispatch({
      type: 'goods/fetch',
      payload: values,
    });
  };
  // 重置事件
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    dispatch({
      type: 'goods/fetch',
      payload: {},
    });
  };
  // 删除事件
  handleRemoveClick = () => {
    const {
      dispatch,
      goods: { selectedRowKeys },
    } = this.props;
    if (!selectedRowKeys) return;

    dispatch({
      type: 'goods/remove',
      payload: {
        key: selectedRowKeys,
      },
      callback: () => {
        dispatch({
          type: 'goods/updateState',
          payload: { selectedRowKeys: [] },
        });
      },
    });
  };
  // 搜索事件
  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;
    // 表单验证
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };

      dispatch({
        type: 'goods/fetch',
        payload: values,
      });
    });
  };
  // 新增窗口
  handleModalVisible = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'goods/updateState',
      payload: {
        modalType: 'create',
        currentItem: {},
      },
    });
  };
  // 渲染树节点
  renderTreeNodes(data) {
    return data.map(item => {
      if (item.children) {
        return (
          <TreeNode title={item.name} key={item.id} value={item.id}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode title={item.name} key={item.id} value={item.id} />;
    });
  }
  // 左侧树
  renderCategoryTree() {
    const { data } = this.props.categorys;
    return (
      <Card
        type="inner"
        className={styles.leftTree}
        title={
          <div>
            <Icon type="tags" />
            &nbsp;选择商品分类
          </div>
        }
        extra={
          <Button type="primary" size="small" onClick={() => this.handleFormReset()}>
            全部
          </Button>
        }
      >
        <Tree showLine onSelect={this.onSelect}>
          {this.renderTreeNodes(data)}
        </Tree>
      </Card>
    );
  }

  // 简单搜索条件
  renderSimpleForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="商品名称">
              {getFieldDecorator('name')(<Input placeholder="商品名称" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="条码">
              {getFieldDecorator('barcode')(<Input placeholder="商品条形码" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                重置
              </Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  // 渲染界面
  render() {
    const { dispatch } = this.props;
    const { data, selectedRowKeys, modalType, currentItem } = this.props.goods;

    const listPops = {
      dispatch,
      data,
      selectedRowKeys,
    };

    const aoeProps = {
      data,
      dispatch,
      currentItem,
      modalType,
    };
    return (
      <PageHeaderWrapper title="商品基本信息查询">
        <Page inner>
          <Row gutter={24} className={styles.flex_stretch}>
            {/* 左侧树 */}
            <Col xl={6} lg={24} md={24} sm={24} xs={24} className={styles.fullHeightCol}>
              {this.renderCategoryTree()}
            </Col>
            {/* 右侧列表 */}
            <Col xl={18} lg={24} md={24} sm={24} xs={24}>
              <Card bordered={false}>
                <div className={styles.goodsInfoList}>
                  <div className={styles.goodsInfoListForm}>{this.renderSimpleForm()}</div>
                  <div className={styles.goodsInfoListOperator}>
                    <Button
                      icon="plus"
                      type="primary"
                      onClick={() => this.handleModalVisible(true, 'create')}
                    >
                      新增商品
                    </Button>
                    {selectedRowKeys.length > 0 && (
                      <span>
                        <Popconfirm
                          title="确定要删除所选商品吗?"
                          placement="top"
                          onConfirm={() => this.handleRemoveClick}
                        >
                          <Button>删除商品</Button>
                        </Popconfirm>
                      </span>
                    )}
                  </div>
                  <List {...listPops} />
                </div>
              </Card>
            </Col>
          </Row>
          {/* 新增窗口 */}
          {modalType !== '' && <Detail {...aoeProps} />}
        </Page>
      </PageHeaderWrapper>
    );
  }
}
