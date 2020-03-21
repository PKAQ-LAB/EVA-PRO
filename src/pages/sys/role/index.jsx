import React from 'react';
import { connect } from 'umi';
import { Form, Input, Alert, Button, Divider, Popconfirm } from 'antd';
import { PlusOutlined, LockOutlined, UnlockOutlined, DeleteOutlined } from '@ant-design/icons';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import List from './list';
import AOEForm from './aoeform';
import RoleUser from './component/roleuser';
import RoleConfig from './component/roleconfig';
import RoleModule from './component/rolemodule';
/**
 * 角色（权限）管理 主界面
 */
@connect(state => ({
  role: state.role,
  loading: state.loading.role,
}))
export default class Role extends React.PureComponent {

  formRef = React.createRef();

  // 新增窗口
  handlAddClick = () => {
    this.props.dispatch({
      type: 'role/updateState',
      payload: {
        modalType: 'create',
        currentItem: {},
      },
    });
  };

  // 重置事件
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    dispatch({
      type: 'role/fetchRoles',
    });
  };

  // 搜索事件
  handleSearch = () => {
    const { dispatch } = this.props;
    const { validateFields } = this.formRef.current;
    validateFields().then(values => {

      dispatch({
        type: 'role/fetchRoles',
        payload: {...values},
      });
    })
  };

  // 解锁/锁定
  handleLockSwitch = status => {
    const { selectedRowKeys } = this.props.role;
    this.props.dispatch({
      type: 'role/lockSwitch',
      payload: {
        param: selectedRowKeys,
        status,
      },
    });
  };

  // 批量删除
  handleRemoveClick = () => {
    const { selectedRowKeys } = this.props.role;

    if (!selectedRowKeys) return;

    this.props.dispatch({
      type: 'role/remove',
      payload: {
        param: selectedRowKeys,
      },
    });
  };

  // 操作按钮
  renderButton(selectedRowKeys) {
    const { loading } = this.props.role;
    return <>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => this.handlAddClick('create')}
        loading={loading}
      >
        新增角色
      </Button>
      {selectedRowKeys.length > 0 && (
        <>
          <Divider type="vertical" />
          <span>
            <Popconfirm
              title="确定要删除所选角色吗?"
              placement="top"
              onConfirm={this.handleRemoveClick}
            >
              <Button style={{ marginLeft: 8 }} type="danger" icon={<DeleteOutlined />} loading={loading}>
                删除角色
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
            onClick={() => this.handleLockSwitch('0001')}
            loading={loading}
          >
            停用角色
          </Button>
        </>
      )}
      {selectedRowKeys.length > 0 && (
        <>
          <Divider type="vertical" />
          <Button
            icon={<UnlockOutlined />}
            style={{ marginLeft: 8 }}
            onClick={() => this.handleLockSwitch('0000')}
            loading={loading}
          >
            启用角色
          </Button>
        </>
      )}
    </>;
  }

  // 简单搜索条件
  renderSearchForm() {
    const { loading } = this.props.role;

    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };

    return (
      <Form {...formItemLayout} colon layout="inline" onSubmit={this.handleSearch} ref={this.formRef} >
        <Form.Item
          label="角色名称"
          name="name">
          <Input />
        </Form.Item>

        <Form.Item
          label="角色编码"
          name="code">
          <Input />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={loading}>
          查询
        </Button>
        <Divider type="vertical" />
        <Button htmlType="reset" onClick={() => this.handleFormReset()} loading={loading}>
          重置
        </Button>
      </Form>
    );
  }

  render() {
    const { modalType, selectedRowKeys, operateType } = this.props.role;

    return (
      <PageHeaderWrapper title="角色管理" subTitle="系统用户角色权限管理维护">
        {/* 工具条 */}
        <div className="eva-ribbon">
          {/* 操作按钮 */}
          <div>{this.renderButton(selectedRowKeys)}</div>
          {/* 查询条件 */}
          <div>{this.renderSearchForm()}</div>
        </div>
        {/* 删除条幅 */}
        <div className="eva-alert">
          {selectedRowKeys.length > 0 && (
            <Alert
              message={
                <div>
                  已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项&nbsp;&nbsp;
                  {selectedRowKeys.length > 0 && (
                    <a onClick={this.cleanSelectedKeys} style={{ marginLeft: 24 }}>
                      清空选择
                    </a>
                  )}
                </div>
              }
              type="info"
              showIcon
            />
          )}
        </div>
        <div className="eva-body">
          <List searchForm={this.formRef.current} />
        </div>
        {/* 新增窗口 */}
        {modalType !== '' && <AOEForm />}
        {/* 用户授权 */}
        {operateType === 'User' && <RoleUser />}
        {/* 配置授权 */}
        {operateType === 'Config' && <RoleConfig />}
        {/* 模块授权 */}
        {operateType === 'Module' && <RoleModule />}
      </PageHeaderWrapper>
    );
  }
}
