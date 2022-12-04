import React from 'react';
import Generator from 'fr-generator';
import { PageContainer } from '@ant-design/pro-components';

const defaultValue = {
  propsSchema: {
    type: 'object',
    properties: {
      inputName: {
        title: '简单输入框',
        type: 'string',
      },
    },
  },
  displayType: 'row',
  showDescIcon: true,
  labelWidth: 120,
};

const templates = [
  {
    text: '模板1',
    name: 'something',
    schema: {
      title: '对象',
      description: '这是一个对象类型',
      type: 'object',
      properties: {
        inputName: {
          title: '简单输入框',
          type: 'string',
        },
        selectName: {
          title: '单选',
          type: 'string',
          enum: ['a', 'b', 'c'],
          enumNames: ['早', '中', '晚'],
        },
        dateName: {
          title: '时间选择',
          type: 'string',
          format: 'date',
        },
      },
    },
  },
];

export default () => {
  const submit = schema => {
    alert(JSON.stringify(schema));
  };

  return (
    <PageContainer>
      <Generator
        defaultValue={defaultValue}
        templates={templates}
        submit={submit}
      />
    </PageContainer>
  );
};

