import React from 'react';
import { Form, Input, Card, Row, Col, Button } from 'antd';
import { useModel } from 'umi';
import DictSelector from '@/components/DictSelector'
import LineList from './linelist';

import Http from '@/utils/http';
import API from '@/services/apis';

export default (props) => {
  const [form] = Form.useForm();
  const { operateType, currentItem, setOperateType } = props;

  const [ submitting, setSubmitting ] = React.useState(false);
  const [ lineData, setLineData ] = React.useState(currentItem? currentItem.lines : []);

  const lineProps = { lineData, setLineData, operateType };

  const { initialState } = useModel('@@initialState');

  // eslint-disable-next-line prefer-destructuring
  const dict = initialState.dict;

  const title = { create: '新增', edit: '编辑', view: '查看' };

  const formItemLayout = {
    labelCol: { flex: '0 0 100px' },
    wrapperCol: { flex: 'auto' },
  };

  React.useEffect(() => {
    setLineData(currentItem?.lines);
    form.resetFields();
  }, [currentItem, form])

  // 保存事件
  const handleSaveClick = () => {

    const { validateFields } = form;

    setSubmitting(true)
    validateFields().then(values => {
      const fd = {
        ...values,
        id: currentItem.id,
      };
      fd.lines = lineData;

      Http.post(API.DICT_EDIT, fd).then(() => {
        // fix 保存后清空表单
        // form.resetFields();
        setOperateType('view');
      }).finally(() => {
        setSubmitting(false);
      });
    })
  };

  return (
    <>
      <Form {...formItemLayout} colon initialValues={currentItem} form={form}>
        {/* 主表 */}
        <Card
          title={`${title[operateType] || ''}字典信息`}
          extra={
            <Button
              loading={submitting}
              type="primary"
              onClick={() => handleSaveClick()}
              disabled={operateType === '' || operateType === 'view'}
            >
              保存
            </Button>
          }
        >
          <Row>
            <Col span={12}>
            <Form.Item
                label="所属分类"
                name="parentId"
                rules={[{required: true,}]}>
                <DictSelector
                  code="dict_type"
                  disabled={operateType === '' || operateType === 'view'}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item
                label="字典编码"
                name="code"
                rules={[{required: true,}]}>
                <Input
                  max={30}
                  disabled={operateType === '' || operateType === 'view'}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="字典描述"
                name="name"
                rules={[{required: true,}]}>
                <Input
                  max={30}
                  disabled={operateType === '' || operateType === 'view'}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item
                  label="备注"
                  name="remark">
                <Input.TextArea
                  max={200}
                  disabled={operateType === '' || operateType === 'view'}
                  rows={5}
                />
                </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
      <LineList {...lineProps} />
    </>
  );
}
