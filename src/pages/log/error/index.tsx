import {
  type ActionType,
  PageContainer,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import {
  Button,
  DatePicker,
  Descriptions,
  Divider,
  Drawer,
  Form,
  Row,
} from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import React, { useRef, useState } from 'react';
import { type ErrorLogItem, getErrorLog, queryErrorLogs } from './service';

const { RangePicker } = DatePicker;

const ErrorLogPage: React.FC = () => {
  const [searchForm] = Form.useForm<{ requestTime?: [Dayjs, Dayjs] }>();
  const actionRef = useRef<ActionType | undefined>(undefined);
  const [detail, setDetail] = useState<ErrorLogItem | null>(null);
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
    const res = await getErrorLog(record.id);
    if (res.success && res.data) setDetail(res.data);
  };

  const columns: ProColumns<ErrorLogItem>[] = [
    { title: '类名', dataIndex: 'className', width: 180, ellipsis: true },
    { title: '异常描述', dataIndex: 'exDesc', width: 240, ellipsis: true },
    { title: '请求 IP', dataIndex: 'ip' },
    { title: '方法名', dataIndex: 'method' },
    { title: '方法参数', dataIndex: 'params', width: 240, ellipsis: true },
    { title: '记录时间', dataIndex: 'requestTime' },
    { title: '请求耗时', dataIndex: 'spendTime' },
    {
      title: '操作',
      width: 100,
      render: (_, record) => <a onClick={() => handleView(record)}>查看</a>,
    },
  ];

  return (
    <PageContainer>
      <div className="eva-ribbon">
        <Form
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
        open={!!detail}
        width={600}
        onClose={() => setDetail(null)}
        title="错误日志明细"
        destroyOnHidden
      >
        {detail && (
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
        )}
      </Drawer>
    </PageContainer>
  );
};

export default ErrorLogPage;
