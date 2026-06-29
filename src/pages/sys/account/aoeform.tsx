import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import {
  App,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Switch,
  Tooltip,
  Upload,
  type UploadFile,
} from 'antd';
import { MD5 } from 'jscrypto/es6/MD5';
import React, { useEffect, useState } from 'react';
import { Selector, TreeSelector } from '@/components';
import type { AccountItem, OrgNode, RoleItem } from './data.d';
import { checkAccountUnique, editAccount } from './service';

export type OperateType = '' | 'create' | 'edit';

export interface AOEFormProps {
  operateType: OperateType;
  currentItem: AccountItem | null;
  orgs: OrgNode[];
  roles: RoleItem[];
  onClose: () => void;
  onSuccess: () => void;
}

type AccountFormValues = Omit<AccountItem, 'locked'> & {
  locked?: boolean;
  repassword?: string;
};

const TITLE: Record<Exclude<OperateType, ''>, string> = {
  create: '新增',
  edit: '编辑',
};

const formItemLayout = {
  labelCol: { flex: '0 0 110px' },
  wrapperCol: { flex: 'auto' },
};

const AOEForm: React.FC<AOEFormProps> = ({
  operateType,
  currentItem,
  orgs,
  roles,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm<AccountFormValues>();
  const { message: msg } = App.useApp();
  const [submitting, setSubmitting] = useState(false);
  const [avatar, setAvatar] = useState<UploadFile[]>([]);
  const [pname, setPname] = useState<string>('');

  // 同步 currentItem 到表单初始值
  useEffect(() => {
    if (operateType === '') return;
    form.resetFields();
    form.setFieldsValue({
      ...(currentItem ?? ({} as AccountItem)),
      locked: currentItem?.locked === '0001',
      roles: currentItem?.roles?.map((r) => ({ id: r.id })),
    });
    setAvatar(
      currentItem?.avatar
        ? [
            {
              uid: currentItem.avatar,
              name: currentItem.avatar,
              status: 'done',
            },
          ]
        : [],
    );
    setPname('');
  }, [operateType, currentItem, form]);

  // 校验账号唯一性 (服务端)
  const checkAccount = async (_: unknown, value: string) => {
    if (currentItem?.id && value === currentItem.account) return;
    const res = await checkAccountUnique(value, currentItem?.id);
    if (!res.success) {
      throw new Error(res.message ?? '账号已存在');
    }
  };

  const handleFileUpload = (info: {
    file: UploadFile;
    fileList: UploadFile[];
  }) => {
    const status = info.file.status;
    if (status === 'done') {
      const data = (
        info.file.response as
          | { success?: boolean; data?: { pname?: string } }
          | undefined
      )?.data;
      if (data?.pname) setPname(data.pname);
    }
    setAvatar(info.fileList);
  };

  const handleSaveClick = async () => {
    setSubmitting(true);
    try {
      const values = await form.validateFields();
      // 密码 MD5 加密
      if (values.password) {
        if (values.password !== values.repassword) {
          Modal.error({ title: '校验失败', content: '两次输入的密码不一致' });
          return;
        }
        values.password = MD5.hash(values.password).toString();
        if (values.repassword) {
          values.repassword = MD5.hash(values.repassword).toString();
        }
      }
      const payload: Partial<AccountItem> = {
        ...values,
        avatar: pname || currentItem?.avatar || '',
        id: currentItem?.id ?? undefined,
        locked: values.locked ? '0001' : '0000',
      };
      const res = await editAccount(payload);
      if (res.success) {
        msg.success(`${TITLE[operateType as 'create' | 'edit']}成功`);
        onClose();
        onSuccess();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      maskClosable={false}
      confirmLoading={submitting}
      cancelText="取消"
      okText="提交"
      centered
      onCancel={onClose}
      open={operateType !== ''}
      width="50%"
      onOk={handleSaveClick}
      title={`${TITLE[operateType as 'create' | 'edit'] ?? '查看'}用户信息`}
    >
      <Form size="middle" form={form} labelAlign="left" {...formItemLayout}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="　" name="file" colon={false}>
              <Upload
                onChange={handleFileUpload}
                fileList={avatar}
                listType="picture-card"
                action="/api/upload/file"
                accept=".jpg,.png,.jpeg"
              >
                {avatar.length < 1 && (
                  <div>
                    <PlusOutlined />
                    <div>选择头像</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="姓名" name="name" rules={[{ required: true }]}>
              <Input maxLength={10} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={
                <span>
                  账号&nbsp;
                  <Tooltip title="账号应为 4-16 位的数字字母组合 (不含空格)">
                    <QuestionCircleOutlined />
                  </Tooltip>
                </span>
              }
              name="account"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: '账号格式错误或已存在',
                  whitespace: true,
                  pattern: /^[0-9a-zA-Z_]{4,16}$/,
                  validator: checkAccount,
                },
              ]}
              validateTrigger="onBlur"
            >
              <Input
                minLength={4}
                maxLength={16}
                placeholder="输入账号 (唯一)"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={
                <span>
                  密码&nbsp;
                  <Tooltip title="密码应为 8-16 位的数字字母组合 (不含空格)">
                    <QuestionCircleOutlined />
                  </Tooltip>
                </span>
              }
              name="password"
              rules={[
                {
                  required: !currentItem?.id,
                  whitespace: true,
                  pattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/,
                  message: '请输入 8-16 位包含数字及字母的密码',
                },
              ]}
            >
              <Input.Password autoComplete="new-password" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="确认密码"
              name="repassword"
              dependencies={['password']}
              rules={[
                {
                  required: !currentItem?.id,
                  whitespace: true,
                  pattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/,
                  message: '请输入 8-16 位包含数字及字母的密码',
                },
              ]}
            >
              <Input.Password autoComplete="new-password" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="所属部门"
              name="deptId"
              rules={[{ required: true }]}
            >
              <TreeSelector
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                data={orgs as never}
                keys={['id', 'title', 'children']}
                allowClear
                showSearch
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="所属角色" name="roles">
              <Selector
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                data={roles as never}
                k="id"
                v="name"
                showSearch
                mode="multiple"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="手机号码" name="tel" rules={[{ required: true }]}>
              <Input addonBefore="86" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="邮箱"
              name="email"
              rules={[{ required: true, type: 'email' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="是否锁定" name="locked" valuePropName="checked">
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="备注" name="remark">
              <Input.TextArea maxLength={200} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AOEForm;
