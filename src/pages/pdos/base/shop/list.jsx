import React, { useState } from 'react';
import { Form, Alert, Button, Divider, Popconfirm, Input, Table } from 'antd';
import cx from 'classnames';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import TreeSelector from '@/components/TreeSelector';
import { get, del } from './services/goodsSvc';

export default (props) => {

  const { setOperateType, setCurrentItem, dict, fetch, loading, tableProps } = props;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [form] = Form.useForm();

  const rowSelection = {
    selectedRowKeys,
    onSelect: rows => setSelectedRowKeys(rows),
    onChange: rows => setSelectedRowKeys(rows)
  };

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
      del({ param: [record.id], }).then(() => {
        fetch();
      });
    }
  };

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
    }).then(()  => {
      fetch();
    })
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
      新增店铺
    </Button>
    {selectedRowKeys.length > 0 && (
      <>
        <Divider type="vertical" />
        <span>
          <Popconfirm
            title="确定要删除所选店铺吗?"
            placement="top"
            onConfirm={()=> handleRemoveClick()}
          >
            <Button style={{ marginLeft: 8 }}
                    type="danger"
                    icon={<DeleteOutlined />}
                    loading={loading}>
              删除店铺
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
          label="店铺名称"
          name="name">
          <Input />
        </Form.Item>

        <Form.Item
          label="所属平台"
          name="category">
            <TreeSelector
              url="/api/pdos/base/category/list"
              keys={['id', 'name', 'children']}
              search
              showAll={false}
              treeDefaultExpandAll
              allowClear
              showSearch
              placeholder="请选择所属平台"
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
      title: '',
      render: (_text, _record, index) => {
        return index;
      }
    },
    {
      title: '店名',
      dataIndex: 'name',
    }, {
      title: '平台',
      dataIndex: 'platform',
    }, {
      title: '保证金',
      dataIndex: 'deposit',
    }, {
      title: '开店日期',
      dataIndex: 'openDate',
    }, {
      title: 'URL',
      dataIndex: 'url',
    }, {
      width: 180,
      render: (_text, record) =>
          <>
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
          </>
    },
  ];

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
                  <a onClick={() => setSelectedRowKeys([])} style={{ marginLeft: 24 }}>
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
      <div className={cx("eva-body","alternate-table")}>
        <Table
          size = 'small'
          {...tableProps}
          columns={columns}
          rowKey={record => record.id}
          rowSelection={rowSelection}
          onRow = {
            (record) => ({
              onClick: () => handleEditClick(record, 'view'),
            })
          }
        />;
      </div>
    </>
  )
}
