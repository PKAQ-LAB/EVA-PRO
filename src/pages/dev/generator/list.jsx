/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-syntax */
/* eslint-disable array-callback-return */
/* eslint-disable no-param-reassign */
import React, { PureComponent } from 'react';
import { Form, Input, Button, Tabs, Row, Col, message, Checkbox } from 'antd';
import { connect } from 'dva';
import EditableList from './EditableList';

const FormItem = Form.Item;
const { TabPane } = Tabs;

@Form.create()
@connect(state => ({
  item: state.item,
}))
export default class Item extends PureComponent {
  componentDidMount() {
    const panes = [
      {
        name: '主表配置',
        key: '0',
      },
    ];
    this.props.dispatch({
      type: 'item/updateState',
      payload: {
        panes,
        tabKey: '0',
        items: {
          mainItem: [],
        },
      },
    });
  }

  // 页面切换
  tabSwitch = key => {
    this.props.dispatch({
      type: 'item/updateState',
      payload: {
        tabKey: key,
      },
    });
  };

  // 子表删除
  handleSubRemove = key => {
    const { panes, items } = this.props.item;
    const { length } = panes;

    panes.splice(key, 1);
    panes.forEach((pane, i) => {
      if (pane.key !== '0') {
        pane.name = `子表配置-${i}`;
        pane.key = `${i}`;
      }
    });

    for (let k = key; k < length; k++) {
      items[`subItem${k}`] = items[`subItem${Number(k) + 1}`] || [];
    }

    this.props.dispatch({
      type: 'item/updateState',
      payload: {
        panes,
        tabKey: '0',
        items,
      },
    });
  };

  // 添加子表
  handleAddSubList = () => {
    const { panes, items } = this.props.item;
    if (items.mainItem.length > 0) {
      const key = panes.length;
      panes.push({
        name: `子表配置-${key}`,
        key: `${key}`,
      });
      items[`subItem${key}`] = [];
      this.props.dispatch({
        type: 'item/updateState',
        payload: {
          panes,
          items,
        },
      });
    } else {
      message.error('请先获取主表信息');
    }
  };

  // 获取子表
  getSubList = key => {
    const subData1 = [
      {
        key: '1',
        columnName: 'subName',
        comment: '姓名s',
        length: 100,
        columnType: 'varchar',
        nullAble: true,
        codeMapping: '姓名s',
        sort: true,
        listShow: false,
        formShow: true,
        condition: false,
        componentType: 'input',
        showName: '姓名s',
      },
      {
        key: '2',
        columnName: 'prop',
        comment: '年龄',
        length: 100,
        columnType: 'int',
        nullAble: true,
        codeMapping: '年龄',
        sort: false,
        listShow: true,
        formShow: false,
        condition: true,
        componentType: 'input',
        showName: '年龄',
      },
    ];
    const subData2 = [
      {
        key: '1',
        columnName: 'subName',
        comment: '姓名n',
        length: 100,
        columnType: 'varchar',
        nullAble: true,
        codeMapping: '姓名n',
        sort: true,
        listShow: false,
        formShow: true,
        condition: false,
        componentType: 'input',
        showName: '姓名n',
      },
      {
        key: '2',
        columnName: 'prop',
        comment: '年龄',
        length: 100,
        columnType: 'int',
        nullAble: true,
        codeMapping: '年龄',
        sort: false,
        listShow: true,
        formShow: false,
        condition: true,
        componentType: 'input',
        showName: '年龄',
      },
    ];
    const { items } = this.props.item;
    // 先判断输入框是否有值
    items[`subItem${key}`] = key === '1' ? subData1 : subData2;
    this.props.dispatch({
      type: 'item/updateState',
      payload: {
        items,
      },
    });
  };

  // 获取主表
  getMainList = () => {
    const mainData = [
      {
        key: '1',
        columnName: 'name',
        comment: '姓名',
        length: 100,
        columnType: 'varchar',
        nullAble: true,
        codeMapping: '姓名',
        sort: true,
        listShow: false,
        formShow: true,
        searchAble: false,
        componentType: 'input',
        showName: '姓名',
      },
      {
        key: '2',
        columnName: 'age',
        comment: '年龄',
        length: 100,
        columnType: 'int',
        nullAble: true,
        codeMapping: '年龄',
        sort: false,
        listShow: true,
        formShow: false,
        searchAble: true,
        componentType: 'input',
        showName: '年龄',
      },
    ];
    this.props.dispatch({
      type: 'item/updateState',
      payload: {
        items: {
          mainItem: mainData,
        },
      },
    });
  };

  // 子表头部渲染
  renderSubTableTopBtn(key) {
    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 16 },
    };
    return (
      <Row>
        <Col span={12}>
          <FormItem label="表名:" labelAlign="left" {...formItemLayout}>
            {getFieldDecorator(`subName${key}`, {
              initialValue: '',
            })(<Input placeholder="请输入子表表名" onBlur={() => this.getSubList(key)} />)}
          </FormItem>
        </Col>
        <Col span={2}>
          <Button
            ghost
            type="danger"
            onClick={() => this.handleSubRemove(key)}
            style={{ marginTop: '4px' }}
          >
            删除
          </Button>
        </Col>
        <Col span={8}>
          <FormItem label="支持导入:" {...formItemLayout}>
            {getFieldDecorator(`uploadAble${key}`, {
              initialValue: false,
            })(<Checkbox />)}
          </FormItem>
        </Col>
      </Row>
    );
  }

  // 表格头部渲染
  renderTableTopBtn() {
    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 16 },
    };
    return (
      <Row>
        <Col span={12}>
          <FormItem label="主表名:" labelAlign="left" {...formItemLayout}>
            {getFieldDecorator('mainTableName', {
              initialValue: '',
            })(<Input placeholder="请输入主表表名" onBlur={() => this.getMainList()} />)}
          </FormItem>
        </Col>
        <Col span={3}>
          <Button type="primary" onClick={() => this.handleAddSubList()}>
            添加子表
          </Button>
        </Col>
      </Row>
    );
  }

  render() {
    const { form } = this.props;
    const { panes, tabKey } = this.props.item;
    const formprop = {
      form,
    };
    return (
      <Form style={{ padding: '0 35px' }}>
        {this.renderTableTopBtn()}
        <Tabs defaultActiveKey="0" activeKey={tabKey} onChange={key => this.tabSwitch(key)}>
          {panes.map(pane =>
            pane.key === '0' ? (
              <TabPane tab={pane.name} key={pane.key}>
                <EditableList {...formprop} />
              </TabPane>
            ) : (
              <TabPane tab={pane.name} key={pane.key}>
                {this.renderSubTableTopBtn(pane.key)}
                <EditableList {...formprop} />
              </TabPane>
            ),
          )}
        </Tabs>
      </Form>
    );
  }
}
