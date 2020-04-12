import React from 'react';
import { connect } from 'umi';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Form, Input, Row, Col, Switch, Drawer, Button, Tooltip } from 'antd';
import IconSelect from '@/components/IconSelect';
import TreeSelector from '@/components/TreeSelector';

import LineList from './linelist';

@connect(state => ({
  module: state.module,
  submitting: state.loading.effects['module/save'],
}))
export default class AOEForm extends React.Component {

  formRef = React.createRef();

  // 关闭窗口
  handleCloseForm = () => {
    this.props.dispatch({
      type: 'module/updateState',
      payload: {
        modalType: '',
      },
    });
  };

  // 校验路径唯一性
  // eslint-disable-next-line consistent-return
  checkPath = (re, value, callback) => {
    const { getFieldValue } = this.formRef.current;
    const that = this;
    const path = getFieldValue('path');

    const parentId = getFieldValue('parentId');
    const { currentItem } = this.props.module;
    const data = { id: currentItem.id, path, parentId };
    that.props
      .dispatch({
        type: 'module/checkUnique',
        payload: data,
      })
      .then(r => {
        if (r && r.success) {
          return callback();
        }
        return callback('该路径已存在');
      });
  };

  // 保存
  handleSaveClick = () => {
    const { currentItem, lineData } = this.props.module;
    const { validateFields } = this.formRef.current;
    // 对校验过的表单域 再进行一次强制表单校验
    validateFields().then(values => {
      const data = {
        ...values,
        id: currentItem.id,
      };

      data.resources = lineData;
      data.status = data.status ? '0001' : '0000';
      this.props.dispatch({
        type: 'module/save',
        payload: data,
      });
    })
  };

  // 渲染界面
  render() {
    const { submitting } = this.props;
    const { modalType, currentItem, data } = this.props.module;

    const title = { create: '新增', edit: '编辑' };

    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
    };

    const formRowOne = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };

    return (
      <Drawer
        width={640}
        maskClosable={false}
        onClose={() => this.handleCloseForm()}
        visible={modalType !== ''}
        title={`${title[modalType] || '查看'}模块信息`}
      >
        <Form initialValues={currentItem} ref={this.formRef} {...formItemLayout} colon>
          <Form.Item
                  label="模块名称"
                  name="name"
                  rules={[{required: true,max: 30, min: 2}]}>
            <Input max={30} />
          </Form.Item>

          <Form.Item
                  label="Path"
                  name="path"
                  rules={[{
                    max: 40,
                    min: 5,
                    required: true,
                    whitespace: true,
                    validator: this.checkPath,
                    validateTrigger: "onBlur",
                    message: '路径格式错误, 必须以‘/’开头，仅允许使用字母或数字.',
                    pattern: new RegExp(/^\/[a-zA-Z_]*[/a-zA-Z_0-9]{2,40}$/),
                  }]}>
            <Input max={40}/>
          </Form.Item>

          <Form.Item
                  label="模块图标"
                  name="icon"
                  rules={[{required: true}]}>
           <IconSelect width={480} />
          </Form.Item>

          <Form.Item
            label={
              <span>
                上级模块&nbsp;
                <Tooltip title="留空为添加顶级模块">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            name="parentId"
            rules={[{required: true}]}>
            <TreeSelector
              data={data}
              keys={['id', 'name', 'children']}
              search
              treeDefaultExpandAll
              allowClear
              showSearch
              placeholder="请选择上级模块（留空为添加顶级模块）"
            />
          </Form.Item>

          <Row>
            <Col span={12}>
              <Form.Item
                  label="显示顺序"
                  name="orders"
                  {...formRowOne}
                  rules={[{required: true,max: 5}]}>
                <Input max={5}  />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                  label="是否启用"
                  name="status"
                  {...formRowOne}>
                <Switch
                  checkedChildren="启用"
                  unCheckedChildren="停用"
                  initialValue={currentItem.status ? currentItem.status === '0000' : true}
                  defaultChecked={currentItem.status ? currentItem.status === '0000' : true}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
                  label="备注"
                  name="remark"
                  rules={[{len: 200}]}>
            <Input.TextArea max={200} />
          </Form.Item>
        </Form>

        <LineList />

        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #e9e9e9',
            padding: '10px 16px',
            background: '#fff',
            textAlign: 'right',
          }}
        >
          <Button onClick={this.handleCloseForm} style={{ marginRight: 8 }} loading={submitting}>
            取消
          </Button>
          <Button onClick={this.handleSaveClick} type="primary" loading={submitting}>
            保存
          </Button>
        </div>
      </Drawer>
    );
  }
}
