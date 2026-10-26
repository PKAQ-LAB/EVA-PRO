import { Col, Form, Row, Skeleton } from 'antd';

export interface RecordAudit {
  createBy?: string;
  utcCreate?: string;
  modifyBy?: string;
  utcModify?: string;
}

/** 审计字段不注册进业务表单，避免查看值进入保存载荷。 */
export default function RecordAuditFields({
  record,
  loading = false,
  unavailable = false,
}: {
  record: RecordAudit;
  loading?: boolean;
  unavailable?: boolean;
}) {
  return (
    <Row gutter={16}>
      {(
        [
          ['创建人', record.createBy],
          ['创建时间', record.utcCreate],
          ['修改人', record.modifyBy],
          ['修改时间', record.utcModify],
        ] as const
      ).map(([label, value]) => (
        <Col key={label} xs={24} sm={12}>
          <Form.Item label={label}>
            <div className="eva-view-value" aria-busy={loading && !unavailable}>
              {loading || unavailable ? (
                <Skeleton.Node
                  active={loading && !unavailable}
                  styles={{
                    root: { width: '100%' },
                    content: {
                      width: '100%',
                      height: 'var(--ant-font-height, 22px)',
                    },
                  }}
                />
              ) : typeof value === 'string' && value.trim() ? (
                value
              ) : (
                '—'
              )}
            </div>
          </Form.Item>
        </Col>
      ))}
    </Row>
  );
}
