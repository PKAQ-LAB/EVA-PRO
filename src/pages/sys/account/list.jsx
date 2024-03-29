import React from 'react';
import cx from 'classnames';
import { Divider, Popconfirm, notification, Table } from 'antd';

import Http from '@/utils/http';
import API from '@/apis';

export default (props) => {
  const { fetch,
          tableProps,
          selectedRowKeys,
          setSelectedRowKeys,
          setOperateType,
          setCurrentItem,
          setRoleModal, } = props;

  const rowSelection = {
    selectedRowKeys,
    getCheckboxProps: record => ({
      disabled: record.locked === '9999' || record.locked === '0001',
      name: record.name,
    }),
    rowClassName: record =>
            cx({ 'eva-locked': record.locked === '0001', 'eva-disabled': record.locked === '9999' }),
    onSelect: rows => setSelectedRowKeys(rows),
    onChange: rows => setSelectedRowKeys(rows)
  };

  //  单条删除
  const handleDeleteClick = record => {
    Http.post(API.ACCOUNT_DEL, [record.id]).then((res)=>{
      if(res.success){
        fetch();
      }
    });
  };

  // 编辑
  const handleEditClick = record => {
    if (record.id) {
      Http.get(API.ACCOUNT_GET, record.id).then((res) => {
        setCurrentItem(res.data);
        setOperateType("edit");
      })
    } else {
      notification.error('没有选择记录');
    }
  };

  // 权限选择
  const handleRoleClick = record => {
    Http.get(API.ACCOUNT_GET, record.id).then((res) => {
      setCurrentItem(res.data);
      setRoleModal("edit");
    })
  };

  const columns = [{
      title: '姓名',
      dataIndex: 'name',
    },
    {
      title: '账号',
      dataIndex: 'account',
    },
    {
      title: '所属部门',
      dataIndex: 'deptName',
    },
    {
      title: '手机',
      dataIndex: 'tel',
    },
    {
      title: '账号状态',
      dataIndex: 'locked',
      render: (text, record, index) => {
        switch(text){
          case '0000': return '正常';
          case '9999': return '系统用户';
          case '0001': return '已锁定';
        }
      }
    },
    {
      title: '操作',
      width: 180,
      render: (text, record) =>
        record.locked === '0000' && (
          <>
            <a onClick={() => handleRoleClick(record)}>角色授权</a>
            <Divider type="vertical" />
            <a onClick={() => handleEditClick(record)}>编辑</a>
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
        ),
    },
  ];

  return    <Table
                {...tableProps}
                columns={columns}
                rowKey={record => record.id}
                rowSelection={rowSelection}
                rowClassName={record =>
                  cx({ 'eva-locked': record.locked === '0001', 'eva-disabled': record.locked === '9999' })
                }
                onRow = {
                  (record) => ({
                    onDoubleClick: () => handleEditClick(record, 'view'),
                  })
                }
              />

}
