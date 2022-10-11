import React, { useState, useEffect } from 'react';
import { Modal, Table, Checkbox } from 'antd';

import Http from '@/utils/http';
import API from '@/apis';

export default (props) => {
  const { fetch, operateType, setOperateType, roleId, setRoleId } = props;

  const [ loading, setLoading ] = useState(true);
  const [ checked, setChecked ] = useState([]);
  const [ records, setRecords ] = useState([]);
  const [ checkedResource, setCheckedResource ] = useState([]);

  useEffect( () => {
    setLoading(true);
    if(roleId){
      Http.list(API.ROLE_LISTMOUDLE, {roleId}).then((res) => {
        setLoading(false);
        setChecked(res.data.checked);
        setRecords(res.data.modules);
        setCheckedResource(res.data.checkedResource);
      })
    } else {
      setLoading(false);
      setChecked([]);
      setRecords([]);
      setCheckedResource([]);
    }
  }, [roleId]);

  // 保存模块关系
  const handleSubmit = () => {

    const modules = checked && checked.map(item => ({ moduleId: item }));

    Http.post(API.ROLE_SAVEMODULE, {
      id: roleId,
      modules,
      resources: checkedResource,
    }).then(() => {
      setOperateType("");
      setRoleId(null);
      fetch()
    });
  };

  const handleClose = () => {
    setOperateType("");
    setRoleId(null);
  }

  // 勾选角色 暂存已选
  const handleChangeRows = checkedKeys => {
    setChecked(checkedKeys);
  };

  // 行选
  const handleSelectRows = (record, isSelected) => {
    // 选择角色自动勾选一个资源
    if (
      isSelected &&
      record.resources &&
      (!checkedResource[record.id] || checkedResource[record.id].length < 1)
    ) {
      checkedResource[record.id] = [];
      if (record.resources[0]) {
        checkedResource[record.id].push(record.resources[0].id);
      }
    }
    // 去除角色 清空资源选择
    if (checkedResource[record.id] && !isSelected) {
      checkedResource[record.id] = [];
    }
  };

  // 保存已选资源
  const handleResourceClick = (e, rid) => {
    if (e.length < 1) {
      Modal.warning({
        title: '警告',
        content: '至少选择一个资源',
      });
      return;
    }
    checkedResource[rid] = e;
    // 勾选资源自动选择菜单
    if (e.length > 0 && checked.indexOf(rid) < 0) {
      checked.push(rid);
    }

    setChecked(checked);
    setRecords(records);
    setCheckedResource(checkedResource);
  };

  const columns = [
    {
      title: '模块名称',
      dataIndex: 'name',
    },
    {
      title: '资源权限',
      align: 'left',
      dataIndex: 'resources',
      render: (item, record) => {
        const options = item && item.map(r => ({ label: r.resourceDesc, value: r.id }));

        const rsr = checkedResource[record.id];
        // eslint-disable-next-line max-len
        return (
          <Checkbox.Group
            options={options}
            value={rsr}
            onChange={e => handleResourceClick(e, record.id)}
          />
        );
      },
    },
  ];

  const rowSelection = {
    selectedRowKeys: checked,
    onSelect: (record, isSelected) => handleSelectRows(record, isSelected),
    onChange: selectedKeys => handleChangeRows(selectedKeys),
  };

  return (
    <Modal
      open={operateType === 'Module'}
      maskClosable={false}
      loading={loading}
      title="选择授权模块"
      okText="确定"
      cancelText="关闭"
      width="45%"
      centered
      onOk={() => handleSubmit()}
      onCancel={() => handleClose()}
      bodyStyle={{ height: 456, maxHeight: 456, padding: 0, overflowY: 'auto' }}
    >
     {
      ( records && records.length ) ?
        <Table
          size="small"
          loading={loading}
          style={{ height: 456, maxHeight: 456 }}
          defaultExpandAllRows
          columns={columns}
          dataSource={records}
          pagination={false}
          rowKey={record => record.id}
          rowSelection={rowSelection}
        /> : null
     }
    </Modal>
  );
}
