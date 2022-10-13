import React, { useState, useEffect } from 'react';
import { Modal, Tree, Card, Row, Col, Table } from 'antd';
import cs from './roleuser.less';

import Http from '@/utils/http';
import API from '@/services/apis';

// 授权用户窗口
export default (props) => {
  const [ checked, setChecked ] = useState([]);
  const [ records, setRecords ] = useState([]);
  const [ orgs, setOrgs ] = useState([]);
  const [ loading, setLoading ] = useState(false);

  const { fetch, operateType, setOperateType, roleId, setRoleId } = props;

  useEffect( () => {
    if(roleId){
      Http.list(API.ORG_LIST).then(res => {
        setOrgs(res.data);
      })

      Http.list(API.ROLE_LISTUSER, {roleId}).then((res) => {
        setChecked(res.data.checked);
        setRecords(res.data.users);
      })
    } else {
      setChecked([]);
      setRecords([]);
    }
  }, [roleId]);

  const handleClose = () => {
    setOperateType("");
    setRoleId(null);
  }

  // 树节点选择
  const handleTreeSelect = selectedKeys => {
    const values = {
      roleId,
      deptId: selectedKeys[0],
    };

    Http.list(API.ROLE_LISTUSER, values).then((res) => {
      setChecked(res.data.checked);
      setRecords(res.data.users);
    })
  };

  // 保存模块关系
  const handleSubmit = () => {
    setLoading(true);
    let users = [];
    if (checked && checked.length > 0) {
      users = checked.map(item => ({ userId: item }));
    }
    Http.post(API.ROLE_SAVEUSER, {
      id: roleId,
      users,
    }).then(() => {
      setLoading(false);
      setOperateType("");
      fetch();
    })
  };

  // 保存已选
 const handleSelectRows = checkedKeys => {
    setChecked(checkedKeys);
  };

    const columns = [
      {
        title: '姓名',
        dataIndex: 'name',
      },
      {
        title: '账号',
        dataIndex: 'account',
      },
      {
        title: '所属部门',
        dataIndex: 'deptName',
      },
      {
        title: '手机',
        dataIndex: 'tel',
      },
    ];

    const rowSelection = {
      selectedRowKeys: checked,
      onChange: (record) => handleSelectRows(record),
    };

    const dataTableProps = {
      columns,
      rowKey: 'id',
      showNum: true,
      isScroll: true,
      alternateColor: true,
      rowSelection,
      selectedRowKeys: checked,
      dataSource:records,
    };

    return (
      <Modal
        confirmLoading={loading}
        maskClosable={false}
        open={operateType === 'User'}
        title="选择授权用户"
        okText="保存"
        cancelText="关闭"
        centered
        onOk={() => handleSubmit()}
        onCancel={() => handleClose()}
        width="60%"
        bodyStyle={{ overflowY: 'auto', overflowX: 'auto', padding: 0 }}
      >
        <Row>
          <Col span={6}>
            <Card title="所属部门" className={cs.orgtree}>
              <Tree
                showLine
                blockNode
                onSelect={(sr) => handleTreeSelect(sr)}
                treeData={orgs}
                style={{ height: 456, maxHeight: 456, overflowY: 'auto' }}
              />
            </Card>
          </Col>
          <Col span={18}>
            <Table {...dataTableProps} scroll={{ y: 466 }} className={cs.table} />
          </Col>
        </Row>
      </Modal>
    );
}
