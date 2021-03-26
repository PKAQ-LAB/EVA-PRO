import React, { useState } from 'react';
import { CheckOutlined, CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { Table, Switch, Alert, Popconfirm, Divider, Button, Input, message, notification, } from 'antd';
import cx from 'classnames';
import { hasChildren, getNodeBorther } from '@/utils/DataHelper';
import BizIcon from '@/components/BizIcon';

import Service from '@/services/service';
import API from '@/apis';

const { Search } = Input;

// 部门管理列表
export default (props) => {
  const [ selectedRowKeys, setSelectedRowKeys ] = useState([]);
  const { fetch, data, loading, setOperateType, setCurrentItem } = props;
  // 新增
  const handleAdd = record => {
    setCurrentItem({
      parentId: record.id,
    })
    setOperateType("create");
  };

  // 编辑
  const handleEdit = record => {
    if (!record.id) {
      notification.error('没有选择记录');
      return;
    }
    Service.get(API.ORG_GET, record.id).then((res) => {
      setCurrentItem(res.data);
      setOperateType("edit");
    })
  };

  // 启用/停用
  const handleEnable = (record, checked) => {
    if (!record.id) {
      notification.error('没有选择记录');
      return;
    }
    Service.post(API.ORG_STATUS, {
      id: record.id,
      status: checked ? '0000' : '0001',
    }).then(() => {
      fetch();
    })
  };

  // 删除
  const handleDelete = record => {
    // 存在子节点的不允许删除
    const blockItem = hasChildren(data, selectedRowKeys);

    if (record.isLeaf || blockItem) {
      message.error(`错误： [${record.name}] 存在子节点,无法删除.`);
    } else {
      Service.post(API.ORG_DEL, { param: [record.id],})
      .then(() => fetch())
    }
  };

  // 批量删除
  const handleBatchDelete = () => {
    // 存在子节点的不允许删除
    const blockItem = hasChildren(data, selectedRowKeys);
    if (blockItem) {
      message.error(`错误： [${blockItem}] 存在子节点,无法删除.`);
    } else {
      Service.post(API.ORG_DEL, { param: selectedRowKeys,})
      .then(() => fetch())
    }
    // end if/else
  };

  // 搜索
  const handleSearch = val => {
    fetch({name: val,})
  };

  // 排序操作
  const handleSort = (nodes, index, upOrDown) => {
    const orginOrders = index;
    const targetID = upOrDown === 'up' ? nodes[index - 1].id : nodes[index + 1].id;
    const targetOrders = upOrDown === 'up' ? index - 1 : index + 1;
    const switchObj = [
      {
        id: nodes[index].id,
        orders: targetOrders,
      },
      {
        id: targetID,
        orders: orginOrders,
      },
    ];
    Service.post(API.ORG_SORT, {...switchObj}).then(() => fetch());
  };

  const column = [
    {
      title: '单位/部门名称',
      dataIndex: 'name',
    },
    {
      title: '所属单位/部门',
      dataIndex: 'parentName',
    },
    {
      title: '排序',
      dataIndex: 'orders',
      render: (text, record, index) => {
        if (record.status === '0000') {
          const brother = getNodeBorther(data, record.parentId);
          const size = brother.length;
          return (
            <div>
              {text}
              <Divider type="vertical" />
              {size !== 0 && index !== size - 1 ? (
                <BizIcon
                  onClick={() => handleSort(brother, index, 'down')}
                  type="descending"
                  style={{ color: '#098FFF', cursor: 'pointer' }}
                />
              ) : (
                <BizIcon type="descending" />
              )}
              {size !== 0 && index !== 0 ? (
                <BizIcon
                  onClick={() => handleSort(brother, index, 'up')}
                  style={{ color: '#098FFF', cursor: 'pointer' }}
                  type="ascending"
                />
              ) : (
                <BizIcon type="ascending" />
              )}
            </div>
          );
        }
        return '';
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (text, record) =>
        record.status !== '9999' && (
          <Switch
            onChange={checked => handleEnable(record, checked)}
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            checked={text === '0000'}
          />
        ),
    },
    {
      title: '操作',
      render: (text, record) =>
        record.status === '0000' && (
          <div>
            <a onClick={() => handleAdd(record)}>添加下级</a>
            <Divider type="vertical" />
            <a onClick={() => handleEdit(record)}>编辑</a>
            <Divider type="vertical" />
            <Popconfirm
              title="确定要删除吗？"
              okText="确定"
              cancelText="取消"
              onConfirm={() => handleDelete(record)}
            >
              <a>删除</a>
            </Popconfirm>
          </div>
        ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: selectedKeys => setSelectedRowKeys(selectedKeys),
    getCheckboxProps: record => ({
      disabled: record.status === '9999',
    }),
  };

  return (
    <div style={{ padding: 15 }}>
      <div className="eva-ribbon">
        <div>
          <Button icon={<PlusOutlined />} type="primary" onClick={() => handleAdd('')} loading={loading}>
            新增部门
          </Button>
          {selectedRowKeys.length > 0 && (
            <span>
              <Popconfirm
                title="确定要删除选中的条目吗?"
                placement="top"
                onConfirm={() => handleBatchDelete()}
              >
                <Button style={{ marginLeft: 8 }} type="danger" loading={loading}>
                  删除部门
                </Button>
              </Popconfirm>
            </span>
          )}
        </div>
        <div>
          <Search
            placeholder="输入组织名称以搜索"
            onSearch={value => handleSearch(value)}
            style={{ width: '100%' }}
          />
        </div>
      </div>
      <div className="eva-body">
        {/* 已选提示 */}
        {selectedRowKeys.length > 0 && (
          <Alert
            style={{ marginTop: 8, marginBottom: 8 }}
            message={
              <div>
                已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项&nbsp;&nbsp;
                <a style={{ marginLeft: 24 }} onClick={() => setSelectedRowKeys([])}>
                  清空选择
                </a>
              </div>
            }
            type="info"
            showIcon
          />
        )}

        {/* 列表 */}
        <Table
          pagination={false}
          dataSource={data}
          loading={loading}
          columns={column}
          rowKey={record => record.id}
          rowSelection={rowSelection}
          onRow = {
            (record) => ({
              onDoubleClick: () => handleEdit(record, 'view'),
            })
          }
          rowClassName={record =>
            cx({ 'eva-locked': record.status === '0001', 'eva-disabled': record.status === '9999' })
          }
        />
      </div>
    </div>
  );
}
