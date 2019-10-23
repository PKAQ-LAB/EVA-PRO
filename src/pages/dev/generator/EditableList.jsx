/* eslint-disable no-constant-condition */
/* eslint-disable no-restricted-syntax */
import React from 'react';
import { connect } from 'dva';
import { Input, Table, Checkbox, Select, Form } from 'antd';
import styles from './index.less';

const FormItem = Form.Item;
const EditableContext = React.createContext();

class EditableCell extends React.Component {
  saveItem = (name, inputtype) => {
    const { form, items, dispatch } = this.props;
    const { getFieldsValue } = form;
    const data = {
      ...getFieldsValue(),
    };
    const maps = name.split('_');
    const dataIndex = maps[0];
    const itemType = maps[1];
    const key = maps[2] - 1;
    items[itemType][key][dataIndex] =
      inputtype === 'checkbox' ? data[name][0] || false : data[name];
    dispatch({
      type: 'item/updateState',
      payload: {
        items,
      },
    });
  };

  getInput = name => {
    const { inputtype } = this.props;
    if (inputtype === 'checkbox') {
      return (
        <Checkbox.Group onBlur={() => this.saveItem(name, inputtype)}>
          <Checkbox value />
        </Checkbox.Group>
      );
    }
    if (inputtype === 'select') {
      return (
        <Select style={{ width: '100px' }} onBlur={() => this.saveItem(name, inputtype)}>
          <Select.Option value="input">Input</Select.Option>
          <Select.Option value="button">Button</Select.Option>
        </Select>
      );
    }
    return <Input style={{ width: '100px' }} onBlur={() => this.saveItem(name, inputtype)} />;
  };

  renderCell = ({ getFieldDecorator }) => {
    const { tabkey, inputtype, record, dataindex, ...restProps } = this.props;
    // 多选框时，文本居中
    const style = { textAlign: inputtype === 'checkbox' ? 'center' : '' };
    const data = record[dataindex];
    const itemType = tabkey === '0' ? 'mainItem' : `subItem${tabkey}`;
    const itemName = `${dataindex}_${itemType}_${record.key}`;
    return (
      <td {...restProps} className={styles.td} style={style}>
        {inputtype !== 'text' ? (
          <FormItem style={{ margin: 0 }}>
            {getFieldDecorator(itemName, {
              initialValue: inputtype === 'checkbox' ? [data || false] : data || '',
            })(this.getInput(itemName))}
          </FormItem>
        ) : (
          data || ''
        )}
      </td>
    );
  };

  render() {
    return <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>;
  }
}

@connect(state => ({
  item: state.item,
}))
class EditableList extends React.Component {
  render() {
    const { form, dispatch } = this.props;
    const { items, tabKey } = this.props.item;

    const columns = [
      {
        title: '字段名称',
        dataIndex: 'columnName',
        inputType: 'text',
      },
      {
        title: '字段描述',
        dataIndex: 'comment',
        inputType: 'text',
      },
      {
        title: '字段长度',
        dataIndex: 'length',
        inputType: 'text',
      },
      {
        title: '字段类型',
        dataIndex: 'columnType',
        inputType: 'text',
      },
      {
        title: '允许空值',
        dataIndex: 'nullAble',
        inputType: 'checkbox',
        align: 'center',
      },
      {
        title: '字典映射',
        dataIndex: 'codeMapping',
        inputType: 'input',
      },
      {
        title: '列头排序',
        dataIndex: 'sort',
        inputType: 'checkbox',
        align: 'center',
      },
      {
        title: '列表显示',
        dataIndex: 'listShow',
        inputType: 'checkbox',
        align: 'center',
      },
      {
        title: '表单显示',
        dataIndex: 'formShow',
        inputType: 'checkbox',
        align: 'center',
      },
      {
        title: '查询条件',
        dataIndex: 'searchAble',
        inputType: 'checkbox',
        align: 'center',
      },
      {
        title: '控件类型',
        dataIndex: 'componentType',
        inputType: 'select',
      },
      {
        title: '显示名称',
        dataIndex: 'showName',
        inputType: 'input',
      },
    ];

    const components = {
      body: {
        cell: EditableCell,
      },
    };

    const editColumns = columns.map(col => ({
      ...col,
      onCell: record => ({
        record,
        inputtype: col.inputType,
        dataindex: col.dataIndex,
        tabkey: tabKey,
        form,
        items,
        dispatch,
      }),
    }));
    return (
      <EditableContext.Provider value={form}>
        <Table
          bordered={false}
          columns={editColumns}
          dataSource={tabKey === '0' ? items.mainItem : items[`subItem${tabKey}`]}
          rowKey={record => record.key}
          components={components}
          pagination={false}
          scroll={{ x: true }}
        />
      </EditableContext.Provider>
    );
  }
}

export default EditableList;
