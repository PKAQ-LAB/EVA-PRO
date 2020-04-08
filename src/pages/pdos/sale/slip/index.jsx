import React from 'react';
import { Form, Alert, Button, Divider, Popconfirm, Input } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import {  PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { connect } from 'umi';
import List from './list';
import AOEForm from './aoeform';

@connect(({ loading, saleSlip }) => ({
  loading: loading.models.saleSlip,
  saleSlip,
}))
export default class Slip extends React.PureComponent{

  formRef = React.createRef();

  // 新增
  handleCreateClick = () => {
    this.props.dispatch({
      type:'saleSlip/updateState',
      payload: {
        operateType: 'create',
        // 清空编辑时留存的数据
        currentItem: {},
      }
    })
  }

  // 重置
  handleFormReset = () => {
    this.formRef.current.resetFields();
    this.props.dispatch({
      type: 'saleSlip/fetch',
    });
  };

  // 查询
  handleSearch = () => {
    const { dispatch } = this.props;
    const { validateFields } = this.formRef.current;
    validateFields().then(values => {
      dispatch({
        type: 'saleSlip/fetch',
        payload: {...values},
      });
    });
  };

  // 批量删除
  handleRemoveClick = () => {
    const { selectedRowKeys } = this.props.saleSlip;

    if (!selectedRowKeys) return;

    this.props.dispatch({
      type: 'saleSlip/remove',
      payload: {
        param: selectedRowKeys,
      },
    });
  };

  handleSelectRows = rows => {
    this.props.dispatch({
      type: 'saleSlip/updateState',
      payload: { selectedRowKeys: rows },
    });
  }

 // 操作按钮
 renderButton(selectedRowKeys) {
  const { loading } = this.props;
  return <div>
    <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={() => this.handleCreateClick()}
      loading={loading}
    >
      新增销售单
    </Button>
    {selectedRowKeys.length > 0 && (
      <>
        <Divider type="vertical" />
        <span>
          <Popconfirm
            title="确定要删除所选销售单吗?"
            placement="top"
            onConfirm={this.handleRemoveClick}
          >
            <Button style={{ marginLeft: 8 }} type="danger" icon={<DeleteOutlined />} loading={loading}>
              删除销售单
            </Button>
          </Popconfirm>
        </span>
      </>
    )}
  </div>;
}

// 简单搜索条件
renderSearchForm() {
  const { loading } = this.props;

  return (
    <Form  colon layout="inline" onSubmit={this.handleSearch} ref={this.formRef} >
      <Form.Item
        label="商品名称"
        name="goodsName">
        <Input />
      </Form.Item>

      <Form.Item
        label="订单号"
        name="orderCode">
        <Input />
      </Form.Item>

      <Button type="primary" htmlType="submit" loading={loading} onClick={() => this.handleSearch()}>
        查询
      </Button>
      <Divider type="vertical" />
      <Button htmlType="reset" onClick={() => this.handleFormReset()} loading={loading}>
        重置
      </Button>
    </Form>
  );
}

  render() {
    const { operateType, selectedRowKeys } = this.props.saleSlip;
    return (
      <PageHeaderWrapper title="线上销售单" subTitle="各线上平台销售单统计">
        {/* 工具条 */}
        <div className="eva-ribbon">
          {/* 操作按钮 */}
          <>{this.renderButton(selectedRowKeys)}</>
          {/* 查询条件 */}
          <>{this.renderSearchForm()}</>
        </div>
        {/* 删除条幅 */}
        <div className="eva-alert">
          {selectedRowKeys.length > 0 && (
            <Alert
              message={
                <div>
                  已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项&nbsp;&nbsp;
                  {selectedRowKeys.length > 0 && (
                    <a onClick={() => this.handleSelectRows([])} style={{ marginLeft: 24 }}>
                      清空选择
                    </a>
                  )}
                </div>
              }
              type="info"
              showIcon
            />
          )}
        </div>
        <div className="eva-body">
          <List />
        </div>
        {/* 新增/编辑界面 */}
        {
          operateType !== '' && <AOEForm/>
        }
      </PageHeaderWrapper>
    );
  }
}
