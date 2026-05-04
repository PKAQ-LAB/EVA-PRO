import {
  EditableProTable,
  type EditableProTableProps,
  type ProColumns,
} from '@ant-design/pro-components';
import React from 'react';
import type { ColumnItem } from './data.d';

export interface ColumnTableProps {
  value: ColumnItem[];
  onChange: (rows: ColumnItem[]) => void;
}

/**
 * 取代 V5 的 EditableList Class 组件 + dva model + EditableContext，
 * 改用 ProComponents v3 的 EditableProTable，所有状态由父组件持有。
 */
const ColumnTable: React.FC<ColumnTableProps> = ({ value, onChange }) => {
  const columns: ProColumns<ColumnItem>[] = [
    { title: '字段名称', dataIndex: 'columnName', valueType: 'text' },
    { title: '字段描述', dataIndex: 'comment', valueType: 'text' },
    {
      title: '字段长度',
      dataIndex: 'length',
      valueType: 'digit',
      width: 80,
    },
    {
      title: '字段类型',
      dataIndex: 'columnType',
      valueType: 'select',
      width: 110,
      valueEnum: {
        varchar: { text: 'varchar' },
        int: { text: 'int' },
        text: { text: 'text' },
        date: { text: 'date' },
        bool: { text: 'bool' },
      },
    },
    {
      title: '允许空值',
      dataIndex: 'nullAble',
      valueType: 'switch',
      width: 80,
      align: 'center',
    },
    { title: '字典映射', dataIndex: 'codeMapping', valueType: 'text' },
    {
      title: '列头排序',
      dataIndex: 'sort',
      valueType: 'switch',
      width: 80,
      align: 'center',
    },
    {
      title: '列表显示',
      dataIndex: 'listShow',
      valueType: 'switch',
      width: 80,
      align: 'center',
    },
    {
      title: '表单显示',
      dataIndex: 'formShow',
      valueType: 'switch',
      width: 80,
      align: 'center',
    },
    {
      title: '查询条件',
      dataIndex: 'searchAble',
      valueType: 'switch',
      width: 80,
      align: 'center',
    },
    {
      title: '控件类型',
      dataIndex: 'componentType',
      valueType: 'select',
      width: 110,
      valueEnum: {
        input: { text: 'Input' },
        button: { text: 'Button' },
      },
    },
    { title: '显示名称', dataIndex: 'showName', valueType: 'text' },
    {
      title: '操作',
      valueType: 'option',
      width: 90,
      render: () => null,
    },
  ];

  const tableProps: EditableProTableProps<
    ColumnItem,
    Record<string, unknown>
  > = {
    rowKey: 'key',
    columns,
    value,
    onChange: (rows) => onChange((rows ?? []) as ColumnItem[]),
    recordCreatorProps: {
      newRecordType: 'dataSource',
      record: () => ({
        key: `${Date.now()}`,
        columnName: '',
        comment: '',
        nullAble: true,
        sort: false,
        listShow: false,
        formShow: true,
        searchAble: false,
        componentType: 'input',
        showName: '',
      }),
    },
    editable: {
      type: 'multiple',
      // 默认全部可编辑
      editableKeys: value.map((r) => r.key),
      onValuesChange: (_record, recordList) => {
        onChange(recordList);
      },
    },
    scroll: { x: 'max-content' },
  };

  return <EditableProTable<ColumnItem> {...tableProps} />;
};

export default ColumnTable;
