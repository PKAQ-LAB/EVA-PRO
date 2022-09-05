import React, { useState } from 'react';
import { Modal, Form, Input, Row, Col } from 'antd';
import DictSelector from '@/components/DictSelector'
import TreeSelector from '@/components/TreeSelector';
import DragUpload from '@/components/DragUpload';
import Svc from '@/services/service';
import API from '@/apis'

export default (props) => {
  const { setOperateType, operateType, currentItem, dict, fetch } = props;
  const [ loading, setLoading ] = useState(false);

  const [form] = Form.useForm();
  const title = { create: '新增', edit: '编辑' };

  const readOnly = operateType === 'view';
  // 保存
  const handleSaveClick = () => {
    const { validateFields } = form;
    validateFields().then(values => {
      setLoading(true);

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
    labelCol: { flex: "0 0 80px" },
    wrapperCol: { flex: "auto" },
  };

  const formProps = {
    size:"middle" ,
    ...formItemLayout,
     labelAlign:"right",
     form,
     initialValues: {...currentItem}
  }

    return (
      <Form {...formProps}>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item label="店名" name="name" rules={[{required: true}]}>
              <Input readOnly={ readOnly } />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={24}>
            <Form.Item label="URL" name="url" rules={[{required: true}]}>
              <Input readOnly={ readOnly } />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={24}>
            <Form.Item label="Logo" name="logo" rules={[{required: true}]}>
              <DragUpload/>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={8}>
            <Form.Item label="所属平台" name="platform" rules={[{required: true}]}>
              <Input readOnly={ readOnly } />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="保证金" name="deposit" rules={[{required: true}]}>
              <Input readOnly={ readOnly } />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="开店日期" name="openDate" rules={[{required: true}]}>
              <Input readOnly={ readOnly } />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={24}>
            <Form.Item label="备注" name="remark">
              <Input readOnly={ readOnly } />
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
      visible={operateType !== ''}
      width="50%"
      onOk={() => handleSaveClick()}
      title={`${title[operateType] || '查看'} 店铺`}
    >
        {renderForm()}
    </Modal>
  );
}
