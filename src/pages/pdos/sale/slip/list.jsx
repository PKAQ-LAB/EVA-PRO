import React, { useState } from 'react';
import { useSelector } from 'umi';
import cx from 'classnames';
import { Table, Form, Alert, Button, Divider, Popconfirm, Input } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { delSlip, get } from './services/slipSvc';

export default (props) => {
  const { setOperateType, setCurrentItem, fetch, tableProps } = props;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const dict = useSelector(state => state.global.dict);

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
      fetch(values);
    });
  };

  // 单条删除
  const handleDeleteClick = record => {
    delSlip({
      param: [record.id],
    }).then(() => {
      fetch();
    })
  };

  // 编辑/查看
  const handleEditClick = (record, operateType) => {
    get({
      id: record.id
    }).then( res => {
      setCurrentItem(res.data);
      setOperateType(operateType);
    })
  };

  // 批量删除
  const handleRemoveClick = () => {

    if (!selectedRowKeys) return;

    delSlip({
      param: selectedRowKeys,
    }).then( () => {
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
              <Button style={{ marginLeft: 8 }} type="danger" icon={<DeleteOutlined />}>
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
        <Form.Item label="商品名称" name="goodsName">
          <Input />
        </Form.Item>

        <Form.Item label="订单号" name="orderCode">
          <Input />
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
  const columns = [
    {
      title: '商品名称',
      dataIndex: 'goodsName',
    }, {
      title: '来源平台',
      dataIndex: 'sourcePlatform',
      render: text => dict.online_platform && dict.online_platform[`${text}`]
    }, {
      title: '订单号',
      dataIndex: 'orderCode',
    }, {
      title: '快递费用',
      dataIndex: 'shipPrice',
    },  {
      title: '下单价格',
      dataIndex: 'price',
    }, {
      title: '下单数量',
      dataIndex: 'nummer',
    }, {
      title: '总成交额',
      dataIndex: 'totalPrice',
    },{
      title: '成本价',
      dataIndex: 'costPrice',
    }, {
      title: '成本总计',
      dataIndex: 'totalCost',
    }, {
      title: '利润',
      dataIndex: 'profit',
    }, {
      title: '下单时间',
      dataIndex: 'dealTime',
    }, {
      title: '供应商姓名',
      dataIndex: 'supplierName',
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
