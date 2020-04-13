import React, { Component } from 'react';
import { Form, Row, Col, Input, InputNumber, Modal } from 'antd';
// import TreeSelector from '@/components/TreeSelector/index';

const FormItem = Form.Item;
const Area = Input.TextArea;

export default class AOEForm extends Component {

  formRef = React.createRef();

  // 关闭窗口
  handleCloseForm = () => {
    this.props.dispatch({
      type: 'goods/updateState',
      payload: {
        modalType: '',
      },
    });
  };

  // 保存
  handleSaveClick = () => {
    const { dispatch, currentItem } = this.props;
    const { validateFields } = this.formRef.current;
    validateFields().then(values => {
      const data = {
        ...values,
        id: currentItem.id,
      };
      dispatch({
        type: 'goods/save',
        payload: data,
      });
    });
  };

  // 渲染界面
  render() {
    const { modalType, currentItem } = this.props;
    const cmView = modalType === 'view';
    const title = { create: '新增', edit: '编辑' };

    const formlayout = {
      labelCol: { flex: "0 0 100px" },
      wrapperCol: { flex: "auto" },
    };


    return (
      <Modal
        maskClosable={false}
        centered
        onCancel={() => this.handleCloseForm()}
        visible={modalType !== ''}
        width={700}
        onOk={() => this.handleSaveClick()}
        title={`${title[modalType] || '查看'}商品信息`}
      >
        <Form ref={this.formRef} {...formlayout} hasFeedback initialValue={currentItem}>
          {/* 第一行 */}
          <FormItem label="商品名称"
                    name="name"
                    rules={[
                      {
                        required: true,
                        message: '请输入商品名称',
                      },
                    ]} >
            <Input />
          </FormItem>

          {/* 第二行 */}
          <FormItem label="品类"
                    name="category"
                    rules={[
                      {
                        required: true,
                        message: '请选择商品分类',
                      },
                    ]} >
                    <></>
          </FormItem>

          {/* 第三行 */}
          <FormItem label="助记码" name="mnemonic">
            <Input />
          </FormItem>
          {/* 第四行 */}
          <Row>
            <Col span={12}>
              <FormItem label="货号" name="itemNo">
                <Input />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="商品条码" name="barcode">
                <Input />
              </FormItem>
            </Col>
          </Row>
          {/* 第五行 */}
          <Row>
            <Col span={12}>
              <FormItem label="单位" name="unit">
                <Input />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="装箱规格" name="boxunit">
                <InputNumber />
              </FormItem>
            </Col>
          </Row>
          {/* 第六行 */}
          <FormItem label="备注" hasFeedback name="remark">
            <Area />
          </FormItem>
          {/* 第七行 */}
          {cmView && (
            <Row>
              <Col span={12}>
                <FormItem label="创建人" >
                  <Input disabled defaultValue={currentItem.createBy} />
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="创建时间" >
                  <Input disabled defaultValue={currentItem.gmtCreate} />
                </FormItem>
              </Col>
            </Row>
          )}
          {/* 第八行 */}
          {cmView && (
            <Row>
              <Col span={12}>
                <FormItem label="修改人" >
                  <Input disabled defaultValue={currentItem.modifyBy} />
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="修改时间" >
                  <Input disabled defaultValue={currentItem.gmtModify} />
                </FormItem>
              </Col>
            </Row>
          )}
        </Form>
      </Modal>
    );
  }
}
