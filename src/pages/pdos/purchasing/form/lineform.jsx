import React, { PureComponent } from 'react';
import { Row, Col, Modal } from 'antd';
import { Form, Input } from 'antx';
import { connect } from 'dva';
import Selector from '@src/components/Selector';

@Form.create()
@connect(state => ({
  purchasing: state.purchasing,
  global: state.global,
}))
export default class LineAOEForm extends PureComponent {
  // 关闭窗口
  handleCloseForm = () => {
    this.props.dispatch({
      type: 'purchasing/updateState',
      payload: {
        modalType: '',
      },
    });
  };

  // 保存
  handleSaveClick = () => {
    const { lineData, editItem } = this.props.purchasing;

    const { validateFields } = this.props.form;
    validateFields((errors, values) => {
      if (errors) {
        return;
      }
      const data = {
        ...values,
      };

      if (editItem || editItem === 0) {
        Object.assign(lineData[editItem], data);
      } else {
        lineData.push(data);
      }

      // 关闭当前新增页面
      this.props.dispatch({
        type: 'purchasing/updateState',
        payload: {
          modalType: '',
        },
      });
    });
  };

  // 渲染界面
  render() {
    const { dict } = this.props.global;
    const { form } = this.props;
    const { modalType, editItem, lineData } = this.props.purchasing;

    const currentItem = lineData[editItem];

    const formItemLayout = {
      labelCol: {
        xs: { span: 12 },
        sm: { span: 10 },
        md: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 12 },
        sm: { span: 14 },
        md: { span: 16 },
      },
    };

    return (
      <Modal
        maskClosable={false}
        cancelText="关闭"
        okText="提交"
        onCancel={() => this.handleCloseForm()}
        visible={modalType !== ''}
        width={600}
        onOk={() => this.handleSaveClick()}
        title={modalType === 'create' ? '新增采购入库单明细' : '编辑采购入库单明细'}
      >
        <Form api={form} data={currentItem} layout="horizontal" {...formItemLayout}>
          {/* 第一行 */}
          <Row>
            <Col span={12}>
              <Input id="name" label="货品名称" msg="full" rules={['required']} />
            </Col>
            <Col span={12}>
              <Selector
                id="category"
                label="货品类型"
                data={dict.goods_type}
                rules={['required']}
              />
            </Col>
          </Row>
          {/* 第 2 行 */}
          <Row>
            <Col span={12}>
              <Input id="model" label="型号" msg="full" rules={['required']} />
            </Col>
            <Col span={12}>
              <Input id="barcode" label="条码" msg="full" rules={['required']} />
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}
