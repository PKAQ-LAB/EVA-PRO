import React from 'react';
import { Button, Divider, Popconfirm } from 'antd';

import { connect } from 'dva';
import LineAoeForm from './lineaoeform';
import DataTable from '@/components/DataTable';

/** 资源明细 */
@connect(state => ({
  module: state.module,
}))
export default class LineList extends React.PureComponent {
  // 新增明细
  handleLineAdd = () => {
    this.props.dispatch({
      type: 'module/updateState',
      payload: {
        operate: 'create',
        editIndex: '',
      },
    });
  };

  // 删除明细
  handleDeleteClick = index => {
    const { lineData } = this.props.module;
    lineData.splice(index, 1);

    this.props.dispatch({
      type: 'module/updateState',
      payload: { lineData },
    });
  };

  // 修改编辑
  handleEditClick = index => {
    this.props.dispatch({
      type: 'module/updateState',
      payload: {
        operate: 'edit',
        editIndex: index,
      },
    });
  };

  render() {
    const { lineData, operate } = this.props.module;

    const columns = [
      {
        title: '资源描述',
        name: 'resourceDesc',
        tableItem: {},
      },
      {
        title: '资源路径',
        name: 'resourceUrl',
        tableItem: {},
      },
      {
        title: '操作',
        tableItem: {
          render: (text, record, index) => (
            <DataTable.Oper>
              <Divider type="vertical" />
              <a onClick={() => this.handleEditClick(index)}>编辑</a>
              <Divider type="vertical" />
              <Popconfirm
                title="确定要删除吗？"
                okText="确定"
                cancelText="取消"
                onConfirm={() => this.handleDeleteClick(index)}
              >
                <a>删除</a>
              </Popconfirm>
            </DataTable.Oper>
          ),
        },
      },
    ];

    const dataTableProps = {
      columns,
      rowKey: 'id',
      showNum: true,
      isScroll: true,
      alternateColor: true,
      dataItems: { records: lineData },
    };

    return (
      <>
        <Divider>资源信息</Divider>
        {/* 子表新增 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            style={{ marginBottom: 10 }}
            type="primary"
            icon="plus"
            onClick={() => this.handleLineAdd()}
          >
            新增资源
          </Button>
        </div>
        <DataTable {...dataTableProps} />
        {operate !== '' && <LineAoeForm />}
      </>
    );
  }
}
