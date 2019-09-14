import React from 'react';
import { connect } from 'dva';
import { Modal, Row, Col, Switch, Tooltip, Icon, Upload } from 'antd';
import { PasswordInput } from 'antd-password-input-strength';
import md5 from 'md5';
import { Form, Input, TreeSelect } from 'antx';

@Form.create()
@connect(state => ({
  account: state.account,
  submitting: state.loading.effects['account/save'],
}))
export default class AccountForm extends React.PureComponent {
  // 关闭窗口
  handleCloseForm = () => {
    this.props.dispatch({
      type: 'account/updateState',
      payload: {
        modalType: '',
      },
    });
  };

  // 校验账号唯一性
  // eslint-disable-next-line consistent-return
  checkAccount = (rule, value, callback) => {
    const { getFieldValue } = this.props.form;
    const account = getFieldValue('account');
    const { item } = this.props;
    if (item && item.id && value === item.account) {
      return callback();
    }
    const data = { account };
    this.props
      .dispatch({
        type: 'account/checkUnique',
        payload: data,
      })
      .then(r => {
        if (r && r.success) {
          return callback();
        }
        return callback('该账号已存在');
      });
  };

  // 保存
  handleSaveClick = () => {
    const { dispatch, item } = this.props;
    const { getFieldsValue, validateFields } = this.props.form;
    validateFields(errors => {
      if (errors) {
        return;
      }
      const data = {
        ...getFieldsValue(),
        id: item ? item.id : '',
      };
      // 加密密码
      data.password = md5(data.password);
      data.repassword = md5(data.repassword);
      if (data.password !== data.repassword) {
        Modal.error({
          title: '校验失败',
          content: '两次输入的密码不一致...',
        });
      }

      data.locked = data.locked ? '0001' : '0000';

      dispatch({
        type: 'account/save',
        payload: data,
      });
    });
  };

  render() {
    const { form } = this.props;
    const { orgs, submitting, modalType } = this.props.account;
    const title = { create: '新增', edit: '编辑' };

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };

    const formRowOne = {
      labelCol: { span: 3 },
      wrapperCol: { span: 20 },
    };

    return (
      <Modal
        maskClosable={false}
        confirmLoading={submitting}
        cancelText="取消"
        okText="提交"
        onCancel={() => this.handleCloseForm()}
        visible={modalType !== ''}
        width={660}
        onOk={() => this.handleSaveClick()}
        title={`${title[modalType] || '查看'}用户信息`}
      >
        <Form api={form} data={{ username: 'Emily' }} {...formItemLayout}>
          <Row>
            <Col span={24}>
              <Upload
                label="　"
                {...formRowOne}
                name="avatar"
                listType="picture-card"
                className="avatar-uploader"
                action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
              >
                <div>
                  <Icon type="plus" />
                  <div className="ant-upload-text">选择头像</div>
                </div>
              </Upload>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Input label="姓名" id="name" rules={['required', 'max=10']} max={10} msg="full" />
            </Col>
            <Col span={12}>
              <Input
                label="账号"
                id="account"
                rules={[
                  { required: true, message: '请输入用户帐号' },
                  { validator: this.checkAccount },
                ]}
                max={10}
                msg="full"
                validateTrigger="onBlur"
              />
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <PasswordInput
                id="password"
                autoComplete="new-password"
                rules={['required', 'max=12']}
                required
                max={12}
                msg="密码不得为空"
                label={
                  <span>
                    密码&nbsp;
                    <Tooltip title="密码应为 8-12 位的数字字母组合(不含空格)">
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </span>
                }
              />
            </Col>
            <Col span={12}>
              <PasswordInput
                id="repassword"
                autoComplete="new-password"
                msg="密码不得为空"
                rules={['required', 'max=12']}
                required
                label="确认密码"
              />
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <TreeSelect
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                expandAll
                allowClear
                showSearch
                treeNodeFilterProp="title"
                treeNodeLabelProp="pathname"
                id="deptId"
                label="所属部门"
                msg="full"
                rules={['required']}
                treeData={orgs}
                {...formRowOne}
              />
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Input
                addonBefore="86"
                label="手机号码"
                id="tel"
                rules={['phone', 'max=11']}
                max={11}
                msg="full"
              />
            </Col>
            <Col span={12}>
              <Input label="邮箱" id="email" rules={['email', 'max=10']} max={60} msg="full" />
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Switch
                id="locked"
                checkedChildren="是"
                unCheckedChildren="否"
                label="是否锁定"
                {...formRowOne}
              />
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Input
                textarea
                label="备注"
                id="remark"
                rules={['max=200']}
                max={200}
                msg="full"
                {...formRowOne}
              />
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}
