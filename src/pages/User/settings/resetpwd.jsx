import React, { Component } from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Form, Input, Modal, Tooltip } from 'antd';
import { PasswordInput } from 'antd-password-input-strength';
import { MD5 } from "jscrypto/es6/MD5";
import { connect } from 'umi';

const FormItem = Form.Item;

@connect(state => ({
  global: state.global,
  submitting: state.loading.effects['global/repwd'],
}))
export default class AOEForm extends Component {
  formRef = React.createRef();

  // 关闭窗口
  handleCloseForm = () => {
    this.props.dispatch({
      type: 'global/updateState',
      payload: {
        repwd: false,
      },
    });
  };

  // 保存
  handleSaveClick = () => {
    const { dispatch } = this.props;
    const { validateFields, setFieldsValue } = this.formRef.current;
    validateFields().then(values => {
      const data = {
        ...values,
      };
      if(data.newpassword !== data.repassword){
        Modal.error({
          title: '错误',
          content: '两次输入的密码不一致,请确认后重新输入.'
        });
        setFieldsValue({
          newpassword: '',
          repassword: ''
        })
        return;
      }
      // 加密密码
      data.originpassword = MD5.hash(data.originpassword).toString();
      data.newpassword = MD5.hash(data.newpassword).toString();
      data.repassword = MD5.hash(data.repassword).toString();

      dispatch({
        type: 'global/repwd',
        payload: data,
      });
    });
  };

  // 渲染界面
  render() {
    const { modalType, submitting } = this.props;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 14 },
    };
    return (
      <Modal
        maskClosable={false}
        centered
        confirmLoading={submitting}
        cancelText="取消修改"
        okText="确认修改"
        onCancel={() => this.handleCloseForm()}
        open={modalType !== ''}
        width={496}
        onOk={() => this.handleSaveClick()}
        title="修改密码"
      >
        <Form {...formItemLayout} ref={this.formRef}>
          <FormItem label="原始密码" id="originpassword" rules={[{ required: true, message: '请输入原始密码' }]}>
           <Input.Password name="originpassword" placeholder="请输入原始密码" autoComplete="new-password" />
          </FormItem>

          <FormItem
            name="newpassword"
            rules={[
              {
                required: true,
                whitespace: true,
                pattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/,
                message: '请输入8-16位包含数字及字母的密码',
              },
            ]}
            label={
              <span>
                密码&nbsp;
                <Tooltip title="密码应为 8-12 位的数字字母组合(不含空格)">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
          >
           <PasswordInput autoComplete="off" />
          </FormItem>

          <FormItem
            name="repassword"
            rules={[
              {
                required: true,
                whitespace: true,
                pattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/,
                message: '请输入8-16位包含数字及字母的密码',
              },
            ]}
            label={
              <span>
                确认密码&nbsp;
                <Tooltip title="密码应为 8-12 位的数字字母组合(不含空格)">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
          >
            <PasswordInput autoComplete="off" />
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
