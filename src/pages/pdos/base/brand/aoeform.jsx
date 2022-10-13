import React, { useState } from 'react';
import { Modal, Form, Input, Row, Col, Upload } from 'antd';
import { PlusOutlined } from "@ant-design/icons";
import DictSelector from '@/components/DictSelector'
import TreeSelector from '@/components/TreeSelector';
import Svc from '@/utils/http';
import API from '@/services/apis'

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

      Svc.edit(API.BRAND_EDIT ,data).then(() => {
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
          <Col span={12}>
            <Form.Item label="名称" name="name" rules={[{required: true}]}>
              <Input readOnly={ readOnly } />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="编码" name="code" rules={[{required: true}]}>
              <Input readOnly={ readOnly } />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={24}>
            <Form.Item label="Logo" name="logo" valuePropName="fileList">
              <Upload listType="picture-card" showUploadList={false} readOnly={ readOnly }>
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={24}>
            <Form.Item label="备注" name="remark">
              <Input.TextArea rows={3} readOnly={ readOnly }/>
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
      title={`${title[operateType] || '查看'} 品牌`}
    >
        {renderForm()}
    </Modal>
  );
}
