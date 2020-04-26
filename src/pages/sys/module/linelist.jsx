import React, { useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Table, Button, Divider, Popconfirm } from 'antd';
import cx from 'classnames';
import LineAoeForm from './lineaoeform';

/** 资源明细 */
export default (props) => {
  const { lineData = [], setLineData, currentItem } = props;
  const [operate, setOperate] = useState("");
  const [editIndex, setEditIndex] = useState("");

  if (lineData < 1) {
    lineData.push({
      resourceDesc: '全部资源',
      resourceUrl: '/**',
      resourceType: '9999',
    });
  }

  // 表单属性
  const formPorps = {
    operate, setOperate, lineData, setLineData, editIndex, setEditIndex
  }

  // 新增明细
  const handleLineAdd = () => {
    setOperate("create");
    setEditIndex("");
  };

  // 删除明细
  const handleDeleteClick = index => {
    currentItem.resources.splice(index, 1);
  };

  // 修改编辑
  const handleEditClick = index => {
    setOperate("edit");
    setEditIndex(index);
  };

  const columns = [{
      title: '资源描述',
      dataIndex: 'resourceDesc',
    }, {
      title: '资源路径',
      dataIndex: 'resourceUrl',
    }, {
      title: '操作',
      render: (text, record, index) =>
        record.resourceType !== '9999' && (
          <>
            <Divider type="vertical" />
            <a onClick={() => handleEditClick(index)}>编辑</a>
            <Divider type="vertical" />
            <Popconfirm
              title="确定要删除吗？"
              okText="确定"
              cancelText="取消"
              onConfirm={() => handleDeleteClick(index)}
            >
              <a>删除</a>
            </Popconfirm>
          </>
        ),
    },
  ];

  const dataTableProps = {
    columns,
    rowKey: record => record.id,
    showNum: true,
    isScroll: true,
    alternateColor: true,
    rowClassName: record =>
      cx({ 'eva-locked': record.locked === '0001', 'eva-disabled': record.locked === '9999' }),
    dataSource: lineData ,
  };

  return (
    <>
      <Divider>资源信息</Divider>
      {/* 子表新增 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          style={{ marginBottom: 10 }}
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleLineAdd()}
        >
          新增资源
        </Button>
      </div>
      <Table {...dataTableProps} />
      {operate !== '' && <LineAoeForm {...formPorps}/>}
    </>
  )
}
