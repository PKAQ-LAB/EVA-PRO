import {
  type ActionType,
  PageContainer,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import {
  Alert,
  Button,
  DatePicker,
  Descriptions,
  Divider,
  Drawer,
  Form,
  Row,
  Spin,
} from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import React, { useRef, useState } from 'react';
import { useRecordView, viewRow } from '@/components/RecordView';
import {
  ActionGroup,
  actionColumn,
  textColumn,
} from '@/components/TablePresentation';
import { type ErrorLogItem, getErrorLog, queryErrorLogs } from './service';

const { RangePicker } = DatePicker;

const ErrorLogPage: React.FC = () => {
  const view = useRecordView<ErrorLogItem>();
  const detail = view.data;
  const [searchForm] = Form.useForm<{ requestTime?: [Dayjs, Dayjs] }>();
  const actionRef = useRef<ActionType | undefined>(undefined);
  const [query, setQuery] = useState<{ begin?: string; end?: string }>(() => ({
    begin: dayjs().add(-7, 'day').format('YYYY-MM-DD'),
    end: dayjs().format('YYYY-MM-DD'),
  }));

  const handleSearch = async () => {
    const values = await searchForm.validateFields();
    setQuery({
      begin: values.requestTime?.[0]?.format('YYYY-MM-DD'),
      end: values.requestTime?.[1]?.format('YYYY-MM-DD'),
    });
  };

  const handleReset = () => {
    searchForm.resetFields();
    setQuery({});
  };

  const handleView = async (record: ErrorLogItem) => {
    if (!record.id) return;
    await view.read(record.id, () => getErrorLog(record.id));
  };

  const columns: ProColumns<ErrorLogItem>[] = [
    textColumn<ErrorLogItem>('类名', 'className', 180),
    textColumn<ErrorLogItem>('异常描述', 'exDesc', 240),
    textColumn<ErrorLogItem>('请求 IP', 'ip', 160),
    textColumn<ErrorLogItem>('方法名', 'method', 180),
    textColumn<ErrorLogItem>('方法参数', 'params', 240),
    textColumn<ErrorLogItem>('记录时间', 'requestTime', 200),
    {
      ...textColumn<ErrorLogItem>('请求耗时', 'spendTime', 110),
      align: 'right',
    },
    {
      title: '操作',
      ...actionColumn(180),
      render: (_, record) => (
        <ActionGroup>
          <Button
            type="link"
            size="small"
            onClick={() => void handleView(record)}
          >
            查看
          </Button>
        </ActionGroup>
      ),
    },
  ];

  return (
    <PageContainer header={{ title: false, subTitle: false }}>
      <div className="eva-ribbon">
        <Form
          className="eva-table-search"
          form={searchForm}
          layout="inline"
          initialValues={{
            requestTime: [dayjs().add(-7, 'day'), dayjs()],
          }}
        >
          <Row align="middle">
            <Form.Item label="操作时间" name="requestTime">
              <RangePicker />
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={handleSearch}>
                查询
              </Button>
              <Divider type="vertical" />
              <Button onClick={handleReset}>重置</Button>
            </Form.Item>
          </Row>
        </Form>
      </div>
      <div className="eva-body">
        <ProTable<ErrorLogItem>
          scroll={{ x: 1490 }}
          onRow={(record) => viewRow(() => void handleView(record))}
          defaultSize="small"
          actionRef={actionRef}
          columns={columns}
          rowKey="id"
          search={false}
          bordered
          params={query}
          request={async (params) => {
            const res = await queryErrorLogs({ ...query, ...params });
            return {
              data: res?.data ?? [],
              total: res?.total ?? 0,
              success: res?.success ?? true,
            };
          }}
        />
      </div>

      <Drawer
        closable={{ placement: 'end' }}
        open={view.open}
        width={600}
        onClose={view.close}
        title="错误日志明细"
        destroyOnHidden
      >
        {view.loading ? (
          <Spin description="加载中...">
            <div style={{ minHeight: 100 }} />
          </Spin>
        ) : view.error ? (
          <Alert type="error" showIcon title={view.error} />
        ) : (
          detail && (
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="记录时间">
                {detail.requestTime}
              </Descriptions.Item>
              <Descriptions.Item label="请求耗时">
                {detail.spendTime}
              </Descriptions.Item>
              <Descriptions.Item label="类名">
                {detail.className}
              </Descriptions.Item>
              <Descriptions.Item label="请求 IP">{detail.ip}</Descriptions.Item>
              <Descriptions.Item label="方法名">
                {detail.method}
              </Descriptions.Item>
              <Descriptions.Item label="方法参数">
                {detail.params}
              </Descriptions.Item>
              <Descriptions.Item label="异常描述">
                {detail.exDesc}
              </Descriptions.Item>
            </Descriptions>
          )
        )}
      </Drawer>
    </PageContainer>
  );
};

export default ErrorLogPage;
