import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Input, Row, Col, Modal, TreeSelect } from 'antd';
import Selector from '@src/components/Selector';

@connect(state => ({
  global: state.global,
  role: state.role,
  submitting: state.loading.effects['role/save'],
}))
export default class AOEForm extends React.PureComponent {
  formRef = React.createRef();

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
  checkCode = async (rule, value) => {

    const { currentItem } = this.props.role;

    if (currentItem && currentItem.id && value === currentItem.code) {
      return Promise.resolve();
    }

    this.props
      .dispatch({
        type: 'role/checkUnique',
        payload: {
          code: value
        },
      })
      .then(r => {
        if (r.code === 0) {
          return Promise.resolve();
        }
        return Promise.reject(r.message);
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

    const { validateFields } = this.formRef.current;
    validateFields().then( values => {
      const data = {
        ...values
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
    })
  };

  // 渲染界面
  render() {
    const { dict } = this.props.global;
    const { showDept } = this.state;
    const { modalType, currentItem, orgs } = this.props.role;
    const { loading } = this.props;

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
        centered
        onOk={() => this.handleSaveClick()}
        title={`${title[modalType] || ''}角色`}
      >
        <Form {...formItemLayout} colon initialValues={currentItem} ref={this.formRef} >
          <Row>
            <Col span={12}>
              <Form.Item
                  label="角色名称"
                  name="name"
                  rules={[{required: true,}]}>
                <Input max={30} disabled={modalType === 'view'}/>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                  label="角色编码"
                  name="code"
                  validateTrigger="onBlur"
                  rules={[
                    {
                      required: true,
                      message: '角色编码格式错误,仅允许使用(4-30位)字母或数字.',
                      whitespace: true,
                      pattern: /^[0-9a-zA-Z_]{4,30}$/,
                    },
                    {
                      validator: this.checkCode,
                    }
                  ]}>
                <Input min={4} max={30} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="角色描述"
                     name="remark"
                     {...formRowOne}>
            <Input.TextArea max={60} />
          </Form.Item>

          <Form.Item label="数据权限"
                     name="dataPermissionType"
                     rules={[{required: true,}]}
                     {...formRowOne} >
            <Selector
              data={dict.data_permission}
              onChange={this.handleDataPermissionChange}
              showall={false}
            />
          </Form.Item>

          {(showDept || currentItem.dataPermissionType === '0003') && (
             <Form.Item label="选择部门"
                        name="dataPermissionDeptid"
                        {...formRowOne}>
              <TreeSelect
                treeData={orgs}
                treeCheckable
                allowClear
                multiple
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    );
  }
}
