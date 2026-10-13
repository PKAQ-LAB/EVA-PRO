import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import {
  App,
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Tooltip,
  Upload,
  type UploadFile,
} from 'antd';
import { createStyles } from 'antd-style';
import { MD5 } from 'jscrypto/es6/MD5';
import React, { useEffect, useRef, useState } from 'react';
import { TreeSelector } from '@/components';
import useFormDialogStyles from '@/components/FormDialog/useStyles';
import type { AccountItem, OrgNode, RoleItem } from './data.d';
import RoleList from './rolelist';
import { checkAccountUnique, editAccount } from './service';
import useLeaveGuard from './useLeaveGuard';

export type OperateType = '' | 'create' | 'edit';

export interface AOEFormProps {
  operateType: OperateType;
  currentItem: AccountItem | null;
  orgs: OrgNode[];
  roles: RoleItem[];
  rolesLoading?: boolean;
  rolesError?: boolean;
  onRetryRoles?: () => void;
  onClose: () => void;
  onSuccess: () => void;
}

type AccountFormValues = Omit<AccountItem, 'locked' | 'frozen'> & {
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

const useStyles = createStyles(({ token, css }) => ({
  layout: css`
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(260px, 1fr);
    align-items: stretch;
    gap: ${token.marginLG}px;
    > div { min-width: 0; }
    @media (max-width: 800px) {
      grid-template-columns: minmax(0, 1fr);
    }
  `,
  roles: css`
    position: relative;
    min-width: 0;
    min-height: 320px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadius}px;
    // 表格不参与父行高度计算，少量角色的外框仍由左侧资料撑高。
    > .ant-table-wrapper {
      position: absolute;
      inset: 0;
      overflow: auto;
    }
  `,
}));

const AOEForm: React.FC<AOEFormProps> = ({
  operateType,
  currentItem,
  orgs,
  roles,
  rolesLoading = false,
  rolesError = false,
  onRetryRoles,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm<AccountFormValues>();
  const { styles } = useStyles();
  const dialogStyles = useFormDialogStyles();
  const { message: msg, modal } = App.useApp();
  const savingRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [avatar, setAvatar] = useState<UploadFile[]>([]);
  const [pname, setPname] = useState<string>('');
  const [dirty, setDirty] = useState(false);
  const uploadingRef = useRef(false);
  const uploading = avatar.some((file) => file.status === 'uploading');
  const closeBlocked = submitting || uploading;
  const leaveGuard = useLeaveGuard({
    identity: `${operateType}:${currentItem?.id ?? ''}`,
    dirty,
    busy: closeBlocked,
    isBusy: () => savingRef.current || uploadingRef.current,
    onClose,
    onClean: () => setDirty(false),
    onBlocked: () => msg.info('正在上传或保存，请稍候'),
    modal,
  });
  const password = Form.useWatch('password', form);

  // 同步 currentItem 到表单初始值
  useEffect(() => {
    if (operateType === '') return;
    form.resetFields();
    form.setFieldsValue({
      account: currentItem?.account,
      name: currentItem?.name,
      tel: currentItem?.tel,
      email: currentItem?.email,
      deptId: currentItem?.deptId,
      remark: currentItem?.remark,
      roles: currentItem?.roles?.map((role) => ({ id: role.id })) ?? [],
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
    setDirty(false);
    uploadingRef.current = false;
    savingRef.current = false;
    setSubmitting(false);
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
    if (!leaveGuard.isCurrent()) return;
    uploadingRef.current = info.fileList.some(
      (file) => file.status === 'uploading',
    );
    setDirty(true);
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
    if (
      savingRef.current ||
      rolesLoading ||
      rolesError ||
      avatar.some((file) => file.status === 'uploading') ||
      currentItem?.frozen === 9999
    )
      return;
    savingRef.current = true;
    setSubmitting(true);
    try {
      const values = await form.validateFields();
      if (!leaveGuard.isCurrent()) return;
      // 密码 MD5 加密
      if (values.password) {
        if (values.password !== values.repassword) {
          msg.error('两次输入的密码不一致');
          return;
        }
        values.password = MD5.hash(values.password).toString();
        if (values.repassword) {
          values.repassword = MD5.hash(values.repassword).toString();
        }
      }
      const payload: Partial<AccountItem> = {
        account: values.account,
        name: values.name,
        deptId: values.deptId,
        tel: values.tel,
        email: values.email,
        remark: values.remark,
        password: values.password,
        repassword: values.repassword,
        roles: values.roles ?? [],
        avatar: pname || currentItem?.avatar || '',
        id: currentItem?.id ?? undefined,
        // 编辑用户资料不会改变锁定状态；新增默认未锁定。
        locked:
          currentItem?.locked ?? (currentItem?.frozen === 1 ? '0001' : '0000'),
      };
      const res = await editAccount(payload);
      if (!leaveGuard.isCurrent()) return;
      if (res.success) {
        leaveGuard.release();
        msg.success(`${TITLE[operateType as 'create' | 'edit']}成功`);
        onClose();
        onSuccess();
      } else {
        msg.error(res.message ?? '保存失败，请重试');
      }
    } catch (error) {
      if (!leaveGuard.isCurrent()) return;
      // 表单自身显示字段校验错误；请求异常保留已填内容。
      if (!(error && typeof error === 'object' && 'errorFields' in error)) {
        msg.error('保存失败，请重试');
      }
    } finally {
      if (leaveGuard.isCurrent()) {
        savingRef.current = false;
        setSubmitting(false);
      }
    }
  };

  return (
    <Modal
      styles={dialogStyles}
      mask={{ closable: false }}
      closable={!closeBlocked}
      keyboard={!closeBlocked}
      onCancel={leaveGuard.requestClose}
      open={operateType !== ''}
      width={1040}
      centered
      footer={
        <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button disabled={closeBlocked} onClick={leaveGuard.requestClose}>
            取消
          </Button>
          <Button
            type="primary"
            loading={submitting}
            disabled={
              rolesLoading ||
              rolesError ||
              avatar.some((file) => file.status === 'uploading') ||
              currentItem?.frozen === 9999
            }
            onClick={handleSaveClick}
          >
            保存
          </Button>
        </Space>
      }
      title={`${TITLE[operateType as 'create' | 'edit'] ?? '查看'}用户信息`}
    >
      <Form
        size="middle"
        form={form}
        labelAlign="left"
        layout="horizontal"
        disabled={submitting || currentItem?.frozen === 9999}
        onValuesChange={() => setDirty(true)}
        {...formItemLayout}
      >
        <div className={styles.layout}>
          <div>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label="头像" colon={false}>
                  <Upload
                    key={`${operateType}:${currentItem?.id ?? ''}`}
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
              <Col xs={24} sm={12}>
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
              <Col xs={24} sm={12}>
                <Form.Item
                  label="姓名"
                  name="name"
                  rules={[{ required: true }]}
                >
                  <Input maxLength={10} placeholder="请输入姓名" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
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
              <Col xs={24} sm={12}>
                <Form.Item
                  label="确认密码"
                  name="repassword"
                  dependencies={['password']}
                  rules={[
                    {
                      required: !currentItem?.id || Boolean(password),
                      whitespace: true,
                      pattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/,
                      message: '请输入 8-16 位包含数字及字母的密码',
                    },
                    ({ getFieldValue }) => ({
                      validator: (_, value) =>
                        (!value && !getFieldValue('password')) ||
                        value === getFieldValue('password')
                          ? Promise.resolve()
                          : Promise.reject(new Error('两次输入的密码不一致')),
                    }),
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
              <Col xs={24} sm={12}>
                <Form.Item
                  label="手机号码"
                  name="tel"
                  rules={[{ required: true }]}
                >
                  <Input addonBefore="86" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
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
                <Form.Item label="备注" name="remark">
                  <Input.TextArea maxLength={200} rows={4} />
                </Form.Item>
              </Col>
            </Row>
          </div>
          <section className={styles.roles} aria-label="用户角色">
            <Form.Item name="roles" noStyle>
              <RoleList
                roles={roles}
                loading={rolesLoading}
                error={rolesError}
                onRetry={onRetryRoles}
                disabled={submitting || currentItem?.frozen === 9999}
              />
            </Form.Item>
          </section>
        </div>
      </Form>
    </Modal>
  );
};

export default AOEForm;
