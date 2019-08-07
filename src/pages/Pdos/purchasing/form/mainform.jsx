import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Row,
  Col,
  Card,
  Input,
  DatePicker,
  Form,
  Tooltip,
  Icon,
  Select,
  Button,
  Divider,
  Modal,
} from 'antd';
import Cookies from 'universal-cookie';
import ConsumerSelector from '@/components/ConsumerSelector';
import CompanyPureSelector from '@/components/CompanyPureSelector';

const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;
const cookies = new Cookies();
/* eslint-disable */
@Form.create()
@connect(state => ({
  submitting: state.loading.effects['waybillMgt/save'],
  waybillMgt: state.waybillMgt,
}))
export default class MainAOEForm extends PureComponent {
  disabledDate = current => {
    return (
      current &&
      current <=
        moment()
          .subtract(1, 'days')
          .endOf('day')
    );
  };

  // 关闭
  handleCancelClick = () => {
    this.props.dispatch({
      type: 'waybillMgt/updateState',
      payload: {
        editTab: false,
        activeKey: 'list',
        operateType: '',
        // 清空编辑时留存的数据
        currentItem: {},
        lineData: [],
        selectedLineRowKeys: [],
      },
    });
  };

  // 重置事件
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    dispatch({
      type: 'waybillMgt/updateState',
      payload: {
        operateType: '',
        // 清空编辑时留存的数据
        currentItem: {},
        lineData: [],
        selectedLineRowKeys: [],
      },
    });
  };

  // 企业名称修改
  handleCompanyChange = (v, o) => {
    const label = o.props.label;
    this.props.form.setFieldsValue({
      sendDeptName: label,
    });
  };

  // 保存信息
  handleSave = () => {
    const { dispatch } = this.props;
    const { getFieldsValue, validateFields } = this.props.form;
    const { currentItem, lineData } = this.props.waybillMgt;

    if (!lineData || lineData.length < 1) {
      Modal.error({ title: `明细数据不允许为空` });
      return;
    }

    validateFields(errors => {
      if (errors) {
        return;
      }
      const data = {
        ...getFieldsValue(),
        id: currentItem.id,
        lineList: lineData,
      };
      dispatch({
        type: 'waybillMgt/save',
        payload: data,
      });
    });
  };

  // 填写运单完成后校验同一企业的运单号是否存在，存在则把该运单信息返回
  checkBcheckByWillnumlack = (rule, value, callback) => {
    const { id } = this.props.waybillMgt.currentItem;
    // 判断当前用户是否是企业
    const { getFieldValue } = this.props.form;

    const companyCustomeId = getFieldValue('companyCustomeId');
    const waybillNum = getFieldValue('waybillNum');

    if (!waybillNum || !companyCustomeId) return;

    this.props
      .dispatch({
        type: 'waybillMgt/checkByWillnum',
        payload: {
          id,
          waybillNum,
          companyCustomeId,
        },
      })
      .then(r => {
        if (r.data) {
          return callback(`运单号 ${waybillNum} 已存在，请重新输入`);
        }
        return callback();
      });
  };

  // 渲染按钮
  renderBtn() {
    const { submitting } = this.props;
    return (
      <div>
        <Button type="primary" onClick={() => this.handleSave()} loading={submitting}>
          提交保存
        </Button>
        <Divider type="vertical" />
        <Button onClick={() => this.handleFormReset()}>重填</Button>
        <Divider type="vertical" />
        <Button onClick={() => this.handleCancelClick()}>取消</Button>
      </div>
    );
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { currentItem } = this.props.waybillMgt;

    const ext = cookies.get('eva_ext');

    let zdy = ext.name;
    if (currentItem && currentItem.id) {
      zdy = currentItem.creator.name;
    }

    const dateFormat = 'YYYY-MM-DD';
    // 得到当前登录用户的企业名称
    const companyName = ext && ext.companyName ? ext.companyName : '无法获取企业名称';
    // 判断当前用户是否是企业客户
    const isCustomer = ext && ext.registeType && ext.registeType === '0002';
    // 判断当前用户是否是企业
    const isCompany = ext && ext.registeType && ext.registeType === '0001';

    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };

    return (
      <Card title="运单信息" extra={this.renderBtn()}>
        <Form layout="horizontal" {...formItemLayout}>
          {/* 第一行 */}
          <Row gutter={24}>
            <Col span={8}>
              <FormItem label="企业名称" {...formItemLayout} style={{ marginBottom: 0 }}>
                {isCompany
                  ? companyName
                  : getFieldDecorator('companyId', {
                      initialValue: currentItem.companyId,
                      rules: [{ message: '请选择入驻企业' }],
                    })(<CompanyPureSelector onChange={(v, o) => this.handleCompanyChange(v, o)} />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <span style={{ fontSize: 14, textAlign: 'right', float: 'right' }}>
                <label style={{ fontWeight: 'bold' }}>制单员：</label>
                <label>{zdy}</label>
                <label style={{ fontWeight: 'bold', marginLeft: '20px' }}>制单时间 ： </label>
                <label>{currentItem.gmtCreate || moment().format('YYYY-MM-DD HH:mm')}</label>
              </span>
            </Col>
          </Row>
          {/* 第二行 */}
          <Row gutter={24}>
            <Col span={8}>
              <FormItem label="通知单/运单号" {...formItemLayout} style={{ marginBottom: 0 }}>
                {getFieldDecorator('waybillNum', {
                  initialValue: currentItem.waybillNum,
                  // validateTrigger: 'onBlur',
                  rules: [
                    // { validator: this.checkBcheckByWillnumlack },
                    { message: '请输入通知单号', required: true },
                  ],
                })(<Input />)}
              </FormItem>
            </Col>
          </Row>
          {/* 第三行 */}
          <Row gutter={24}>
            <Col span={8}>
              <FormItem label="业务类型" {...formItemLayout} style={{ marginBottom: 0 }}>
                {getFieldDecorator('businessType', {
                  initialValue: currentItem.businessType === '卸货入场' ? '0001' : '0002',
                })(
                  <Select
                    style={{ width: '100%' }}
                    placeholder="请选择"
                    onSelect={this.handleInputChange}
                  >
                    <Option value="0001">入场装货</Option>
                    <Option value="0002">入场卸货</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="计划日期" {...formItemLayout} style={{ marginBottom: 0 }}>
                <RangePicker
                  disabledDate={this.disabledDate}
                  showTime={{
                    hideDisabledOptions: true,
                    defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('11:59:59', 'HH:mm:ss')],
                  }}
                  defaultValue={
                    currentItem.startDate && currentItem.endDate
                      ? [
                          moment(currentItem.startDate, dateFormat),
                          moment(currentItem.endDate, dateFormat),
                        ]
                      : [moment().startOf('day'), moment().add('days', 90)]
                  }
                  format={dateFormat}
                  style={{ width: '100%' }}
                  onChange={this.onChangDate}
                />
              </FormItem>
            </Col>
          </Row>
          {/* 第四行 */}
          <Row gutter={24}>
            <Col span={8}>
              <FormItem label="客户名称" {...formItemLayout} style={{ marginBottom: 0 }}>
                {/* 查找与企业有关系的的企业客户 */}
                {isCustomer
                  ? companyName
                  : getFieldDecorator('companyCustomeId', {
                      initialValue: currentItem.companyCustomeId,
                      // validateTrigger: 'onSelect',
                      rules: [
                        // { validator: this.checkBcheckByWillnumlack },
                        { message: '请选择企业客户', required: true },
                      ],
                    })(<ConsumerSelector />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="发货单位" style={{ marginBottom: 0 }}>
                {getFieldDecorator('sendDeptName', {
                  initialValue: currentItem.sendDeptName ? currentItem.sendDeptName : companyName,
                })(<Input id="sendDeptName" />)}
              </FormItem>
            </Col>
          </Row>
          {/* 第五行 */}
          <Row gutter={24}>
            <Col span={8}>
              <FormItem
                label="作业任务名称"
                style={{ textAlign: 'right', marginBottom: 0 }}
                {...formItemLayout}
              >
                {getFieldDecorator('taskName', {
                  rules: [
                    {
                      message: '请输入作业任务名称',
                      required: true,
                    },
                  ],
                  initialValue: currentItem.taskName,
                })(
                  <Input
                    suffix={
                      <Tooltip title="作业任务用于区分一个企业不同的作业名称，方便相关人员进行区分，比如：山东海科卸货装船">
                        <Icon type="info-circle" style={{ color: 'rgba(77, 38, 233, 1)' }} />
                      </Tooltip>
                    }
                  />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="收货单位" style={{ marginBottom: 0 }}>
                {getFieldDecorator('receiveDeptName', {
                  initialValue: currentItem.receiveDeptName,
                  rules: [{ message: '请输入收货单位' }],
                })(<Input id="receiveDeptName" />)}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Card>
    );
  }
}
