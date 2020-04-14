import React from 'react';
import { connect } from 'umi';
import cx from 'classnames';
import { Form, Alert, Button, Divider, Popconfirm, Input } from 'antd';
import {  PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import TreeSelector from '@/components/TreeSelector';
import DataTable from '@/components/DataTable';

@connect(({ global, loading, goods }) => ({
  loading: loading.models.goods,
  goods,
  global,
}))
export default class SlipList extends React.PureComponent{
  componentDidMount() {
    this.props.dispatch({
      type: 'goods/fetch',
    });
  }

  handleSelectRows = rows => {
    this.props.dispatch({
      type: 'goods/updateState',
      payload: { selectedRowKeys: rows },
    });
  }

  // 单条删除
  handleDeleteClick = record => {
    this.props.dispatch({
      type: 'goods/remove',
      payload: {
        param: [record.id],
      },
    });
  };

  // 编辑/查看
  handleEditClick = (record, operateType) => {
    if (record.id) {
      this.props.dispatch({
        type: 'goods/get',
        payload: {
          operateType,
          id: record.id,
        },
      });
    }
  };

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
    const { goods, selectedRowKeys } = this.props.goods;
    const { loading } = this.props;
    const { dict } = this.props. global;


    const columns = [
      {
        title: '品名',
        name: 'name',
        tableItem: {},
      }, {
        title: '品类',
        name: 'category',
        tableItem: {},
      }, {
        title: '货号',
        name: 'itemNo',
        tableItem: {},
      }, {
        title: '助记码',
        name: 'mnemonic',
        tableItem: {},
      }, {
        title: '单位',
        name: 'unit',
        tableItem: {
          render: text => dict.unit && dict.unit[`${text}`]
        },
      },  {
        title: '装箱规格',
        name: 'boxunit',
        tableItem: {},
      }, {
        title: '生产厂家',
        name: 'factory',
        tableItem: {},
      },{
        title: '条码',
        name: 'barcode',
        tableItem: {},
      }, {
        tableItem: {
          width: 180,
          render: (text, record) =>
              <DataTable.Oper style={{ textAlign: 'center' }}>
                <a onClick={() => this.handleEditClick(record, 'view')}>查看详情</a>
                <Divider type="vertical" />
                <a onClick={() => this.handleEditClick(record, 'edit')}>编辑</a>
                <Divider type="vertical" />
                <Popconfirm
                  title="确定要删除吗？"
                  okText="确定"
                  cancelText="取消"
                  onConfirm={() => this.handleDeleteClick(record)}
                >
                  <a>删除</a>
                </Popconfirm>
              </DataTable.Oper>
        },
      },
    ];

    const dataTableProps = {
      columns,
      rowKey: 'id',
      showNum: true,
      loading,
      isScroll: true,
      alternateColor: true,
      dataItems: goods,
      selectType: 'checkbox',
      rowClassName: record =>
        cx({ 'eva-locked': record.status === '0001', 'eva-disabled': record.status === '9999' }),
      selectedRowKeys,
      // onChange: this.pageChange,
      onSelect: this.handleSelectRows,
      disabled: { status: ['9999', '0001'] },
    };

    return (
      <>
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
          <DataTable {...dataTableProps} bordered pagination />;
        </div>
      </>
    )
  }
}
