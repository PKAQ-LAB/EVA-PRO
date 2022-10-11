import React, { useState } from 'react';
import { Form, Alert, Button, Divider, Popconfirm, Input, Table } from 'antd';
import cx from 'classnames';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import TreeSelector from '@/components/TreeSelector';
import Svc from '@/utils/http';
import API from '@/apis'

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
      Svc.get(API.BRAND_GET, record.id).then(response => {
        setCurrentItem(response.data);
        setOperateType(operate);
      });
    }
  }

  // 单条删除
  const handleDeleteClick = record => {
    if (record.id) {
      Svc.del(API.BRAND_DEL,{ param: [record.id], }).then(() => {
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
    Svc.del(API.BRAND_DEL,{
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
      新增品牌
    </Button>
    {selectedRowKeys.length > 0 && (
      <>
        <Divider type="vertical" />
        <span>
          <Popconfirm
            title="确定要删除所选品牌吗?"
            placement="top"
            onConfirm={()=> handleRemoveClick()}
          >
            <Button style={{ marginLeft: 8 }}
                    type="danger"
                    icon={<DeleteOutlined />}
                    loading={loading}>
              删除品牌
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
          label="品牌名称"
          name="name">
          <Input />
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
      width: 30,
      render: (_text, _record, index) => {
        return index;
      }
    },
    {
      title: '名称',
      width: 300,
      dataIndex: 'name',
    }, {
      title: '编码',
      width: 180,
      dataIndex: 'code',
    }, {
      title: '备注',
      dataIndex: 'remark',
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
