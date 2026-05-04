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
import { type BizLogItem, getBizLog, queryBizLogs } from './service';

const { RangePicker } = DatePicker;

const fmt = (val?: string) =>
  val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : '-';

const BizLogPage: React.FC = () => {
  const [searchForm] = Form.useForm<{ operateDatetime?: [Dayjs, Dayjs] }>();
  const actionRef = useRef<ActionType | undefined>(undefined);
  const [detail, setDetail] = useState<BizLogItem | null>(null);
  const [query, setQuery] = useState<{ begin?: string; end?: string }>(() => ({
    begin: dayjs().add(-7, 'day').format('YYYY-MM-DD'),
    end: dayjs().format('YYYY-MM-DD'),
  }));

  const handleSearch = async () => {
    const values = await searchForm.validateFields();
    setQuery({
      begin: values.operateDatetime?.[0]?.format('YYYY-MM-DD'),
      end: values.operateDatetime?.[1]?.format('YYYY-MM-DD'),
    });
  };

  const handleReset = () => {
    searchForm.resetFields();
    setQuery({});
  };

  const handleView = async (record: BizLogItem) => {
    if (!record.id) return;
    const res = await getBizLog(record.id);
    if (res.success && res.data) setDetail(res.data);
  };

  const columns: ProColumns<BizLogItem>[] = [
    {
      title: '操作时间',
      dataIndex: 'operateDatetime',
      render: (_, r) => fmt(r.operateDatetime),
    },
    { title: '操作类型', dataIndex: 'operateType' },
    { title: '操作人', dataIndex: 'operator' },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    {
      title: '操作',
      width: 120,
      render: (_, record) => <a onClick={() => handleView(record)}>查看明细</a>,
    },
  ];

  return (
    <PageContainer>
      <div className="eva-ribbon">
        <Form
          form={searchForm}
          layout="inline"
          initialValues={{
            operateDatetime: [dayjs().add(-7, 'day'), dayjs()],
          }}
        >
          <Row align="middle">
            <Form.Item label="操作时间" name="operateDatetime">
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
        <ProTable<BizLogItem>
          actionRef={actionRef}
          columns={columns}
          rowKey="id"
          search={false}
          params={query}
          request={async (params) => {
            const res = await queryBizLogs({ ...query, ...params });
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
        title="业务日志明细"
        destroyOnHidden
      >
        {detail && (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="操作时间">
              {fmt(detail.operateDatetime)}
            </Descriptions.Item>
            <Descriptions.Item label="操作人">
              {detail.operator}
            </Descriptions.Item>
            <Descriptions.Item label="操作类型">
              {detail.operateType}
            </Descriptions.Item>
            <Descriptions.Item label="描述">
              {detail.description}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default BizLogPage;
