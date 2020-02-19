import React, { Component } from 'react';
import { Form, Input, Modal, Tooltip, Icon } from 'antd';
import { PasswordInput } from 'antd-password-input-strength';
import md5 from 'md5';
import { connect } from 'dva';

const FormItem = Form.Item;

@Form.create()
@connect(state => ({
  global: state.global,
  submitting: state.loading.effects['global/repwd'],
}))
export default class AOEForm extends Component {
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
    const { getFieldsValue, validateFields, setFieldsValue } = this.props.form;
    validateFields(errors => {
      if (errors) {
        return;
      }
      const data = {
        ...getFieldsValue(),
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
      data.originpassword = md5(data.originpassword);
      data.newpassword = md5(data.newpassword);
      data.repassword = md5(data.repassword);

      dispatch({
        type: 'global/repwd',
        payload: data,
      });
    });
  };

  // 渲染界面
  render() {
    const { getFieldDecorator } = this.props.form;
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
        visible={modalType !== ''}
        width={496}
        onOk={() => this.handleSaveClick()}
        title="修改密码"
      >
        <Form {...formItemLayout}>
          <FormItem label="原始密码">
            {getFieldDecorator('originpassword', {
              rules: [{ required: true, message: '请输入原始密码' }],
            })(<Input.Password name="originpassword" placeholder="请输入原始密码" autoComplete="new-password" />)}
          </FormItem>
          <FormItem
            label={
              <span>
                密码&nbsp;
                <Tooltip title="密码应为 8-12 位的数字字母组合(不含空格)">
                  <Icon type="question-circle-o" />
                </Tooltip>
              </span>
            }
          >
            {getFieldDecorator('newpassword', {
              rules: [
                {
                  required: true,
                  whitespace: true,
                  pattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/,
                  message: '请输入8-16位包含数字及字母的密码',
                },
              ],
            })(<PasswordInput autoComplete="off" />)}
          </FormItem>
          <FormItem
            label={
              <span>
                确认密码&nbsp;
                <Tooltip title="密码应为 8-12 位的数字字母组合(不含空格)">
                  <Icon type="question-circle-o" />
                </Tooltip>
              </span>
            }
          >
            {getFieldDecorator('repassword', {
              rules: [
                {
                  required: true,
                  whitespace: true,
                  pattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/,
                  message: '请输入8-16位包含数字及字母的密码',
                },
              ],
            })(<PasswordInput autoComplete="off" />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
