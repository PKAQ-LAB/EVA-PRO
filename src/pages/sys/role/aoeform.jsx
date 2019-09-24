import React, { Component } from 'react';
import { connect } from 'dva';
import { Row, Col, Modal, TreeSelect } from 'antd';
import { Form, Input } from 'antx';
import Selector from '@/components/Selector';

@Form.create()
@connect(state => ({
  role: state.role,
  submitting: state.loading.effects['role/save'],
}))
export default class AOEForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDept: false,
    };
  }

  // 校验角色编码唯一性
  // eslint-disable-next-line consistent-return
  checkCode = (rule, value, callback) => {
    const { getFieldValue } = this.props.form;
    const code = getFieldValue('code');
    const { currentItem } = this.props.role;

    if (currentItem && currentItem.id && value === currentItem.code) {
      return callback();
    }
    const data = { code };
    this.props
      .dispatch({
        type: 'role/checkUnique',
        payload: data,
      })
      .then(r => {
        if (r.code === 0) {
          return callback();
        }
        return callback(r.message);
      });
  };

  // 关闭窗口
  handleCloseForm = () => {
    this.props.dispatch({
      type: 'role/updateState',
      payload: {
        modalType: '',
      },
    });
  };

  // 数据权限
  handleDataPermissionChange = v => {
    this.setState({
      showDept: v === '0003',
    });
    this.props.dispatch({
      type: 'role/listDepts',
    });
  };

  // 保存
  handleSaveClick = () => {
    const { currentItem } = this.props.role;
    const { getFieldsValue, validateFields } = this.props.form;
    validateFields(errors => {
      if (errors) {
        return;
      }
      const data = {
        ...getFieldsValue(),
      };
      if (currentItem && currentItem.id) {
        data.id = currentItem.id;
      }

      this.props.dispatch({
        type: 'role/save',
        payload: data,
      });
    });
  };

  // 渲染界面
  render() {
    const { showDept } = this.state;
    const { modalType, currentItem, orgs } = this.props.role;
    const { loading, form } = this.props;

    const title = { create: '新增', edit: '编辑', view: '查看' };

    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };

    const formRowOne = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    };

    currentItem.permission = currentItem.permission || '0000';

    return (
      <Modal
        maskClosable={false}
        confirmLoading={loading}
        onCancel={() => this.handleCloseForm()}
        visible={modalType !== ''}
        width={600}
        onOk={() => this.handleSaveClick()}
        title={`${title[modalType] || ''}角色`}
      >
        <Form api={form} {...formItemLayout} colon data={currentItem}>
          <Row>
            <Col span={12}>
              <Input
                label="角色名称"
                id="name"
                rules={['required']}
                max={30}
                msg="full"
                disabled={modalType === 'view'}
              />
            </Col>
            <Col span={12}>
              <Input
                label="角色编码"
                id="code"
                rules={[
                  {
                    required: true,
                    message: '编码格式错误',
                    whitespace: true,
                    pattern: /^[0-9a-zA-Z_]{4,16}$/,
                  },
                  {
                    validator: this.checkCode,
                  },
                ]}
                validateTrigger="onBlur"
                max={12}
                msg="full"
              />
            </Col>
          </Row>

          <Input
            textarea
            label="角色描述"
            id="remark"
            rules={['max=200']}
            max={60}
            msg="full"
            {...formRowOne}
          />

          <Selector
            label="数据权限"
            code="data_permission"
            id="permission"
            onChange={this.handleDataPermissionChange}
            showAll={false}
            {...formRowOne}
          />

          {showDept && (
            <TreeSelect
              label="选择部门"
              id="depts"
              treeData={orgs}
              treeCheckable
              allowClear
              multiple
              {...formRowOne}
            />
          )}
        </Form>
      </Modal>
    );
  }
}
