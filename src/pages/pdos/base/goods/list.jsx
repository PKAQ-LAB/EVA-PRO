import React, { useState } from 'react';
import cx from 'classnames';
import { Form, Alert, Button, Divider, Popconfirm, Input } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import TreeSelector from '@/components/TreeSelector';
import DataTable from '@/components/DataTable';
import { get, del } from './services/goodsSvc';

export default (props) => {

  const { listData, fetch, setOperateType, setCurrentItem, dict, loading } = props;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [form] = Form.useForm();

   // 编辑/查看
  const handleEditClick = (record, operate) => {
    if (record.id) {
      get({id: record.id}).then(response => {
        setCurrentItem(response.data);
        setOperateType(operate);
      });
    }
  }

  // 单条删除
  const handleDeleteClick = record => {
    if (record.id) {
      del({ param: [record.id], });
      fetch()
    }
  };

  // 选择
  const handleSelectRows = rows => {
    setSelectedRowKeys(rows);
  }

  // 新增
  const handleCreateClick = () => {
    setOperateType("create");
  }

  // 重置
  const handleFormReset = () => {
    form.resetFields();
    fetch();
  };

  // 查询
  const handleSearch = () => {
    const { validateFields } = form;
    validateFields().then(values => {
      fetch({...values});
    });
  };

  // 批量删除
  const handleRemoveClick = () => {

    if (!selectedRowKeys) return;
    del({
      param: [...selectedRowKeys],
    })
    fetch();
  };

 // 操作按钮
 const renderButton = () => {
  return <div>
    <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={() => handleCreateClick()}
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
            onConfirm={()=> handleRemoveClick()}
          >
            <Button style={{ marginLeft: 8 }}
                    type="danger"
                    icon={<DeleteOutlined />}
                    loading={loading}>
              删除产品
            </Button>
          </Popconfirm>
        </span>
      </>
    )}
  </div>;
}

  // 简单搜索条件
  const renderSearchForm = () => {
    return (
      <Form colon layout="inline" onSubmit={() => handleSearch()} form={form} >
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

        <Button type="primary" htmlType="submit" onClick={() => handleSearch()}>
          查询
        </Button>
        <Divider type="vertical" />
        <Button htmlType="reset" onClick={() => handleFormReset()} >
          重置
        </Button>
      </Form>
    );
  }

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
              <a onClick={() => handleEditClick(record, 'view')}>查看详情</a>
              <Divider type="vertical" />
              <a onClick={() => handleEditClick(record, 'edit')}>编辑</a>
              <Divider type="vertical" />
              <Popconfirm
                title="确定要删除吗？"
                okText="确定"
                cancelText="取消"
                onConfirm={() => handleDeleteClick(record)}
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
    dataProp: "list",
    loading,
    isScroll: true,
    alternateColor: true,
    dataItems: listData,
    selectType: 'checkbox',
    rowClassName: record =>
      cx({ 'eva-locked': record.status === '0001', 'eva-disabled': record.status === '9999' }),
    selectedRowKeys,
    // onChange: this.pageChange,
    onSelect: () => handleSelectRows,
    disabled: { status: ['9999', '0001'] },
  };

  return (
    <>
      {/* 工具条 */}
      <div className="eva-ribbon">
        {/* 操作按钮 */}
        <>{renderButton()}</>
        {/* 查询条件 */}
        <>{renderSearchForm()}</>
      </div>
      {/* 删除条幅 */}
      <div className="eva-alert">
        {selectedRowKeys.length > 0 && (
          <Alert
            message={
              <div>
                已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项&nbsp;&nbsp;
                {selectedRowKeys.length > 0 && (
                  <a onClick={() => handleSelectRows([])} style={{ marginLeft: 24 }}>
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
