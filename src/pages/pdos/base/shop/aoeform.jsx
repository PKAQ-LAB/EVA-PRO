import React, { useState } from 'react';
import { Modal, Form, Input, Row, Col, Upload, DatePicker } from 'antd';
import { PlusOutlined } from "@ant-design/icons";
import DictSelector from '@/components/DictSelector'
import moment from 'moment';
import Svc from '@/utils/http';
import API from '@/services/apis'

export default (props) => {
  const { setOperateType, operateType, currentItem, dict, fetch } = props;
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();
  const title = { create: '新增', edit: '编辑' };

  const readOnly = operateType === 'view';

  // 校验编码唯一性
  // eslint-disable-next-line consistent-return
  const checkCode = async (rule, value) => {
    const { getFieldValue } = form;

    const code = getFieldValue('code');

    if (currentItem && currentItem.id && value === currentItem.code) {
      return Promise.resolve();
    }
    await Svc.post(API.SHOP_CHECKUNIQUE, { code }).then((r) => {
      if (r.success) {
        return Promise.resolve();
      }
      return Promise.reject(r.message);
    });
  };

  // 保存
  const handleSaveClick = () => {
    const { validateFields } = form;
    validateFields().then(values => {
      setLoading(true);

      values.openDate = moment(values.openDate).format('YYYY-MM-DD')
      const data = {
        ...values,
        id: currentItem ? currentItem.id : '',
      };

      Svc.edit(API.SHOP_EDIT, data).then(() => {
        setOperateType("");
        fetch();
      });
    }).finally(() => {
      setLoading(false);
    });
  };

  // 表单渲染
  const renderForm = () => {
    const formItemLayout = {
      labelCol: { flex: "0 0 100px" },
    };

    const formProps = {
      size: "middle",
      ...formItemLayout,
      labelAlign: "right",
      form,
      initialValues: 'create' === operateType ? {} : { ...currentItem }
    }

    return (
      <Form {...formProps}>
        <Row>
          <Col span={24}>
            <Form.Item label="Logo" name="logo">
              <Upload listType="picture-card" showUploadList={false} disabled={readOnly}>
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={16}>
            <Form.Item label="店名" name="name" rules={[{ required: true }]}>
              <Input readOnly={readOnly} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={24}>
            <Form.Item label="URL" name="url" rules={[{ required: true }]}>
              <Input readOnly={readOnly} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={8}>
            <Form.Item label="编码"
              name="code"
              validateTrigger="onBlur"
              hasFeedback
              rules={[{
                required: true,
                whitespace: true,
                validator: checkCode,
              },
              ]}>
              <Input readOnly={readOnly} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="账号" name="account" rules={[{ required: true }]}>
              <Input readOnly={readOnly} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={8}>
            <Form.Item label="类型" name="type" rules={[{ required: true }]}>
              <DictSelector
                placeholder="选择主体类型"
                disabled={readOnly}
                code="shopType" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="所属平台" name="platform" rules={[{ required: true }]}>
              <DictSelector
                placeholder="选择所属平台"
                disabled={readOnly}
                code="online_platform" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={8}>
            <Form.Item label="保证金" name="deposit" rules={[{ required: true }]}>
              <Input readOnly={readOnly} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="开店日期" name="openDate" >
              <DatePicker readOnly={readOnly} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={24}>
            <Form.Item label="备注" name="remark">
              <Input.TextArea rows={3} readOnly={readOnly} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    )
  }

  return (
    <Modal
      maskClosable={false}
      loading={loading}
      centered
      onCancel={() => setOperateType("")}
      open={operateType !== ''}
      width="50%"
      onOk={() => handleSaveClick()}
      title={`${title[operateType] || '查看'} 店铺`}
    >
      {renderForm()}
    </Modal>
  );
}
