import React from 'react';
import { Form, Alert, Button, Divider, Popconfirm, Input } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import {  PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { connect } from 'umi';
import TreeSelector from '@/components/TreeSelector';
import List from './list';
import AOEForm from './aoeform';

@connect(({ loading, goods }) => ({
  loading: loading.models.goods,
  goods,
}))
export default class Goods extends React.PureComponent{

  formRef = React.createRef();

  // 新增
  handleCreateClick = () => {
    this.props.dispatch({
      type:'goods/updateState',
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
      type: 'goods/fetch',
    });
  };

  // 查询
  handleSearch = () => {
    const { dispatch } = this.props;
    const { validateFields } = this.formRef.current;
    validateFields().then(values => {
      dispatch({
        type: 'goods/fetch',
        payload: {...values},
      });
    });
  };

  // 批量删除
  handleRemoveClick = () => {
    const { selectedRowKeys } = this.props.goods;

    if (!selectedRowKeys) return;

    this.props.dispatch({
      type: 'goods/remove',
      payload: {
        param: selectedRowKeys,
      },
    });
  };

  handleSelectRows = rows => {
    this.props.dispatch({
      type: 'goods/updateState',
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
      新增产品
    </Button>
    {selectedRowKeys.length > 0 && (
      <>
        <Divider type="vertical" />
        <span>
          <Popconfirm
            title="确定要删除所选产品吗?"
            placement="top"
            onConfirm={this.handleRemoveClick}
          >
            <Button style={{ marginLeft: 8 }} type="danger" icon={<DeleteOutlined />} loading={loading}>
              删除产品
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
        label="产品名称"
        name="name">
        <Input />
      </Form.Item>

      <Form.Item
        label="所属分类"
        name="category">
          <TreeSelector
            url="/api/pdos/base/category/list"
            keys={['id', 'name', 'children']}
            search
            showAll={false}
            treeDefaultExpandAll
            allowClear
            showSearch
            placeholder="请选择所属分类"
          />
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
    const { operateType, selectedRowKeys } = this.props.goods;
    return (
      <PageHeaderWrapper title="产品管理" subTitle="维护产品基础信息">
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
