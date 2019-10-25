import React, { Component } from 'react';
import { Row, Col, Form, Input, InputNumber, Modal, Switch, Select } from 'antd';

const FormItem = Form.Item;
const Area = Input.TextArea;

@Form.create()
export default class AOEForm extends Component {
  componentDidMount() {
    // 加载树数据 - 只加载未停用状态的数据
    console.info('load goods detail');
  }

  // 关闭窗口
  handleCloseForm = () => {
    this.props.dispatch({
      type: 'goods/updateState',
      payload: {
        modalType: '',
      },
    });
  };

  // 校验条码唯一性
  checkCode = (rule, value, callback) => {
    const { getFieldValue } = this.props.form;
    const that = this;
    const code = getFieldValue('barcode');
    const { currentItem } = this.props;
    if (currentItem && currentItem.barcode && value === currentItem.barcode) {
      return callback();
    }
    const data = { code };
    that.props
      .dispatch({
        type: 'goods/checkUnique',
        payload: data,
      })
      .then(r => {
        if (r.success) {
          return callback();
        }
        return callback('该条码已经存在');
      });
  };

  // 保存
  handleSaveClick = () => {
    const { dispatch, currentItem } = this.props;
    const { getFieldsValue, validateFields } = this.props.form;
    // 对校验过的表单域 再进行一次强制表单校验
    validateFields({ force: true }, errors => {
      if (errors) {
        return;
      }
      const data = {
        ...getFieldsValue(),
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
    const { getFieldDecorator } = this.props.form;
    const { modalType, currentItem } = this.props;
    const cmView = modalType === 'view';

    const formRowTwo = {
      labelCol: { span: 8 },
      wrapperCol: { span: 14 },
    };

    const formRowOne = {
      labelCol: { span: 4 },
      wrapperCol: { span: 7 },
    };

    const formRowOneMx = {
      labelCol: { span: 4 },
      wrapperCol: { span: 19 },
    };

    return (
      <Modal
        maskClosable={false}
        onCancel={() => this.handleCloseForm()}
        visible={modalType !== ''}
        width={700}
        onOk={() => this.handleSaveClick()}
        title={
          modalType === 'create'
            ? '新增商品信息'
            : modalType === 'edit'
            ? '编辑商品信息'
            : '查看商品信息'
        }
      >
        <Form>
          {/* 第一行 */}
          <FormItem label="商品名称" hasFeedback labelCol={{ span: 4 }} wrapperCol={{ span: 19 }}>
            {getFieldDecorator('name', {
              initialValue: currentItem.name,
              rules: [{ required: true, message: '请输入商品名称' }],
            })(<Input />)}
          </FormItem>
          {/* 第二行 */}
          <FormItem label="品类" hasFeedback {...formRowOne}>
            {getFieldDecorator('category', {
              initialValue: currentItem.category,
              rules: [
                {
                  required: true,
                  message: '请选择商品分类',
                },
              ],
            })(
              <Select hasFeedback>
                <Select.Option value="toy">玩具</Select.Option>
                <Select.Option value="omament">饰品</Select.Option>
                <Select.Option value="Yiminghe">工艺品</Select.Option>
              </Select>,
            )}
          </FormItem>
          {/* 第三行 */}
          <FormItem label="助记码" hasFeedback {...formRowOne}>
            {getFieldDecorator('mnemonic', {
              initialValue: currentItem.mnemonic,
              rules: [{ required: true, message: '商品助记码' }],
            })(<Input />)}
          </FormItem>
          {/* 第四行 */}
          <Row>
            <Col span={12}>
              <FormItem label="货号" hasFeedback {...formRowTwo}>
                {getFieldDecorator('model', {
                  initialValue: currentItem.model,
                  rules: [{ required: true, message: '请输入货号' }],
                })(<Input />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="商品条码" hasFeedback {...formRowTwo}>
                {getFieldDecorator('barcode', {
                  initialValue: currentItem.barcode,
                  validateTrigger: 'onBlur',
                  rules: [{ required: true, message: '商品助记码' }, { validator: this.checkCode }],
                })(<Input />)}
              </FormItem>
            </Col>
          </Row>
          {/* 第五行 */}
          <Row>
            <Col span={12}>
              <FormItem label="单位" hasFeedback {...formRowTwo}>
                {getFieldDecorator('unit', {
                  initialValue: currentItem.unit,
                  rules: [{ required: true, message: '请选择商品单位' }],
                })(<Input />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="装箱规格" hasFeedback {...formRowTwo}>
                {getFieldDecorator('boxunit', {
                  initialValue: currentItem.boxunit,
                  rules: [{ type: 'number', message: '请输入装箱规格(仅限数字)' }],
                })(<InputNumber />)}
              </FormItem>
            </Col>
          </Row>
          {/* 第六行 */}
          <FormItem label="备注" hasFeedback {...formRowOneMx}>
            {getFieldDecorator('remark', {
              initialValue: currentItem.remark,
              rules: [
                {
                  message: '请输入备注',
                },
              ],
            })(<Area />)}
          </FormItem>
          {/* 第七行 */}
          {cmView && (
            <Row>
              <Col span={12}>
                <FormItem label="创建人" {...formRowTwo}>
                  <Input disabled defaultValue={currentItem.createBy} />
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="创建时间" {...formRowTwo}>
                  <Input disabled defaultValue={currentItem.gmtCreate} />
                </FormItem>
              </Col>
            </Row>
          )}
          {/* 第八行 */}
          {cmView && (
            <Row>
              <Col span={12}>
                <FormItem label="修改人" {...formRowTwo}>
                  <Input disabled defaultValue={currentItem.modifyBy} />
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="修改时间" {...formRowTwo}>
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
