import React from 'react';
import { connect } from 'dva';
import { Alert, Button, Divider, Popconfirm } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Form, Input } from 'antx';
import css from './index.less';
import List from './list';
import AOEForm from './aoeform';
/**
 * 角色（权限）管理 主界面
 */
@Form.create()
@connect(state => ({
  role: state.role,
  loading: state.loading.role,
}))
export default class Role extends React.PureComponent {
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

  // 操作按钮
  renderButton(selectedRowKeys) {
    const { loading } = this.props.role;
    return (
      <>
        <Button
          type="primary"
          onClick={() => this.handleModalVisible(true, 'create')}
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
              停用
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
              启用
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
    const { modalType, selectedRowKeys } = this.props.role;
    return (
      <PageHeaderWrapper>
        {/* 工具条 */}
        <div className={css.ribbon}>
          {/* 操作按钮 */}
          <div>{this.renderButton(selectedRowKeys)}</div>
          {/* 查询条件 */}
          <div>{this.renderSearchForm()}</div>
        </div>
        {/* 删除条幅 */}
        <div className={css.alert}>
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
        </div>
        <div className={css.body}>
          <List />
        </div>
        {modalType !== '' && <AOEForm />}
      </PageHeaderWrapper>
    );
  }
}
