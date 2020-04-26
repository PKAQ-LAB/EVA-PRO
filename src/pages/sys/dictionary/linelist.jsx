import React, { useState } from 'react';
import { Table, Button, Divider, Popconfirm } from 'antd';

import LineAoeForm from './lineaoeform';
import css from './linelist.less';

/** 字典明细 */
export default (props) => {
  const [modalType, setModalType] = useState("");
  const [editIndex, setEditIndex] = useState("");

  const { lineData = [], setLineData, opertateType } = props;

  console.info(lineData);

  // 表单属性
  const formPorps = {
    modalType, setModalType, lineData, setLineData, editIndex, setEditIndex
  }

  // 新增明细
  const handleLineAdd = () => {
    setModalType("create");
    setEditIndex("");
  };

  // 删除明细
  const handleDeleteClick = index => {
    lineData.splice(index, 1);
    setLineData(lineData);
  };

  // 修改编辑
  const handleEditClick = index => {
    setModalType("edit");
    setEditIndex(index);
  };

  const columns = [
    {
      title: '编码',
      dataIndex:  'keyName',
    },
    {
      title: '描述',
      dataIndex:  'keyValue',
    },
    {
      title: '排序',
      dataIndex:  'orders',
    },
    {
      title: '操作',
      render: (text, record, index) =>
        !!opertateType &&
        opertateType !== 'view' && (
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
    dataSource: lineData,
  };

  return (
    <>
      <div className={css.ribbon}>
        <div>字典明细</div>
        <div>
          <Button
            type="primary"
            onClick={() => handleLineAdd()}
            disabled={opertateType === '' || opertateType === 'view'}
          >
            新增明细
          </Button>
        </div>
      </div>
      <Table {...dataTableProps} style={{ padding: 15 }} />
      {modalType !== '' && <LineAoeForm {...formPorps}/>}
    </>
  );
}
