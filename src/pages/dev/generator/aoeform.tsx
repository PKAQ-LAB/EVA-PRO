import { Col, Form, Input, Row, Select } from 'antd';
import React from 'react';
import type { ProjectMeta } from './data.d';

export interface ProjectMetaFormProps {
  form: ReturnType<typeof Form.useForm<ProjectMeta>>[0];
  initialValues?: ProjectMeta;
}

const formItemLayout = { labelCol: { span: 2 }, wrapperCol: { span: 8 } };
const formGrid = { labelCol: { span: 2 }, wrapperCol: { span: 20 } };
const formGridLayout = { labelCol: { span: 4 }, wrapperCol: { span: 16 } };

const ProjectMetaForm: React.FC<ProjectMetaFormProps> = ({
  form,
  initialValues,
}) => (
  <Form
    form={form}
    style={{ padding: '0 35px' }}
    initialValues={{
      orm: 'jpa',
      pageable: '0',
      selection: '0',
      ...initialValues,
    }}
  >
    <Form.Item label="名称" name="title" labelAlign="left" {...formItemLayout}>
      <Input placeholder="请输入模块名称" />
    </Form.Item>
    <Form.Item label="描述" name="description" labelAlign="left" {...formGrid}>
      <Input placeholder="请输入模块描述" />
    </Form.Item>
    <Row>
      <Col span={12}>
        <Form.Item
          label="Project Name"
          name="projectName"
          labelAlign="left"
          {...formItemLayout}
        >
          <Input
            style={{ width: '80%' }}
            placeholder="请输入项目名称（英文）"
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          label="Module Name"
          name="moduleName"
          labelAlign="left"
          {...formItemLayout}
        >
          <Input style={{ width: '80%' }} placeholder="请输入模块名（英文）" />
        </Form.Item>
      </Col>
    </Row>
    <Form.Item
      label="Package Name"
      name="packageName"
      labelAlign="left"
      {...formGrid}
    >
      <Input placeholder="请输入后台包名" />
    </Form.Item>
    <Form.Item
      label="ORM 选型"
      name="orm"
      labelAlign="left"
      {...formItemLayout}
    >
      <Select
        options={[
          { value: 'jpa', label: 'JPA' },
          { value: 'mybatis', label: 'Mybatis' },
        ]}
      />
    </Form.Item>
    <Row>
      <Col span={12}>
        <Form.Item
          label="是否分页"
          name="pageable"
          labelAlign="left"
          {...formGridLayout}
        >
          <Select
            options={[
              { value: '0', label: '是' },
              { value: '1', label: '否' },
            ]}
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          label="是否多选"
          name="selection"
          labelAlign="left"
          {...formGridLayout}
        >
          <Select
            options={[
              { value: '0', label: '是' },
              { value: '1', label: '否' },
            ]}
          />
        </Form.Item>
      </Col>
    </Row>
    <Form.Item label="界面模型" name="ui" labelAlign="left" {...formItemLayout}>
      <Select
        options={[
          { value: '0', label: '列表弹窗（单表）' },
          { value: '1', label: '卡片弹窗（单表）' },
          { value: '2', label: '列表 Tab（单表）' },
          { value: '3', label: '树结构（单表）' },
          { value: '4', label: '列表侧滑（单表）' },
          { value: '5', label: '主子表 Tab（多表）' },
        ]}
      />
    </Form.Item>
  </Form>
);

export default ProjectMetaForm;
