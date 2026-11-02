import {
  PageContainer,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import {
  Alert,
  Button,
  DatePicker,
  Drawer,
  Form,
  Input,
  Select,
  Skeleton,
} from 'antd';
import type { Dayjs } from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { useRecordView } from '@/components/RecordView';
import {
  ActionGroup,
  actionColumn,
  TextCell,
  textColumn,
} from '@/components/TablePresentation';
import useMenuAccess from '@/utils/useMenuAccess';
import type { LoginLogItem, LoginLogQuery } from './data.d';
import { getLoginLog, queryLoginLogs } from './service';

const fields: [keyof LoginLogItem, string][] = [
  ['id', '记录ID'],
  ['tenantId', '租户ID'],
  ['userId', '用户ID'],
  ['account', '登录账号'],
  ['loginType', '登录类型'],
  ['success', '操作结果'],
  ['failReason', '失败原因'],
  ['ip', 'IP地址'],
  ['device', '设备'],
  ['version', '版本'],
  ['deviceType', '设备类型'],
  ['deviceModel', '设备型号'],
  ['osName', '操作系统'],
  ['osVersion', '系统版本'],
  ['browserName', '浏览器'],
  ['browserVersion', '浏览器版本'],
  ['riskFlags', '风险标记'],
  ['lastActiveAt', '最后活动时间'],
  ['logoutAt', '退出时间'],
  ['logoutReason', '退出原因'],
  ['utcCreate', '记录时间'],
];
const resultText = (value: unknown) =>
  value === true ? '成功' : value === false ? '失败' : '—';

export default function LoginLogPage() {
  const canAction = useMenuAccess('/log/login');
  const { initialState, loading, error } = useModel('@@initialState');
  const user = initialState?.currentUser;
  const mounted = useRef(true);
  const permission = useRef<(path: string) => boolean>(() => false);
  permission.current = (path) =>
    !loading && !error && mounted.current && canAction(path);
  const canList = permission.current('list');
  const view = useRecordView<LoginLogItem>();
  const [listError, setListError] = useState(false);
  const [form] = Form.useForm<{
    account?: string;
    success?: 'true' | 'false';
    time?: [Dayjs, Dayjs];
  }>();
  const [query, setQuery] = useState<LoginLogQuery>({});
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    view.close();
  }, [user, loading, error]);
  const show = (record: LoginLogItem) => {
    if (!record.id || !permission.current('read')) return;
    void view.read(record.id, async () => {
      if (!permission.current('read')) throw new Error('无权限');
      const response = await getLoginLog(record.id);
      if (!permission.current('read')) throw new Error('权限已变更');
      return response;
    });
  };
  const columns: ProColumns<LoginLogItem>[] = [
    textColumn<LoginLogItem>('记录时间', 'utcCreate', 190),
    textColumn<LoginLogItem>('登录账号', 'account', 180),
    {
      ...textColumn<LoginLogItem>('登录类型', 'loginType', 140),
      align: 'center',
    },
    {
      title: '操作结果',
      width: 100,
      align: 'center',
      render: (_, record) => <TextCell text={resultText(record.success)} />,
    },
    textColumn<LoginLogItem>('IP地址', 'ip', 160),
    textColumn<LoginLogItem>('设备类型', 'deviceType', 140),
    textColumn<LoginLogItem>('风险标记', 'riskFlags', 200),
    {
      title: '操作',
      ...actionColumn(100),
      render: (_, record) => (
        <ActionGroup>
          {permission.current('read') && (
            <Button type="link" size="small" onClick={() => show(record)}>
              查看
            </Button>
          )}
        </ActionGroup>
      ),
    },
  ];
  return (
    <PageContainer
      className="eva-list-page"
      header={{ title: false, subTitle: false }}
    >
      {!canList ? (
        <Alert type="warning" showIcon title="无权限查看登录日志" />
      ) : (
        <>
          <div className="eva-ribbon">
            <Form
              form={form}
              layout="inline"
              className="eva-table-search"
              onFinish={(values) => {
                setQuery({
                  account: values.account,
                  success:
                    values.success === undefined
                      ? undefined
                      : values.success === 'true',
                  begin: values.time?.[0]?.format('YYYY-MM-DDTHH:mm:ss'),
                  end: values.time?.[1]?.format('YYYY-MM-DDTHH:mm:ss'),
                });
              }}
            >
              <Form.Item name="account" label="登录账号">
                <Input allowClear />
              </Form.Item>
              <Form.Item name="success" label="操作结果">
                <Select
                  allowClear
                  style={{ width: 100 }}
                  options={[
                    { value: 'true', label: '成功' },
                    { value: 'false', label: '失败' },
                  ]}
                />
              </Form.Item>
              <Form.Item name="time" label="记录时间">
                <DatePicker.RangePicker showTime />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  查询
                </Button>
                <Button
                  onClick={() => {
                    form.resetFields();
                    setQuery({});
                  }}
                >
                  重置
                </Button>
              </Form.Item>
            </Form>
          </div>
          {listError && (
            <Alert
              className="eva-view-notice"
              type="error"
              showIcon
              title="登录日志读取失败，请重试"
            />
          )}
          <div className="eva-body">
            <ProTable<LoginLogItem>
              className="eva-page-pro-table"
              tableClassName="eva-page-table"
              rowKey="id"
              defaultSize="small"
              bordered
              search={false}
              columns={columns}
              scroll={{ x: 1250, y: '100%' }}
              params={query}
              pagination={{
                defaultPageSize: 20,
                pageSizeOptions: [10, 20, 50, 100],
              }}
              onRequestError={() => setListError(true)}
              request={async (params) => {
                if (!permission.current('list'))
                  return { data: [], total: 0, success: false };
                setListError(false);
                const response = await queryLoginLogs(params);
                if (!permission.current('list'))
                  return { data: [], total: 0, success: false };
                if (response.success === false)
                  throw new Error('登录日志读取失败');
                return response;
              }}
            />
          </div>
        </>
      )}
      <Drawer
        title="登录日志明细"
        size={600}
        closable={{ placement: 'end' }}
        open={view.open && canList && permission.current('read')}
        onClose={view.close}
        destroyOnHidden
      >
        {view.loading && <span role="status">加载中...</span>}
        {view.error && (
          <Alert
            className="eva-view-notice"
            type="error"
            title={view.error}
            showIcon
          />
        )}
        <Form
          component="div"
          layout="horizontal"
          labelCol={{ flex: '130px' }}
          wrapperCol={{ flex: 'auto' }}
        >
          {fields.map(([field, label]) => (
            <Form.Item key={field} label={label}>
              <div
                className="eva-view-value"
                aria-busy={view.loading && !view.error}
              >
                {view.loading || view.error ? (
                  <Skeleton.Node
                    active={view.loading && !view.error}
                    styles={{
                      root: { width: '100%' },
                      content: {
                        width: '100%',
                        height: 'var(--ant-font-height, 22px)',
                      },
                    }}
                  />
                ) : field === 'success' ? (
                  resultText(view.data?.success)
                ) : (
                  String(view.data?.[field] ?? '').trim() || '—'
                )}
              </div>
            </Form.Item>
          ))}
        </Form>
      </Drawer>
    </PageContainer>
  );
}
