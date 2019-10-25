import React from 'react';
import { Button, Divider, Popconfirm } from 'antd';

import { connect } from 'dva';
import LineAoeForm from './lineaoeform';
import DataTable from '@src/components/DataTable';
import css from './linelist.less';

/** 字典明细 */
@connect(state => ({
  dict: state.dict,
}))
export default class LineList extends React.PureComponent {
  // 新增明细
  handleLineAdd = () => {
    this.props.dispatch({
      type: 'dict/updateState',
      payload: {
        modalType: 'create',
        editIndex: '',
      },
    });
  };

  // 删除明细
  handleDeleteClick = index => {
    const { lineData } = this.props.dict;
    lineData.splice(index, 1);

    this.props.dispatch({
      type: 'dict/updateState',
      payload: { lineData },
    });
  };

  // 修改编辑
  handleEditClick = index => {
    this.props.dispatch({
      type: 'dict/updateState',
      payload: {
        modalType: 'edit',
        editIndex: index,
      },
    });
  };

  render() {
    const { modalType, lineData, operate } = this.props.dict;

    const columns = [
      {
        title: '编码',
        name: 'keyName',
        tableItem: {},
      },
      {
        title: '描述',
        name: 'keyValue',
        tableItem: {},
      },
      {
        title: '排序',
        name: 'orders',
        tableItem: {},
      },
      {
        title: '操作',
        tableItem: {
          render: (text, record, index) =>
            !!operate &&
            operate !== 'view' && (
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
        <div className={css.ribbon}>
          <div>字典明细</div>
          <div>
            <Button
              type="primary"
              onClick={() => this.handleLineAdd()}
              disabled={operate === '' || operate === 'view'}
            >
              新增明细
            </Button>
          </div>
        </div>
        <DataTable {...dataTableProps} style={{ padding: 15 }} />
        {modalType !== '' && <LineAoeForm />}
      </>
    );
  }
}
