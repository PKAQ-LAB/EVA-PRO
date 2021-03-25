import React, { useEffect, useState } from 'react';
import { useRequest } from 'umi';
import { LockOutlined, UnlockOutlined, DeleteOutlined } from '@ant-design/icons';
import { Divider, Popconfirm, Form, Input, Button, Alert, Tree } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import SideLayout from '@/components/SideLayout';
import RoleModal from './rolemodal';
import List from './list';
import AOEForm from './aoeform';

import Service from '@/services/service';
import API from '@/apis';

export default () => {

  // 初始化数据
  const [ operateType, setOperateType ] = useState("");
  const [ roleModal, setRoleModal, ] = useState("");

  const [currentItem, setCurrentItem] = useState({});
  const [ orgs, setOrgs ] = useState([]);
  const [ roles, setRoles ] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [form] = Form.useForm();

  const { run, tableProps, loading } = useRequest(
    (param) => Service.list(API.ACCOUNT_LIST, param), {
    paginated: true,
  })

  useEffect(() => {
    Service.list(API.ORG_LIST).then((res) => {
      setOrgs(res.data);
    })
    Service.list(API.ROLE_LIST).then((res) => {
      setRoles(res.data);
    })
  }, []);

  // 列表属性
  const listProps = {
    roles,
    setRoleModal,
    selectedRowKeys,
    setSelectedRowKeys,
    fetch: run,
    setCurrentItem,
    setOperateType,
    tableProps,
  }

  // 表单属性
  const formPorps = {
    roles,
    orgs,
    operateType,
    fetch: run,
    currentItem,
    setOperateType
  }

  // 权限弹窗属性
  const roleModalProps = {
    roleModal,
    setRoleModal,
    roles,
    currentItem
  }

    // 解锁/锁定
  const handleLockSwitch = status => {
    Service.post(API.ACCOUNT_LOCK, {
      param: selectedRowKeys,
      status,
    })
  };

  // 搜索事件
  const handleSearch = () => {
    const { validateFields } = form;
    validateFields().then(values => {
      run({...values})
    });
  };

  // 重置事件
  const handleFormReset = () => {
    const { resetFields } = form;
    resetFields();
    run();
  };

  // 树节点选择
  const handleTreeSelect = selectedKeys => {
    const values = {
      deptId: selectedKeys[0],
    };
    run(values);
  };

  // 新增窗口
  const handleModalVisible = () => {
    setCurrentItem({});
    setOperateType("create");
  };

  // 批量删除
  const handleRemoveClick = () => {
    if (!selectedRowKeys) return;
    Service.post(API.ACCOUNT_DEL, { param: selectedRowKeys, })
  };

  // 渲染左侧树
  const renderTree = () => {
    return <Tree showLine blockNode onSelect={(selectedKeys) => handleTreeSelect(selectedKeys)} treeData={orgs} />;
  }

    // 操作按钮
  const renderButton = () => {
    return <>
      <Button type="primary" onClick={() => handleModalVisible(true, 'create')}>
        新增用户
      </Button>
      {selectedRowKeys.length > 0 && (
        <>
          <Divider type="vertical" />
          <span>
            <Popconfirm
              title="确定要删除所选用户吗?"
              placement="top"
              onConfirm={() => handleRemoveClick()}
            >
              <Button style={{ marginLeft: 8 }} type="danger" icon={<DeleteOutlined />}>
                删除用户
              </Button>
            </Popconfirm>
          </span>
        </>
      )}
      {selectedRowKeys.length > 0 && (
        <>
          <Divider type="vertical" />
          <Button
            icon={<LockOutlined />}
            style={{ marginLeft: 8 }}
            onClick={() => handleLockSwitch('0001')}
          >
            锁定
          </Button>
        </>
      )}
      {selectedRowKeys.length > 0 && (
        <>
          <Divider type="vertical" />
          <Button
            icon={<UnlockOutlined />}
            style={{ marginLeft: 8 }}
            onClick={() => handleLockSwitch('0000')}
          >
            解锁
          </Button>
        </>
      )}
    </>;
  }

  // 简单搜索条件
  const renderSearchForm = () => {
    return (
      <Form onFinish={() => handleSearch()} layout="inline" form={form}>
        <Form.Item label="帐号" name="account">
          <Input id="account-search" placeholder="输入帐号搜索" />
        </Form.Item>
        <Form.Item label="姓名" name="name">
          <Input id="account-name-search" placeholder="输入用户名称搜索" />
        </Form.Item>
        <Form.Item label="手机" name="tel">
          <Input id="account-phone-search" placeholder="输入手机号搜索" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            查询
          </Button>
          <Divider type="vertical" />
          <Button htmlType="reset" onClick={() => handleFormReset()} loading={loading}>
            重置
          </Button>
        </Form.Item>
      </Form>
    );
  }

  return (
    <PageContainer title="用户管理" subTitle="系统用户账号管理维护">
      <div className="eva-ribbon">
        {/* 操作按钮 */}
        <div>{renderButton()}</div>
        {/* 查询条件 */}
        <div>{renderSearchForm()}</div>
      </div>
      {/* 删除条幅 */}
      <div className="eva-alert">
        <Alert
          message={
            <div>
              已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项&nbsp;&nbsp;
              {selectedRowKeys.length > 0 && (
                <a onClick={setSelectedRowKeys([])} style={{ marginLeft: 24 }}>
                  清空选择
                </a>
              )}
            </div>
          }
          type="info"
          showIcon
        />
      </div>

      <div className="eva-body">
        <SideLayout
          title="所属部门"
          layoutStyle={{ minHeight: 'calc(100vh - 332px)' }}
          body={renderTree()}
        >
          {/* 用户列表 */}
          <List searchForm={form} {...listProps}/>
        </SideLayout>
      </div>
      {/* 新增窗口 */}
      {operateType !== '' && <AOEForm {...formPorps} />}
      {roleModal !== '' && <RoleModal {...roleModalProps}/>}
    </PageContainer>
  );

}
