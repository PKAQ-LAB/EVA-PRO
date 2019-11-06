import React, { Component } from 'react';
import { connect } from 'dva';
import { Row, Col, Modal, TreeSelect } from 'antd';
import { Form, Input } from 'antx';
import Selector from '@src/components/Selector';

@Form.create()
@connect(state => ({
  global: state.global,
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

  componentWillMount() {
    const { currentItem } = this.props.role;
    if (currentItem.dataPermissionType) {
      currentItem.dataPermissionType = currentItem.dataPermissionType || '0000';
      this.handleDataPermissionChange(currentItem.dataPermissionType);
    }

    if (currentItem.dataPermissionDeptid && typeof currentItem.dataPermissionDeptid === 'string') {
      currentItem.dataPermissionDeptid = currentItem.dataPermissionDeptid.split(',');
    }
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
      if (data.dataPermissionDeptid) {
        data.dataPermissionDeptid = data.dataPermissionDeptid.join(',');
      }

      this.props.dispatch({
        type: 'role/save',
        payload: data,
      });
    });
  };

  // 渲染界面
  render() {
    const { dict } = this.props.global;
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
                    message: '角色编码格式错误,仅允许使用(4-30位)字母或数字.',
                    whitespace: true,
                    pattern: /^[0-9a-zA-Z_]{4,30}$/,
                  },
                  {
                    validator: this.checkCode,
                  },
                ]}
                validateTrigger="onBlur"
                min={4}
                max={30}
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
            data={dict.data_permission}
            id="dataPermissionType"
            rules={['required']}
            onChange={this.handleDataPermissionChange}
            showAll={false}
            {...formRowOne}
          />

          {(showDept || currentItem.dataPermissionType === '0003') && (
            <TreeSelect
              label="选择部门"
              id="dataPermissionDeptid"
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
