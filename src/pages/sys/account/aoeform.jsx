import React, { useState } from 'react';
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Form, Input, Modal, Row, Col, Switch, Tooltip, Upload } from 'antd';
import { PasswordInput } from 'antd-password-input-strength';
import md5 from 'md5';
import setting from '@config/defaultSettings';
import Selector from '@/components/Selector';
import TreeSelector from '@/components/TreeSelector';

import Service from '@/services/service';
import API from '@/apis';

export default (props) => {
  const [form] = Form.useForm();
  const { roles, orgs, fetch, currentItem, operateType, setOperateType } = props;

  const title = { create: '新增', edit: '编辑' };

  const [ avatar, setAvatar ] = useState([]);
  const [ pname, setPname ] = useState("");
  const [ submitting, setSubmitting ] = useState(false);

  const formItemLayout = {
    labelCol: { flex: '0 0 110px' },
    wrapperCol: { flex: 'auto' },
  };

  const formProps = {
    size:"middle" ,
    ...formItemLayout,
    labelAlign:"left",
    form,
    initialValues: {
      ...currentItem,
      locked: currentItem && currentItem.locked === '0001',
      roles: currentItem.roles && currentItem.roles.map(item => item.id)
    }
  }

  if (currentItem && currentItem.avatar) {
    setAvatar([{
        uid: currentItem.avatar,
        url: `${setting.imgUrl}${currentItem.avatar}`,
    }])
  }

   // 校验账号唯一性
  // eslint-disable-next-line consistent-return
  const checkAccount = async (rule, value) => {
    const { getFieldValue } = form;
    const account = getFieldValue('account');
    if (currentItem && currentItem.id && value === currentItem.account) {
      return Promise.resolve();
    }
    const data = {
      account,
      id: currentItem ? currentItem.id : '',
    };

    await Service.post(API.ACCOUNT_CHECKUNIQUE, data).then((r) => {
      if (r.success) {
        return Promise.resolve();
      }
      return Promise.reject(r.message);
    })
  };

  // 文件操作回调
  const  handleFileUpload = info => {
    let file = {};
    // 上传完成
    if (info.file.status === 'done' && info.file.response.success) {
      file = info.file.response.data;
    }
    setAvatar(info.fileList);
    setPname(file.pname || '');
  }
  // 保存
  const handleSaveClick = () => {
    const { validateFields } = form;
    setSubmitting(true);
    validateFields().then(values => {
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

      Service.post(API.ACCOUNT_EDIT, data).then(res => {
        setSubmitting(false);
        if(res.success){
          setOperateType("");
          fetch();
        }
      });
    });
  };

  return (
    <Modal
      maskClosable={false}
      confirmLoading={submitting}
      cancelText="取消"
      okText="提交"
      centered
      onCancel={() => setOperateType("")}
      visible={operateType !== ''}
      width="50%"
      onOk={() => handleSaveClick()}
      title={`${title[operateType] || '查看'}用户信息`}
    >
      <Form {...formProps}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="　" name="file" colon={false}>
              <Upload
                onChange={handleFileUpload}
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
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
                  label="姓名"
                  name="name"
                  rules={[{required: true}]}
                  >
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
              hasFeedback
              rules={[{
                required: true,
                message: '账号格式错误或已存在',
                whitespace: true,
                pattern: /^[0-9a-zA-Z_]{4,16}$/,
                validator: checkAccount}]}
              validateTrigger="onBlur">
              <Input min={4} max={16} placeholder="输入账号(唯一)"/>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
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
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="所属部门"
              name="deptId"
              rules={[{required: true}]}
              >
              <TreeSelector
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
        <Row gutter={16}>
          <Col span={24}>
          <Form.Item
                label="所属角色"
                name="roles"
                >
              <Selector
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                data={roles.list || []}
                k="id"
                v="name"
                clear
                showSearch
                mode="multiple"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
                label="手机号码"
                name="tel"
                rules={[{required: true}]}>
              <Input addonBefore="86"/>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
                  label="邮箱"
                  name="email"
                  rules={[{required: true, type: 'email'}]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
                label="是否锁定"
                name="locked"
                >
              <Switch
                checkedChildren="是"
                unCheckedChildren="否"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="备注"

              name="remark">
              <Input.TextArea max={200}/>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
