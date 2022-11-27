import React, { useState } from 'react';
import { Modal, Form, Input, Row, Col, InputNUmber, InputNumber } from 'antd';
import DictSelector from '@/components/DictSelector'
import TreeSelector from '@/components/TreeSelector';
import DragUpload from '@/components/DragUpload';

import Http from '@/utils/http';
import API from '@/services/apis';
import Selector from '@/components/Selector';

export default (props) => {
  const { setOperateType, operateType, currentItem, dict, fetch } = props;
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();
  const title = { create: '新增', edit: '编辑' };

  // 校验编码唯一性
  // eslint-disable-next-line consistent-return
  const checkCode = async (rule, value) => {
    const { getFieldValue } = form;

    const code = getFieldValue('code');

    if (currentItem && currentItem.id && value === currentItem.code) {
      return Promise.resolve();
    }
    await Http.post(API.GOODS_CHECKCODE, {code}).then((r)=>{
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

      const data = {
        ...values,
        id: currentItem ? currentItem.id : '',
      };

      Http.post(API.GOODS_EDIT, data).then((r) => {
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
      wrapperCol: { flex: "auto" },
    };

    const formProps = {
      size: "middle",
      ...formItemLayout,
      labelAlign: "left",
      form,
      initialValues: { ...currentItem }
    }

    const readOnly = operateType === 'view';

    return (
      <Form {...formProps}>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item label="品名" name="name" rules={[{ required: true }]}>
              <Input readOnly={readOnly} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label="品类" name="categoryId" rules={[{ required: true }]} >
              <TreeSelector
                url="/api/pdos/base/category/list"
                keys={['id', 'name', 'children']}
                search
                showAll={false}
                disabled={readOnly}
                treeDefaultExpandAll
                allowClear
                showSearch
                placeholder="请选择所属分类"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="品牌" name="brandId" rules={[{ required: true }]}>
              <Selector
                disabled={readOnly}
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                url="/api/pdos/base/brand/listAll"
                k="id"
                v="name"
                clear
                showSearch
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label="货号" name="itemNo" rules={[{ required: true }]}>
              <Input readOnly={readOnly} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label="单位" name="unit">
              <DictSelector
                code="unit"
                disabled={readOnly} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="装箱数量" name="boxunit">
              <InputNumber controls={false} min={9} style={{width: '100%'}} readOnly={readOnly} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={24}>
            <Form.Item label="条码" name="barcode">
              <Input readOnly={readOnly} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item label="资料包" name="barcode">
              <DragUpload disabled={readOnly} />
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
      title={`${title[operateType] || '查看'}商品`}
    >
      {renderForm()}
    </Modal>
  );
}
