import React from 'react';
import { Card, Table, Icon, Button, message, Popconfirm } from 'antd';
import { connect } from 'dva';
import style from './Index.less';
// 字典管理左侧列表树
@connect(({ loading }) => ({
  loading: loading.models.dict,
}))
export default class DictGrid extends React.Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'dict/listDict',
    });
  }

  // 行点击事件
  handleOnRowClick = record => {
    // 根节点不加载
    if (record.parentId === 0) {
      return;
    }
    const { dispatch } = this.props;
    dispatch({
      type: 'dict/getDict',
      payload: {
        id: record.id,
        operateType: 'typeEdit',
      },
    });
  };

  // 字典删除
  handleDelete = record => {
    const { dispatch } = this.props;
    // 存在子节点的不允许删除
    dispatch({
      type: 'dict/deleteDict',
      payload: {
        id: record.id,
      },
      callback: () => {
        message.success('操作成功.');
      },
    });
  };

  // 新建分类
  handleAddClick = () => {
    this.props.dispatch({
      type: 'dict/updateState',
      payload: {
        operateType: 'typeCreate',
        currentItem: {},
      },
    });
  };

  render() {
    const { loading, data } = this.props;

    const column = [
      {
        dataIndex: 'code',
        title: '分类代码',
      },
      {
        dataIndex: 'name',
        title: '分类描述',
      },
      {
        title: '',
        render: (text, record) =>
          // 根分类不可进行删除
          record.parentId === '0' ? (
            ''
          ) : (
            <Popconfirm
              title="确定要删除吗？"
              okText="确定"
              cancelText="取消"
              onConfirm={() => this.handleDelete(record)}
            >
              <a>
                <Icon type="delete" />
              </a>
            </Popconfirm>
          ),
      },
    ];

    return (
      <Card
        type="inner"
        className={style.dict_left_tree}
        bodyStyle={{ padding: 0 }}
        title={
          <div>
            <Icon type="tags" />
            &nbsp;字典管理
          </div>
        }
        extra={
          <Button type="primary" size="small" onClick={() => this.handleAddClick()}>
            新增
          </Button>
        }
      >
        <Table
          indentSize={5}
          onRow={(record, index) => ({
            onClick: () => this.handleOnRowClick(record, index),
          })}
          rowClassName={record => (record.children ? style.top_node : style.blank)}
          loading={loading}
          rowKey={record => record.id}
          defaultExpandAllRows
          size="small"
          dataSource={data}
          columns={column}
          pagination={false}
        />
      </Card>
    );
  }
}
