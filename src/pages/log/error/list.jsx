import React from 'react';
import { Table, Form, Button, Row, Col, Divider, DatePicker } from 'antd';
import moment from 'moment';

import Service from '@/services/service';
import API from '@/apis';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;

export default (props) => {
  const [ form ] = Form.useForm();

  const { loading, fetch, setCurrentItem, setOperateType, tableProps,} = props;

  // 重置
  const handleFormReset = () => {
    form.resetFields();
    fetch();
  };

  // 查询
  const handleSearch = () => {
    const { validateFields } = form;
    validateFields().then(values => {

      const param = {};
      param.begin = values.requestTime ? moment(values.requestTime[0]).format('YYYY-MM-DD') : '';
      param.end = values.requestTime ? moment(values.requestTime[1]).format('YYYY-MM-DD') : '';
      fetch(param);
    });
  };

  // 查看明细
  const handleEditClick = records => {
    if (!records.id) {
      return;
    }
    Service.get(API.ERROR_GET,
        records.id,
    ).then((res) => {
      if(res.success){
        setOperateType("check");
        setCurrentItem(res.data);
      }
    })
  };

  // 查询条件渲染
  const renderSimpleForm = () => {

    return (
      <Form layout="inline" initialValues={{"requestTime": [moment().add(-7, 'days'), moment()]}} form={form}>
        <Row type="flex" justify="space-between">
          <Col>
            <FormItem label="操作时间" name="requestTime">
              <RangePicker />
            </FormItem>
          </Col>
          <Col>
            <FormItem>
              <Button type="primary" onClick={handleSearch} loading={loading}>
                查询
              </Button>
              <Divider type="vertical" />
              <Button onClick={handleFormReset} loading={loading}>
                重置
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  const columns = [
    {
      title: '类名',
      dataIndex: 'className',
      width: 180,
      ellipsis: true,
    },
    {
      title: '异常描述',
      dataIndex: 'exDesc',
      width: 240,
      ellipsis: true,
    },
    {
      title: '请求ip',
      dataIndex: 'ip',
    },
    {
      title: '方法名',
      dataIndex: 'method',
    },
    {
      title: '方法参数',
      dataIndex: 'params',
      width: 240,
      ellipsis: true,
    },
    {
      title: '记录时间',
      dataIndex: 'requestTime',
    },
    {
      title: '请求耗时',
      dataIndex: 'spendTime',
    },
    {
      title: '操作',
      render: record => (
          <a onClick={() => handleEditClick(record, 'check')}>查看</a>
      ),
    },
  ];


  return (
    <>
    <div className="eva-ribbon">{renderSimpleForm()}</div>
    <div className="eva-body">
      <Table pagination {...tableProps} bordered columns={columns} />
    </div>
    </>
  )
}
