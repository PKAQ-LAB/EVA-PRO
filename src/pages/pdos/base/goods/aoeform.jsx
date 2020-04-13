import React from 'react';
import { connect } from 'umi';
import moment from 'moment';
import { Modal, Form, Input, Row, Col } from 'antd';
import DictSelector from '@/components/DictSelector'

@connect(({ loading, goods, global }) => ({
  global,
  loading: loading.models.goods,
  goods,
}))
export default class AOEForm extends React.PureComponent{

  formRef = React.createRef();

  // 关闭
  handleOnClose = () => {
    this.props.dispatch({
      type:'goods/updateState',
      payload: {
        operateType: '',
        // 清空编辑时留存的数据
        currentItem: {},
      }
    })
  }

  // 保存
  handleSaveClick = () => {
    const { currentItem } = this.props.goods;
    const { validateFields } = this.formRef.current;
    validateFields().then(values => {

      const data = {
        ...values,
        id: currentItem ? currentItem.id : '',
      };
      data.dealTime = moment(data.dealTime).format("YYYY-MM-DD hh:mm:ss");

      this.props.dispatch({
        type: 'goods/save',
        payload: data,
      });
    });
  };


  // 表单渲染
  renderForm = () => {
    const { dict } = this.props.global;
    const { currentItem, operateType } = this.props.goods;

    const formItemLayout = {
      labelCol: { flex: "0 0 90px" },
      wrapperCol: { flex: "auto" },
    };

    return (
      <Form size="middle" {...formItemLayout} labelAlign="left" ref={this.formRef} initialValues={currentItem}>
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item label="全称" name="fullName" rules={[{required: true}]}>
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
                <DictSelector
                  data={dict.goods_type}
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
              <Form.Item label="地址" name="address" >
                <Input.TextArea rows={3} readOnly={operateType === 'view'} />
              </Form.Item>
            </Col>
          </Row>
      </Form>
    )
  }

  render() {
    const { operateType } = this.props.goods;
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
        title={`${title[operateType] || '查看'}商品`}
      >
          {this.renderForm()}
      </Modal>
    );
  }
}
