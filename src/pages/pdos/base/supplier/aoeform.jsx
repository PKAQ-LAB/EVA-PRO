import React, { useState } from 'react';
import moment from 'moment';
import { useModel } from 'umi';
import { Modal, Form, Input, Row, Col, Switch } from 'antd';
import DictSelector from '@/components/DictSelector'
import Svc from '@/utils/http';
import API from '@/apis'

export default (props) => {

  const [ form ] = Form.useForm();
  const [ loading, setLoading ] = useState(false);
  const { initialState, setInitialState } = useModel('@@initialState');

  const dict = initialState.dict;

  const title = { create: '新增', edit: '编辑' };
  const { operateType, setOperateType, currentItem, fetch  } = props;

  const formItemLayout = {
    labelCol: { flex: "0 0 90px" },
    wrapperCol: { flex: "auto" },
  };

  // 保存
  const handleSaveClick = () => {
    const { validateFields } = form;
    setLoading(true);
    validateFields().then(values => {

      const data = {
        ...values,
        id: currentItem ? currentItem.id : '',
      };
      data.dealTime = moment(data.dealTime).format("YYYY-MM-DD hh:mm:ss");

      Svc.edit(data).then(res => {
        if(res.success){
          setOperateType("");
          fetch();
        }
      })
    }).finally(() => {
      setLoading(false);
    });
  };

  const renderForm = () => {
    return (
      <Form size="small" {...formItemLayout} labelAlign="right" form={form} initialValues={currentItem}>
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item label="全称" name="fullName" rules={[{required: true}]}>
                <Input readOnly={operateType === 'view'} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item label="标签" name="tags">
                <Input readOnly={operateType === 'view'} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item label="简称" name="name" rules={[{required: true}]}>
                <Input readOnly={operateType === 'view'} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="编码" name="code" rules={[{required: true}]}>
                <DictSelector
                  data={dict.supplier_type}
                  disabled={operateType === 'view'}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="助记码" name="mnemonic">
                <Input readOnly={operateType === 'view'} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item label="主营品类" name="category" >
                <Input readOnly={operateType === 'view'} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="类型" name="type" >
                <DictSelector
                  data={dict.supplier_type}
                  disabled={operateType === 'view'}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={6}>
              <Form.Item label="七退"  name="sdwr">
                <Switch />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="包邮"  name="freeDelivery">
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="代发"  name="dropShipping">
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="启用"  name="isEnable">
                  <Switch />
                </Form.Item>
              </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item label="联系人" name="contact">
                <Input readOnly={operateType === 'view'} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="联系方式" name="tel">
                <Input readOnly={operateType === 'view'} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item label="店铺地址" name="shopUrl" >
                <Input.TextArea rows={2} readOnly={operateType === 'view'} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item label="退货地址" name="returnAddr" >
                <Input.TextArea rows={3} readOnly={operateType === 'view'} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item label="厂址" name="address" >
                <Input.TextArea rows={3} readOnly={operateType === 'view'} />
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
      title={`${title[operateType] || '查看'}供应商`}
    >
        {renderForm()}
    </Modal>
  )
}
