import React from 'react';
import { connect } from 'dva';
import { Modal, Row, Col, Switch, Tooltip, Icon, Upload } from 'antd';
import { PasswordInput } from 'antd-password-input-strength';
import md5 from 'md5';
import { Form, Input, TreeSelect, Select } from 'antx';
import setting from '../../../../config/defaultSettings';

@Form.create()
@connect(state => ({
  account: state.account,
  submitting: state.loading.effects['account/save'],
}))
export default class AccountForm extends React.PureComponent {
  constructor(props) {
    super(props);
    const { currentItem } = this.props.account;
    let avatar = [];
    if (currentItem && currentItem.avatar) {
      avatar = [
        {
          uid: currentItem.avatar,
          url: `${setting.imgUrl}${currentItem.avatar}`,
        },
      ];
    }

    this.state = {
      avatar,
      pname: '',
    };
  }

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
    const { currentItem } = this.props.account;
    const { getFieldValue } = this.props.form;
    const account = getFieldValue('account');
    const { item } = this.props;
    if (item && item.id && value === item.account) {
      return callback();
    }
    const data = {
      account,
      id: currentItem ? currentItem.id : '',
    };

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

  // 文件操作回调
  handleFileUpload = info => {
    let file = {};
    // 上传完成
    if (info.file.status === 'done' && info.file.response.success) {
      file = info.file.response.data;
    }
    this.setState({
      avatar: info.fileList,
      pname: file.pname || '',
    });
  };

  // 保存
  handleSaveClick = () => {
    const { currentItem } = this.props.account;
    const { getFieldsValue, validateFields } = this.props.form;
    validateFields(errors => {
      if (errors) {
        return;
      }
      const { pname } = this.state;

      const data = {
        ...getFieldsValue(),
        avatar: pname || currentItem.avatar || '',
        id: currentItem ? currentItem.id : '',
      };

      // 加密密码
      if (data.password) {
        data.password = md5(data.password);
        data.repassword = md5(data.repassword);
      }

      if (data.password !== data.repassword) {
        Modal.error({
          title: '校验失败',
          content: '两次输入的密码不一致...',
        });
        return;
      }

      data.locked = data.locked ? '0001' : '0000';

      if (data.roles) {
        data.roles = data.roles.map(item => {
          const obj = { id: item };
          return obj;
        });
      }

      this.props.dispatch({
        type: 'account/save',
        payload: data,
      });
    });
  };

  render() {
    const { avatar } = this.state;
    const { form } = this.props;
    const { roles, orgs, submitting, modalType, currentItem } = this.props.account;
    const title = { create: '新增', edit: '编辑' };

    currentItem.locked = currentItem.locked === '0001';

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
        <Form api={form} data={currentItem} {...formItemLayout}>
          <Row>
            <Col span={24}>
              <Upload
                label="　"
                onChange={this.handleFileUpload}
                {...formRowOne}
                name="file"
                fileList={avatar}
                listType="picture-card"
                className="avatar-uploader"
                action="/api/upload/image"
                accept=".jpg,.png,.jpeg"
              >
                {avatar.length < 1 && (
                  <div>
                    <Icon type="plus" />
                    <div className="ant-upload-text">选择头像</div>
                  </div>
                )}
              </Upload>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Input label="姓名" id="name" rules={['required', 'max=10']} max={10} msg="full" />
            </Col>
            <Col span={12}>
              <Input
                label={
                  <span>
                    账号&nbsp;
                    <Tooltip title="账号应为4-16位的数字字母组合(不含空格)">
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </span>
                }
                id="account"
                rules={[
                  {
                    required: true,
                    message: '账号格式错误或已存在',
                    whitespace: true,
                    pattern: /^[0-9a-zA-Z_]{4,16}$/,
                    validator: this.checkAccount,
                  },
                ]}
                min={4}
                max={16}
                msg="请输入账号"
                validateTrigger="onBlur"
              />
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <PasswordInput
                id="password"
                autoComplete="new-password"
                rules={[
                  {
                    required: !currentItem.id,
                    whitespace: true,
                    pattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/,
                    message: '请输入8-16位包含数字及字母的密码',
                  },
                ]}
                required
                max={12}
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
                max={12}
                rules={[
                  {
                    required: !currentItem.id,
                    whitespace: true,
                    pattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/,
                    message: '请输入8-16位包含数字及字母的密码',
                  },
                ]}
                required
                label="确认密码"
              />
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <TreeSelect
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                data={orgs}
                keys={['id', 'title', 'children']}
                treeNodeFilterProp="title"
                expandAll
                allowClear
                showSearch
                id="deptId"
                label="所属部门"
                msg="full"
                rules={['required']}
                {...formRowOne}
              />
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Select
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                data={roles || []}
                keys={['id', 'name']}
                clear
                showSearch
                mode="multiple"
                id="roles"
                label="所属角色"
                msg="full"
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
              <Input label="邮箱" id="email" rules={['email', 'max=50']} max={50} msg="full" />
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Switch
                id="locked"
                checkedChildren="是"
                unCheckedChildren="否"
                // checked={currentItem.locked}
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
