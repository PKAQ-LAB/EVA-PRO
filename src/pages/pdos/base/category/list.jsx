import React, { useState } from 'react';
import { CheckOutlined, CloseOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Table,
  Switch,
  Alert,
  Popconfirm,
  Divider,
  Button,
  Input,
  message,
  notification,
} from 'antd';
import cx from 'classnames';
import { hasChildren } from '@/utils/DataHelper';
import { getCategory, switchCategory, deleteCategory } from './services/categorySvc';

const { Search } = { ...Input };

// 列表
export default (props) => {
  const { setOperateType, setCurrentItem, fetch, loading, data = [] } = props;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // 新增
  const handleAdd = record => {
    setCurrentItem({parentId : record.id});
    setOperateType("create");
  };

  // 编辑
  const handleEdit = record => {
    if (!record.id) {
      notification.error('没有选择记录');
      return;
    }

    getCategory({
      id: record.id
    }).then( res => {
      setCurrentItem(res.data);
      setOperateType("create");
    })
  };

  // 启用/停用
  const handleEnable = (record, checked) => {
    if (!record.id) {
      notification.error('没有选择记录');
      return;
    }
    switchCategory({
      id: record.id,
      status: checked ? '0000' : '0001',
      record,
    }).then(() => {
      fetch();
    })
  };

  // 删除
  const handleDelete = record => {

    // 存在子节点的不允许删除
    const blockItem = hasChildren(data, selectedRowKeys);

    if (!!record.isLeaf || blockItem) {
      message.error(`错误： [${record.name}] 存在子节点,无法删除.`);
    } else {
      deleteCategory({
        param: [record.id],
      }).then(() => {
        fetch();
      })
    }
  };

  // 批量删除
  const handleBatchDelete = () => {
    // 存在子节点的不允许删除
    const blockItem = hasChildren(data, selectedRowKeys);
    if (blockItem) {
      message.error(`错误： [${blockItem}] 存在子节点,无法删除.`);
    } else {
      deleteCategory({
        param: selectedRowKeys,
      }).then(() => {
        fetch();
      })
    }
  };

  // 搜索
  const handleSearch = val => {
    fetch(val);
  };

  const column = [
    {
      title: '分类编码',
      width: 120,
      dataIndex: 'code',
    },
    {
      title: '分类名称',
      dataIndex: 'name',
    },
    {
      title: '状态',
      width: 120,
      dataIndex: 'status',
      render: (text, record) => (
        <Switch
          onChange={checked => handleEnable(record, checked)}
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
          checked={text === '0000'}
        />
      ),
    },
    {
      title: '',
      width: 150,
      render: (text, record) => (
        <div>
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
    onChange: selectedKeys => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  return (
    <>
      <div className="eva-ribbon">
        <div>
          <Button icon={<PlusOutlined />} type="primary" onClick={() => handleAdd('')}>
            新增分类
          </Button>
          {selectedRowKeys.length > 0 && (
            <span>
              <Popconfirm
                title="确定要删除选中的条目吗?"
                placement="top"
                onConfirm={() => handleBatchDelete()}
              >
                <Divider type="vertical" />
                <Button icon={<DeleteOutlined />} type="danger">
                  删除分类
                </Button>
              </Popconfirm>
            </span>
          )}
        </div>
        <Search
          placeholder="输入分类名称以搜索"
          onSearch={value => handleSearch(value)}
          style={{ width: 300 }}
        />
      </div>
      {/* 已选提示 */}
      <div className="eva-alert">
      {
        selectedRowKeys.length > 0
        &&
        <Alert
          message={
            <div>
              已选择 已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a>{' '}
              项&nbsp;&nbsp;
              <a style={{ marginLeft: 24 }} onClick={() => setSelectedRowKeys([])}>
                清空选择
              </a>
            </div>
          }
          type="info"
          showIcon
        />
      }
      </div>
      {/* 列表 */}
      <div className={cx("eva-body","alternate-table")}>
        <Table
          columns={column}
          dataSource={data}
          loading={loading}
          defaultExpandAllRows
          pagination={false}
          rowClassName={record =>
            cx({ 'eva-locked': record.status === '0001', 'eva-disabled': record.status === '9999' })
          }
          rowKey={record => record.id}
          rowSelection={rowSelection}
        />
      </div>
    </>
  );
}
