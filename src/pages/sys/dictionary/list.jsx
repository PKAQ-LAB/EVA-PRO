import React, { useState } from 'react';
import { Table, Input, Divider, Popconfirm, Button, Row, Col } from 'antd';
import { dictFilter } from '@/utils/DataHelper';
import css from './list.less';

import Http from '@/utils/http';
import API from '@/apis';

const { Search } = Input;

export default (props) => {

const [search, setSearch] = useState("");
const { setOperateType, setCurrentItem, fetch, loading, data } = props;
  // 行选事件
 const handleOnRowClick = record => {
    // 根节点不加载
    if (record.parentId === '0' || !record.parentId) {
      return;
    }
    Http.get(API.DICT_GET, record.id)
          .then(res => {
            setCurrentItem(res.data);
            setOperateType("view");
          })
  };

  // 新增事件
  const handleAddClick = () => {
    setCurrentItem({});
    setOperateType("create");
  };

  // 编辑事件
  const handleEditClick = record => {
    // 根节点不加载
    if (record.parentId === '0' || !record.parentId) {
      return;
    }
    Http.get(API.DICT_GET, record.id)
          .then(res => {
            setCurrentItem(res.data);
            setOperateType("edit");
          })
  };

  // 删除事件
  const handleDeleteClick = record => {
    Http.get(API.DICT_DEL, record.id)
           .then(() => {
              fetch();
            })
  };

  // 搜索
  const handleOnSearch = v => {
    setSearch(v)
  };

  const columns = [
    {
      title: '字典描述',
      dataIndex:'name',
    },
    {
      title: '字典编码',
      dataIndex:'code',
    },
    {
      title: '操作',
      render: (text, record) =>
        record.status !== '9999' &&
        !record.parent &&
        record.parent !== '0' && (
          <>
            {/* <a onClick={e => handleEditClick(record, e)}>编辑</a>
            <Divider type="vertical" /> */}
            <Popconfirm
              title="删除后系统中部分数据可能无法正确显示,确定要删除吗？"
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

  const dataTableProps = {
    columns,
    bordered: true,
    defaultExpandAllRows: true,
    rowKey: record => record.id,
    loading,
    isScroll: true,
    alternateColor: true,
    dataSource: dictFilter(data, search),
    onRow: (record, index) => ({
      onClick: () => handleEditClick(record, index),
    }),
    pagination: false,
  };

  return (
    <div>
      {/* 工具条 */}
      <Row style={{ padding: '10px 5px' }}>
        <Col span={4}>
          <Button type="primary" onClick={() => handleAddClick()}>
            新增
          </Button>
        </Col>
        <Col span={20}>
          <Search
            placeholder="输入编码或名称进行搜索"
            className={css.search}
            onSearch={v => handleOnSearch(v)}
          />
        </Col>
      </Row>

      <Table {...dataTableProps} className={css.grid}  />
    </div>
  );
}
