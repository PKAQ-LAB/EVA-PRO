import React, { useState } from 'react';
import cx from 'classnames';
import { useModel } from 'umi';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Table, Form, Alert, Button, Divider, Popconfirm, Input } from 'antd';
import Svc from '@/services/service';
import API from '@/apis'


export default (props) => {
  const [ form ] = Form.useForm();

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const { setOperateType, setCurrentItem, fetch, tableProps } = props;
  const { initialState, setInitialState } = useModel('@@initialState');

  const dict = initialState.dict;

  // 单条删除
  const handleDeleteClick = record => {
    Svc.del(API.SUPPLIER_DEL, {
      param: [record.id],
    }).then(() => {
      fetch();
    })
  };

  // 编辑/查看
  const handleEditClick = (record, operateType) => {
    Svc.get(API.SUPPLIER_GET,record.id,
    ).then(res => {
      setCurrentItem(res.data);
      setOperateType(operateType)
    })
  };

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
  const handleSearch = (values) => {
    fetch(values);
  };

  // 批量删除
  const handleRemoveClick = () => {
    if (!selectedRowKeys) return;

    Svc.del(API.SUPPLIER_DEL, {
      param: selectedRowKeys,
    }).then(() => {
      fetch();
    })
  };

  // 操作按钮
  const renderButton = () => {
    return <>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleCreateClick()}
            >
              新增供应商
            </Button>
            {
              selectedRowKeys.length > 0 &&
                <span>
                  <Popconfirm
                    title="确定要删除所选供应商吗?"
                    placement="top"
                    onConfirm={() => handleRemoveClick}
                  >
                    <Divider type="vertical" />
                    <Button style={{ marginLeft: 8 }} type="danger" icon={<DeleteOutlined />} loading={loading}>
                      删除供应商
                    </Button>
                  </Popconfirm>
                </span>
            }
          </>
  }

  // 简单搜索条件
  const renderSearchForm = ()  => {
    return (
      <Form  colon layout="inline" onFinish={() => handleSearch} form={form} >
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

  const columns = [{
      title: '全称',
      ellipsis: true,
      dataIndex: 'fullName',
    }, {
      title: '简称',
      width: 120,
      dataIndex: 'name',
    }, {
      title: ' ',
      width: 80,
      dataIndex: '',
      render: (text, record) =>{
        const flag = [];
        console.info(record);
        if(record.sdwr) flag.push("七");
        if(record.freeDelivery) flag.push("包");
        if(record.dropShipping) flag.push("代");
        return  flag.concat
      }
    }, {
      title: '编码',
      dataIndex: 'code',
    }, {
      title: '联系人',
      dataIndex: 'contact',
    }, {
      title: '电话',
      dataIndex: 'tel',
    }, {
      title: '类型',
      dataIndex: 'type',
    }, {
      title: '主营品类',
      dataIndex: 'category',
    }, {
      title: '标签',
      dataIndex: 'tags',
    }, {
      title: '退货地址',
      ellipsis: true,
      dataIndex: 'returnAddr',
    }, {
      title: '店铺地址',
      ellipsis: true,
      dataIndex: 'shopUrl',
    }, {
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
    size: "small",
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
        <Table {...dataTableProps} />
      </div>
  </>;
}
