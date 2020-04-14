import React from 'react';
import { connect } from 'umi';
import moment from 'moment';
import { Modal, Form, Input, Row, Col } from 'antd';
import DictSelector from '@/components/DictSelector'
import TreeSelector from '@/components/TreeSelector';

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
              <Form.Item label="品名" name="name" rules={[{required: true}]}>
                <Input readOnly={operateType === 'view'} />
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
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="助记码" name="mnemonic" rules={[{required: true}]}>
                <Input readOnly={operateType === 'view'} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="货号" name="itemNo" rules={[{required: true}]}>
                <Input readOnly={operateType === 'view'} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="单位" name="unit">
                <DictSelector
                  data={dict.data_permission}
                  disabled={operateType === 'view'} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="装箱数量" name="boxunit">
                <Input readOnly={operateType === 'view'} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
          <Col span={12}>
              <Form.Item label="生产厂家" name="factory">
                <Input readOnly={operateType === 'view'} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="条码" name="barcode">
                <Input readOnly={operateType === 'view'} />
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
