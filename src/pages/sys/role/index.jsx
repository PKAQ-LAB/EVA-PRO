import React from 'react';
import { connect } from 'dva';
import { Alert, Button, Divider, Popconfirm } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Form, Input } from 'antx';
import List from './list';
import AOEForm from './aoeform';
import RoleUser from './component/roleuser';
import RoleConfig from './component/roleconfig';
import RoleModule from './component/rolemodule';
/**
 * 角色（权限）管理 主界面
 */
@Form.create()
@connect(state => ({
  role: state.role,
  loading: state.loading.role,
}))
export default class Role extends React.PureComponent {
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
    const { dispatch, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
      };

      dispatch({
        type: 'role/fetchRoles',
        payload: values,
      });
    });
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
    return (
      <>
        <Button
          type="primary"
          icon="plus"
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
                <Button style={{ marginLeft: 8 }} type="danger" icon="remove" loading={loading}>
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
              icon="lock"
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
              icon="unlock"
              style={{ marginLeft: 8 }}
              onClick={() => this.handleLockSwitch('0000')}
              loading={loading}
            >
              启用角色
            </Button>
          </>
        )}
      </>
    );
  }

  // 简单搜索条件
  renderSearchForm() {
    const { form } = this.props;
    const { loading } = this.props.role;

    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };

    return (
      <Form api={form} {...formItemLayout} colon layout="inline" onSubmit={this.handleSearch}>
        <Input label="角色名称" id="name" />

        <Input label="角色编码" id="code" />
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
    const { form } = this.props;
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
          <List searchForm={form} />
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
