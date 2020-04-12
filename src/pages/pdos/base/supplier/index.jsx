import React from 'react';
import { Form, Alert, Button, Divider, Popconfirm, Input } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import {  PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { connect } from 'umi';
import List from './list';
import AOEForm from './aoeform';

@connect(({ loading, supplier }) => ({
  loading: loading.models.supplier,
  supplier,
}))
export default class Supplier extends React.PureComponent{

  formRef = React.createRef();

  // 新增
  handleCreateClick = () => {
    this.props.dispatch({
      type:'supplier/updateState',
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
      type: 'supplier/fetch',
    });
  };

  // 查询
  handleSearch = () => {
    const { dispatch } = this.props;
    const { validateFields } = this.formRef.current;
    validateFields().then(values => {
      dispatch({
        type: 'supplier/fetch',
        payload: {...values},
      });
    });
  };

  // 批量删除
  handleRemoveClick = () => {
    const { selectedRowKeys } = this.props.supplier;

    if (!selectedRowKeys) return;

    this.props.dispatch({
      type: 'supplier/remove',
      payload: {
        param: selectedRowKeys,
      },
    });
  };

  handleSelectRows = rows => {
    this.props.dispatch({
      type: 'supplier/updateState',
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
      新增供应商
    </Button>
    {selectedRowKeys.length > 0 && (
      <>
        <Divider type="vertical" />
        <span>
          <Popconfirm
            title="确定要删除所选供应商吗?"
            placement="top"
            onConfirm={this.handleRemoveClick}
          >
            <Button style={{ marginLeft: 8 }} type="danger" icon={<DeleteOutlined />} loading={loading}>
              删除供应商
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
        label="供应商名称"
        name="fullName">
        <Input />
      </Form.Item>

      <Form.Item
        label="助记码"
        name="mnemonic">
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
    const { operateType, selectedRowKeys } = this.props.supplier;
    return (
      <PageHeaderWrapper title="供应商管理" subTitle="供应商管理">
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
