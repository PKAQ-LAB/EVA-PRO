import {
  type ActionType,
  PageContainer,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
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
  TextCell,
  textColumn,
} from '@/components/TablePresentation';
import { type BizLogItem, getBizLog, queryBizLogs } from './service';

const { RangePicker } = DatePicker;

const fmt = (val?: string) =>
  val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : '-';

const BizLogPage: React.FC = () => {
  const view = useRecordView<BizLogItem>();
  const detail = view.data;
  const { initialState } = useModel('@@initialState');
  const [searchForm] = Form.useForm<{ operateDatetime?: [Dayjs, Dayjs] }>();
  const actionRef = useRef<ActionType | undefined>(undefined);
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
    await view.read(record.id, () => getBizLog(record.id));
  };
  const operateTypeDict = (
    initialState?.dict as Record<string, unknown> | undefined
  )?.BIZ_OPERATE_TYPE as Record<string, string> | undefined;
  const getOperateTypeText = (value?: string) =>
    value ? (operateTypeDict?.[value] ?? value) : '-';

  const columns: ProColumns<BizLogItem>[] = [
    {
      title: '操作时间',
      dataIndex: 'operateDatetime',
      width: 200,
      ellipsis: { showTitle: false },
      render: (_, r) => <TextCell text={fmt(r.operateDatetime)} />,
    },
    {
      title: '操作类型',
      dataIndex: 'operateType',
      width: 180,
      align: 'center',
      ellipsis: { showTitle: false },
      render: (_, record) => (
        <TextCell text={getOperateTypeText(record.operateType)} />
      ),
    },
    textColumn<BizLogItem>('操作人', 'operator', 180),
    textColumn<BizLogItem>('描述', 'description', 360),
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
            查看明细
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
          scroll={{ x: 1100 }}
          onRow={(record) => viewRow(() => void handleView(record))}
          defaultSize="small"
          actionRef={actionRef}
          columns={columns}
          rowKey="id"
          search={false}
          bordered
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
        closable={{ placement: 'end' }}
        open={view.open}
        width={600}
        onClose={view.close}
        title="业务日志明细"
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
              <Descriptions.Item label="操作时间">
                {fmt(detail.operateDatetime)}
              </Descriptions.Item>
              <Descriptions.Item label="操作人">
                {detail.operator}
              </Descriptions.Item>
              <Descriptions.Item label="操作类型">
                {getOperateTypeText(detail.operateType)}
              </Descriptions.Item>
              <Descriptions.Item label="描述">
                {detail.description}
              </Descriptions.Item>
            </Descriptions>
          )
        )}
      </Drawer>
    </PageContainer>
  );
};

export default BizLogPage;
