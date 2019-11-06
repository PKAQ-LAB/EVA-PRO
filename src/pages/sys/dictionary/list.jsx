import React from 'react';
import { Input, Divider, Popconfirm, Button, Row, Col } from 'antd';
import { connect } from 'dva';
import DataTable from '@src/components/DataTable';
import css from './list.less';
import { dictFilter } from '@src/utils/DataHelper';

const { Search } = Input;

@connect(state => ({
  dict: state.dict,
  loading: state.loading.effects['dict/listDict'],
}))
export default class List extends React.PureComponent {
  // 组件加载完成后加载数据
  componentDidMount() {
    this.props.dispatch({
      type: 'dict/listDict',
    });
  }

  // 行选事件
  handleOnRowClick = record => {
    // 根节点不加载
    if (record.parentId === '0' || !record.parentId) {
      return;
    }
    this.props.dispatch({
      type: 'dict/getDict',
      payload: {
        id: record.id,
        operate: 'view',
      },
    });
  };

  // 新增事件
  handleAddClick = () => {
    this.props.dispatch({
      type: 'dict/updateState',
      payload: {
        operate: 'create',
        currentItem: {},
        lineData: [],
      },
    });
  };

  // 编辑事件
  handleEditClick = record => {
    // 根节点不加载
    if (record.parentId === '0' || !record.parentId) {
      return;
    }
    this.props.dispatch({
      type: 'dict/getDict',
      payload: {
        id: record.id,
        operate: 'edit',
      },
    });
  };

  // 删除事件
  handleDeleteClick = record => {
    this.props.dispatch({
      type: 'dict/deleteDict',
      payload: {
        id: record.id,
      },
    });
  };

  // 搜索
  handleOnSearch = v => {
    this.props.dispatch({
      type: 'dict/updateState',
      payload: {
        search: v,
      },
    });
  };

  render() {
    const { loading, dicts, search } = this.props.dict;

    const columns = [
      {
        title: '字典描述',
        name: 'name',
        tableItem: {},
      },
      {
        title: '字典编码',
        name: 'code',
        tableItem: {},
      },
      {
        title: '操作',
        tableItem: {
          render: (text, record) =>
            record.status !== '9999' &&
            !record.parent &&
            record.parent !== '0' && (
              <DataTable.Oper>
                <a onClick={e => this.handleEditClick(record, e)}>编辑</a>
                <Divider type="vertical" />
                <Popconfirm
                  title="删除后系统中部分数据可能无法正确显示,确定要删除吗？"
                  okText="确定"
                  cancelText="取消"
                  onConfirm={() => this.handleDeleteClick(record)}
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
      loading,
      isScroll: true,
      alternateColor: true,
      dataItems: { records: dictFilter(dicts, search) },
      onRow: (record, index) => ({
        onClick: () => this.handleOnRowClick(record, index),
      }),
      pagination: false,
    };

    return (
      <div>
        {/* 工具条 */}
        <Row style={{ padding: '10px 5px' }}>
          <Col span={4}>
            <Button type="primary" onClick={() => this.handleAddClick()}>
              新增
            </Button>
          </Col>
          <Col span={20}>
            <Search
              placeholder="输入编码或名称进行搜索"
              className={css.search}
              onSearch={v => this.handleOnSearch(v)}
            />
          </Col>
        </Row>

        <DataTable defaultExpandAllRows {...dataTableProps} className={css.grid} bordered />
      </div>
    );
  }
}
