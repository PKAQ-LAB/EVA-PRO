import React, { Component } from 'react';
import TreeSelector from '@/components/TreeSelector';
import { Row, Col, Input, Modal, Switch, Form } from 'antd';
import { connect } from 'umi';

const FormItem = Form.Item;
const Area = Input.TextArea;

@connect(({ loading, category }) => ({
  category,
  loading: loading.models.category,
}))
export default class AOEForm extends Component {

  formRef = React.createRef();

  componentDidMount() {
    // 加载树数据 - 只加载未停用状态的数据
  }

  // 关闭窗口
  handleCloseForm = () => {
    this.props.dispatch({
      type: 'category/updateState',
      payload: {
        modalType: '',
      },
    });
  };

  // 校验编码唯一性
  checkCode = (rule, value, callback) => {
    const { getFieldValue } = this.props.form;
    const that = this;
    const code = getFieldValue('code');
    const { currentItem } = this.props;
    if (currentItem && currentItem.code && value === currentItem.code) {
      return callback();
    }
    const data = { code };
    that.props
      .dispatch({
        type: 'category/checkUnique',
        payload: data,
      })
      .then(r => {
        if (r.success) {
          return callback();
        }
        return callback('该分类编码已存在');
      });
  };

  // 保存
  handleSaveClick = () => {
    const { currentItem } = this.props.category;
    const { validateFields } = this.formRef.current;
    validateFields().then(values => {
      const data = {
        ...values,
        id: currentItem.id,
      };
      data.status = data.status ? '0001' : '0000';
      this.props.dispatch({
        type: 'category/save',
        payload: data,
      });
    });
  };

  // 渲染界面
  render() {
    const { loading } = this.props;

    const { modalType, currentItem, data } = this.props.category;
    const cmView = modalType === 'view';

    const title = { create: '新增', edit: '编辑' };

    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 14 },
    };
    const formRowOne = {
      labelCol: { span: 4 },
      wrapperCol: { span: 19 },
    };


    return (
      <Modal
        maskClosable={false}
        loading={loading}
        centered
        onCancel={() => this.handleCloseForm()}
        visible={modalType !== ''}
        width={600}
        onOk={() => this.handleSaveClick()}
        title={`${title[modalType] || '查看'}分类编码`}
      >
        <Form {...formRowOne} initialValues={currentItem} hasFeedback ref={this.formRef} >
          {/* 第一行 */}
          <FormItem label="分类编码"
                    name="code"
                    rules={[{ required: true,
                              message: '请输入分类编码',
                              // validateTrigger: 'onBlur',
                              // validator: this.checkCode
                          }]}>
            <Input />
          </FormItem>
          <FormItem label="分类名称"
                    name="name"
                    rules={[{ required: true, message: '请输入分类名称' }]} >
            <Input />
          </FormItem>
          {/* 第二行 */}
          <FormItem label="上级编码" name="parentId">
            <TreeSelector
              data={data}
              keys={['id', 'name', 'children']}
              search
              treeDefaultExpandAll
              allowClear
              showSearch
              placeholder="请选择上级模块（留空为添加顶级模块）"
            />
          </FormItem>
          <FormItem label="状态"  name="status">
            <Switch checkedChildren="启用"
                    unCheckedChildren="停用"
                    initialValue={currentItem.status ? currentItem.status === '0000' : true}
                    defaultChecked={currentItem.status ? currentItem.status === '0000' : true}
            />
          </FormItem>
          {/* 第四行 */}
          <FormItem label="备注" name="remark" >
            <Area />
          </FormItem>
          {/* 第五行 */}
          {cmView && (
            <Row>
              <Col span={12}>
                <FormItem label="创建人" {...formItemLayout}>
                  <Input disabled defaultValue={currentItem.description} />
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="创建时间" {...formItemLayout}>
                  <Input disabled defaultValue={currentItem.description} />
                </FormItem>
              </Col>
            </Row>
          )}
          {/* 第六行 */}
          {cmView && (
            <Row>
              <Col span={12}>
                <FormItem label="修改人" {...formItemLayout}>
                  <Input disabled defaultValue={currentItem.description} />
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="修改时间" {...formItemLayout}>
                  <Input disabled defaultValue={currentItem.description} />
                </FormItem>
              </Col>
            </Row>
          )}
        </Form>
      </Modal>
    );
  }
}
