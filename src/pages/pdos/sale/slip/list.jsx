import React, { useState } from 'react';
import { useModel } from 'umi';
import cx from 'classnames';
import { Table, Form, Alert, Button, Divider, DatePicker, Popconfirm, Input } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import Http from '@/utils/http';
import API from '@/services/apis';

import moment from 'moment';

export default (props) => {
  const { setOperateType, setCurrentItem, fetch, tableProps } = props;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const { initialState, setInitialState } = useModel('@@initialState');

  const dict = initialState.dict;

  const [ form ] = Form.useForm();

  // 新增
  const handleCreateClick = () => {
    setCurrentItem({});
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
      values.orderDate = values.orderDate && moment(values.orderDate).format('YYYY-MM-DD')
      fetch(values);
    });
  };

  // 单条删除
  const handleDeleteClick = record => {
    Http.post(API.ORDER_DEL, { param: [record.id], })
    .then(() => fetch());
  };

  // 编辑/查看
  const handleEditClick = (record, operateType) => {
    Http.get(API.ORDER_GET, record.id).then((res) => {
      setCurrentItem(res.data);
      setOperateType(operateType);
    })
  };

  // 批量删除
  const handleRemoveClick = () => {

    if (!selectedRowKeys) return;

    Http.post(API.ORDER_DEL, { param: selectedRowKeys, })
    .then(() => fetch())
  };

 // 操作按钮
  const renderButton = () => {
    return <div>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => handleCreateClick()}
      >
        新增销售单
      </Button>
      {selectedRowKeys.length > 0 && (
        <>
          <span>
            <Popconfirm
              title="确定要删除所选销售单吗?"
              placement="top"
              onConfirm={() => handleRemoveClick()}
            >
                <Divider type="vertical" />
              <Button style={{ marginLeft: 8 }} danger icon={<DeleteOutlined />}>
                删除销售单
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
      <Form  colon layout="inline" onSubmit={handleSearch} form={form} >

        <Form.Item label="订单号" name="orderNumber">
          <Input />
        </Form.Item>

        <Form.Item label="订单时间" name="orderDate">
           <DatePicker showToday/>
        </Form.Item>

        <Button type="primary" htmlType="submit"  onClick={() => handleSearch()}>
          查询
        </Button>
        <Divider type="vertical" />
        <Button htmlType="reset" onClick={() => handleFormReset()} >
          重置
        </Button>
      </Form>
    );
  }
  const columns = [{
      title: '来源店铺',
      dataIndex: 'shopName'
    }, {
      title: '所属平台',
      dataIndex: 'platform'
    }, {
      title: '订单号',
      width: 180,
      dataIndex: 'orderNumber',
    }, {
      title: '订单时间',
      dataIndex: 'orderDate',
    },  {
      title: '订单状态',
      dataIndex: 'orderStatus',
    }, {
      title: '合计数量',
      dataIndex: 'totalNum',
    }, {
      title: '合计金额',
      dataIndex: 'totalAmount',
    },{
      title: '买家地址',
      dataIndex: 'buyerAddress',
    },{
      width: 180,
      render: (text, record) =>
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

  const rowSelection = {
    selectedRowKeys,
    getCheckboxProps: record => ({
      disabled: record.locked === '9999' || record.locked === '0001',
      name: record.name,
    }),
    onSelect: rows => setSelectedRowKeys(rows),
    onChange: rows => setSelectedRowKeys(rows)
  };

  const dataTableProps = {
    ...tableProps,
    columns,
    size: 'small',
    scroll: {
      x: '100vw'
    },
    rowKey: record => record.id,
    rowSelection,
    rowClassName: record =>
      cx({ 'eva-locked': record.status === '0001', 'eva-disabled': record.status === '9999' }),
    onRow: (record) => ({
        onDoubleClick: () => handleEditClick(record, 'view'),
    })
  };

  return <>
          {/* 工具条 */}
          <div className="eva-ribbon">
            {/* 操作按钮 */}
            <>{renderButton(selectedRowKeys)}</>
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
          <div className="eva-body">
            <Table {...dataTableProps}/>
          </div>
    </>;
}
