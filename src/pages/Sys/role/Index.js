import React, { PureComponent } from 'react';
import { Card, Form, Popconfirm, Input, Button } from 'antd';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import List from './List';
import RoleModule from './RoleModule';
import RoleUser from './RoleUser';
import RoleConfig from './RoleConfig';
import AOEForm from './AOEForm';

const FormItem = Form.Item;

@Form.create()
@connect(state => ({
  role: state.role,
  loading: state.loading.models.role,
}))
export default class Role extends PureComponent {
  // 关闭窗口
  handleCancel = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'role/updateState',
      payload: {
        operateType: '',
      },
    });
  };

  // 新增窗口
  handleModalVisible = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'role/updateState',
      payload: {
        modalType: 'create',
        currentItem: {},
      },
    });
  };

  // 解锁/锁定
  handleLockSwitch = status => {
    const {
      role: { selectedRowKeys },
    } = this.props;

    this.props.dispatch({
      type: 'role/lockSwitch',
      payload: {
        param: selectedRowKeys,
        status,
      },
    });
  };

  // 重置事件
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    dispatch({
      type: 'role/updateState',
      payload: {
        name: '',
        code: '',
      },
    });
    dispatch({
      type: 'role/listRole',
    });
  };

  // 批量删除
  handleRemoveClick = () => {
    const {
      dispatch,
      role: { selectedRowKeys },
    } = this.props;

    if (!selectedRowKeys) return;

    dispatch({
      type: 'role/remove',
      payload: {
        param: selectedRowKeys,
      },
    });
  };

  // 搜索事件
  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;
    // 表单验证
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };
      dispatch({
        type: 'role/updateState',
        payload: {
          name: form.getFieldValue('name'),
          code: form.getFieldValue('code'),
        },
      });
      dispatch({
        type: 'role/listRole',
        payload: values,
      });
    });
  };

  renderLeftBtn() {
    const { selectedRowKeys } = this.props.role;

    return (
      <div>
        <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true, 'create')}>
          新增角色
        </Button>
        {selectedRowKeys.length > 0 && (
          <Button
            icon="lock"
            type="default"
            style={{ marginLeft: 8 }}
            onClick={() => this.handleLockSwitch('0001')}
          >
            锁定
          </Button>
        )}
        {selectedRowKeys.length > 0 && (
          <Button
            icon="unlock"
            type="danger"
            style={{ marginLeft: 8 }}
            onClick={() => this.handleLockSwitch('0000')}
          >
            解锁
          </Button>
        )}
        {selectedRowKeys.length > 0 && (
          <span>
            <Popconfirm
              title="确定要删除所选角色吗?"
              placement="top"
              onConfirm={this.handleRemoveClick}
            >
              <Button style={{ marginLeft: 8 }} type="danger" icon="remove">
                删除角色
              </Button>
            </Popconfirm>
          </span>
        )}
      </div>
    );
  }

  renderRightBtn() {
    return (
      <div>
        <Button type="primary" htmlType="submit">
          查询
        </Button>
        <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
          重置
        </Button>
      </div>
    );
  }

  // 简单搜索条件
  renderSimpleForm() {
    const { getFieldDecorator } = this.props.form;
    const { name, code } = this.props.role;
    return (
      <Form onSubmit={this.handleSearch} layout="inline" style={{ marginLeft: 8 }}>
        <FormItem label="角色名称">
          {getFieldDecorator('name', {
            initialValue: name,
          })(<Input placeholder="输入角色名称搜索" />)}
        </FormItem>
        <FormItem label="角色编码">
          {getFieldDecorator('code', {
            initialValue: code,
          })(<Input placeholder="输入角色编码搜索" />)}
        </FormItem>
        <FormItem>{this.renderRightBtn()}</FormItem>
      </Form>
    );
  }

  render() {
    const { dispatch, loading } = this.props;
    const {
      list,
      roleId,
      modalType,
      pagination,
      operateType,
      moduleData,
      userData,
      currentItem,
      selectedRowKeys,
    } = this.props.role;

    const listPops = {
      dispatch,
      loading,
      list,
      pagination,
      selectedRowKeys,
    };

    const modalProps = {
      roleId,
      dispatch,
      operateType,
    };

    const AOEProps = {
      item: modalType === 'create' ? {} : currentItem,
      modalType,
      dispatch,
      maskClosable: false,
      title: `${modalType === 'create' ? '新增角色' : '编辑角色'}`,
    };
    return (
      <PageHeaderWrapper>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {this.renderLeftBtn()}
            {this.renderSimpleForm()}
          </div>
          <List {...listPops} />
        </Card>
        {operateType === 'Module' && (
          <RoleModule {...modalProps} data={moduleData} handleCancel={() => this.handleCancel()} />
        )}
        {operateType === 'User' && (
          <RoleUser {...modalProps} data={userData} handleCancel={() => this.handleCancel()} />
        )}
        {operateType === 'Config' && (
          <RoleConfig {...modalProps} handleCancel={() => this.handleCancel()} />
        )}
        {/* 新增窗口 */}
        {modalType !== '' && <AOEForm {...AOEProps} />}
      </PageHeaderWrapper>
    );
  }
}
