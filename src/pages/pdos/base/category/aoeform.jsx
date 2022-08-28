import React from 'react';
import TreeSelector from '@/components/TreeSelector';
import { Row, Col, Input, Modal, Switch, Form } from 'antd';
import { checkUnique, editCategory } from './services/categorySvc';

const FormItem = Form.Item;
const Area = Input.TextArea;

export default (props) => {

  const [ form ] = Form.useForm();
  const { operateType, setOperateType, currentItem, fetch, data  } = props;

  const cmView = operateType === 'view';
  const title = { create: '新增', edit: '编辑' };

  const formItemLayout = {
    labelCol: { flex: "0 0 90px" },
    wrapperCol: { flex: "auto" },
  };

  const formInit = {
    ...currentItem,
    status: currentItem.status ? currentItem.status === '0001' : true
  }

  // 校验编码唯一性
  const checkCode = async (rule, value) => {
    const { getFieldValue } = form;
    const code = getFieldValue('code');
    if (currentItem && currentItem.code && value === currentItem.code) {
      return Promise.resolve();
    }
    await checkUnique({code}).then(r => {
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
      const fd = {
        ...values,
        id: currentItem.id,
      };
      fd.status = fd.status ? '0001' : '0000';
      editCategory(fd).then(() => {
        fetch();
      })
    });
  };

  // 渲染界面
  return (
    <Modal
      maskClosable={false}
      centered
      onCancel={() => setOperateType("")}
      visible={operateType !== ''}
      width={600}
      onOk={() => handleSaveClick()}
      title={`${title[operateType] || '查看'}分类编码`}
    >
      <Form {...formItemLayout} initialValues={formInit} hasFeedback form={form} >
        {/* 第一行 */}
        <FormItem label="分类编码"
                  name="code"
                  hasFeedback
                  validateTrigger='onBlur'
                  rules={[{ required: true,
                            validator: checkCode
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
