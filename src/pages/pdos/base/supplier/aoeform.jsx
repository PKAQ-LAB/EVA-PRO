import React from 'react';
import { connect } from 'umi';
import moment from 'moment';
import { Modal, Form, Input, Row, Col } from 'antd';
import Selector from '@/components/Selector'

@connect(({ loading, supplier, global }) => ({
  global,
  loading: loading.models.supplier,
  supplier,
}))
export default class AOEForm extends React.PureComponent{

  formRef = React.createRef();

  // 关闭
  handleOnClose = () => {
    this.props.dispatch({
      type:'supplier/updateState',
      payload: {
        operateType: '',
        // 清空编辑时留存的数据
        currentItem: {},
      }
    })
  }

  // 保存
  handleSaveClick = () => {
    const { currentItem } = this.props.supplier;
    const { validateFields } = this.formRef.current;
    validateFields().then(values => {

      const data = {
        ...values,
        id: currentItem ? currentItem.id : '',
      };
      data.dealTime = moment(data.dealTime).format("YYYY-MM-DD hh:mm:ss");

      this.props.dispatch({
        type: 'supplier/save',
        payload: data,
      });
    });
  };


  // 表单渲染
  renderForm = () => {
    const { dict } = this.props.global;
    const { currentItem, operateType } = this.props.supplier;

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };

    const formOneLayout = {
      labelCol: { span: 2 },
      wrapperCol: { span: 22 },
    };

    return (
      <Form size="middle" {...formItemLayout} labelAlign="left" ref={this.formRef} initialValues={currentItem}>
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item label="全称" name="fullName" {...formOneLayout} rules={[{required: true}]}>
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
              <Form.Item label="类型" name="category" rules={[{required: true}]}>
                <Selector
                  keys={['id', 'name']}
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
              <Form.Item label="联系人" name="linkman">
                <Input readOnly={operateType === 'view'} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="联系方式" name="mobile">
                <Input readOnly={operateType === 'view'} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item label="地址" name="address" {...formOneLayout}>
                <Input.TextArea rows={3} readOnly={operateType === 'view'} />
              </Form.Item>
            </Col>
          </Row>
      </Form>
    )
  }

  render() {
    const { operateType } = this.props.supplier;
    const { loading } = this.props;
    const title = { create: '新增', edit: '编辑' };

    return (
      <Modal
        maskClosable={false}
        loading={loading}
        centered
        onCancel={() => this.handleOnClose()}
        visible={operateType !== ''}
        width="50%"
        onOk={() => this.handleSaveClick()}
        title={`${title[operateType] || '查看'}供应商`}
      >
          {this.renderForm()}
      </Modal>
    );
  }
}
