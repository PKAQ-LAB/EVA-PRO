import React, { useState } from 'react';
import { Modal, Form, Input, Row, Col } from 'antd';
import DictSelector from '@/components/DictSelector'
import TreeSelector from '@/components/TreeSelector';
import DragUpload from '@/components/DragUpload';

import Http from '@/utils/http';
import API from '@/services/apis';
import Selector from '@/components/Selector';

export default (props) => {
  const { setOperateType, operateType, currentItem, dict, fetch } = props;
  const [ loading, setLoading ] = useState(false);

  const [form] = Form.useForm();
  const title = { create: '新增', edit: '编辑' };

  // 保存
  const handleSaveClick = () => {
    const { validateFields } = form;
    validateFields().then(values => {
      setLoading(true);

      const data = {
        ...values,
        id: currentItem ? currentItem.id : '',
      };

      Http.post(API.GOODS_EDIT, formData).then((r) => {
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
    size:"middle" ,
    ...formItemLayout,
     labelAlign:"left",
     form,
     initialValues: {...currentItem}
  }

  const readOnly = operateType === 'view';

    return (
      <Form {...formProps}>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item label="品名" name="name" rules={[{required: true}]}>
              <Input readOnly={readOnly} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label="品类" name="category" rules={[{required: true}]} >
              <TreeSelector
                  url="/api/pdos/base/category/list"
                  keys={['id', 'name', 'children']}
                  search
                  showAll={false}
                  disabled={operateType === 'view'}
                  treeDefaultExpandAll
                  allowClear
                  showSearch
                  placeholder="请选择所属分类"
                />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="品牌" name="brand" rules={[{required: true}]}>
              <Selector
                readOnly = {readOnly}
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                url="/api/pdos/base/brand/listAll"
                k="id"
                v="name"
                clear
                showSearch
                mode="multiple"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label="货号" name="itemNo" rules={[{required: true}]}>
              <Input readOnly={readOnly} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="助记码" name="mnemonic" rules={[{required: true}]}>
              <Input readOnly={readOnly} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label="单位" name="unit">
              <DictSelector
                data={dict.unit}
                disabled={operateType === 'view'} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="装箱数量" name="boxunit">
              <Input readOnly={readOnly} />
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
              <DragUpload />
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
