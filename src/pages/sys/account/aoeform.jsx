import React from 'react';
import { connect } from 'umi';
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Form, Input, TreeSelect, Select, Modal, Row, Col, Switch, Tooltip, Upload } from 'antd';
import { PasswordInput } from 'antd-password-input-strength';
import md5 from 'md5';
import setting from '@config/defaultSettings';

@connect(state => ({
  account: state.account,
  submitting: state.loading.effects['account/save'],
}))
export default class AccountForm extends React.PureComponent {
  formRef = React.creatRef();

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
    const { getFieldValue } = this.formRef.current;
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
    const { validateFields } = this.formRef.current;
    validateFields().then(values => {
      const { pname } = this.state;

      const data = {
        ...values,
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
        centered
        onCancel={() => this.handleCloseForm()}
        visible={modalType !== ''}
        width={660}
        onOk={() => this.handleSaveClick()}
        title={`${title[modalType] || '查看'}用户信息`}
      >
        <Form ref={this.formRef} initialValues={currentItem} {...formItemLayout}>
          <Row>
            <Col span={24}>
              <Form.Item
                    label="　"
                    name="file"
                    {...formRowOne}>
                <Upload
                  onChange={this.handleFileUpload}
                  fileList={avatar}
                  listType="picture-card"
                  className="avatar-uploader"
                  action="/api/upload/file"
                  accept=".jpg,.png,.jpeg"
                >
                  {avatar.length < 1 && (
                    <div>
                      <PlusOutlined />
                      <div className="ant-upload-text">选择头像</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item
                    label="姓名"
                    name="name"
                    rules={[{required: true, len: 10}]}
                    {...formRowOne}>
                <Input max={10} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                  label={
                  <span>
                    账号&nbsp;
                    <Tooltip title="账号应为4-16位的数字字母组合(不含空格)">
                      <QuestionCircleOutlined />
                    </Tooltip>
                  </span>
                }
                name="account"
                rules={[{
                  required: true,
                  message: '账号格式错误或已存在',
                  whitespace: true,
                  pattern: /^[0-9a-zA-Z_]{4,16}$/,
                  validator: this.checkAccount}]}
                validateTrigger="onBlur">
                <Input min={4} max={16} placeholder="输入账号(唯一)"/>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item
                  label={
                  <span>
                    密码&nbsp;
                    <Tooltip title="密码应为 8-12 位的数字字母组合(不含空格)">
                      <QuestionCircleOutlined />
                    </Tooltip>
                  </span>
                }
                name="password"
                rules={[
                  {
                    required: !currentItem.id,
                    whitespace: true,
                    pattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/,
                    message: '请输入8-16位包含数字及字母的密码',
                    len: 12
                  },
                ]}>
                <PasswordInput autoComplete="new-password" required/>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                    rules={[
                      {
                        required: !currentItem.id,
                        whitespace: true,
                        pattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/,
                        message: '请输入8-16位包含数字及字母的密码',
                      },
                    ]}
                    label="确认密码"
                    name="repassword">
                <PasswordInput
                  autoComplete="new-password"
                  max={12}
                  required
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item
                label="所属部门"
                name="deptId"
                rules={[{required: true}]}
                {...formRowOne}>
                <TreeSelect
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  data={orgs}
                  keys={['id', 'title', 'children']}
                  treeNodeFilterProp="title"
                  expandAll
                  allowClear
                  showSearch
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
            <Form.Item
                  label="所属角色"
                  name="roles"
                  {...formRowOne}>
               <Select
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  data={roles || []}
                  keys={['id', 'name']}
                  clear
                  showSearch
                  mode="multiple"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item
                  label="手机号码"
                  name="tel"
                  rules={[{required: true, type: 'number', len: 13}]}>
                <Input addonBefore="86"/>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Input label="邮箱" id="email" rules={['email', 'max=50']} max={50} msg="full" />
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item
                  label="是否锁定"
                  name="locked"
                  {...formRowOne}>
                <Switch
                  checkedChildren="是"
                  unCheckedChildren="否"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item
                label="备注"
                {...formRowOne}
                name="remark">
                <Input.TextArea max={200}/>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}
