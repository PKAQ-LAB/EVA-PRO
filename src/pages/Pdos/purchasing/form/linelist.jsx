import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Table, Card, Button, Divider, Popconfirm, Upload, Modal } from 'antd';
import * as XLSX from 'xlsx';
import defaultSettings from '@/defaultSettings';
import LineAOEForm from './lineform';

const goodsType = { 汽油: '0001', 柴油: '0002', 甲烷: '0003' };
const unit = { KG: '0001', 'm³': '0002', L: '0003' };

@connect(state => ({
  waybillMgt: state.waybillMgt,
  loading: state.loading.models.waybillMgt,
}))
export default class WayBillMgtLineList extends PureComponent {
  // 新增窗口
  handleModalVisible = () => {
    this.props.dispatch({
      type: 'waybillMgt/updateState',
      payload: {
        modalType: 'create',
        editItem: undefined,
      },
    });
  };

  // 删除明细
  handleDeleteClick = index => {
    const { lineData, selectedLineRowKeys } = this.props.waybillMgt;
    if (index || index === 0) {
      lineData.splice(index, 1);
    } else {
      selectedLineRowKeys.forEach(item => {
        lineData.splice(item, 1);
      });
    }
    this.props.dispatch({
      type: 'waybillMgt/updateState',
      payload: { lineData },
    });
  };

  // 修改编辑
  handleEditClick = (record, index) => {
    this.props.dispatch({
      type: 'waybillMgt/updateState',
      payload: {
        modalType: 'edit',
        editItem: index,
      },
    });
  };

  // 行选事件
  handleSelectRows = rows => {
    this.props.dispatch({
      type: 'waybillMgt/updateState',
      payload: { selectedLineRowKeys: rows },
    });
  };

  // excel上传
  handleUpload = (file, fileList) => {
    let { lineData } = this.props.waybillMgt;
    const that = this;

    const rABS = true;
    const f = fileList[0];
    const reader = new FileReader();
    reader.onload = e => {
      let data = e.target.result;
      // eslint-disable-next-line
      if (!rABS) data = new Uint8Array(data);
      const workbook = XLSX.read(data, {
        type: rABS ? 'binary' : 'array',
      });

      const errors = {
        success: 0,
        error: 0,
        errorLine: [],
      };

      // 假设我们的数据在第一个标签
      const firstWorksheet = workbook.Sheets[workbook.SheetNames[0]];
      // XLSX自带了一个工具把导入的数据转成json
      let jsonArr = XLSX.utils.sheet_to_json(firstWorksheet, { header: 1 });
      // 通过自定义的方法处理Json，比如加入state来展示
      // 删除表头
      jsonArr.shift();
      // 删除空行
      jsonArr = jsonArr.filter(item => {
        return item && item.length > 0;
      });

      errors.success = jsonArr.length;

      jsonArr = jsonArr.map((item, index) => {
        // 错误记录
        if (!item[1] || !item[2]) {
          errors.success -= 1;
          errors.error += 1;
          errors.errorLine.push(index + 2);
          return {};
        }
        // 构建子表对象
        const tempObj = {};
        tempObj.carNum = item[0];
        tempObj.goodsName = item[1];
        tempObj.goodsType = goodsType[item[2]];
        tempObj.planAmount = item[3];
        tempObj.unitName = item[4];
        tempObj.unit = unit[item[4]];
        tempObj.tankNumber = item[5];
        tempObj.remark = item[6];

        return tempObj;
      });
      // 过滤空对象
      jsonArr = jsonArr.filter(item => {
        return Object.keys(item).length > 0;
      });

      lineData = lineData.concat(jsonArr);

      that.props.dispatch({
        type: 'waybillMgt/updateState',
        payload: { lineData },
      });
      // 导入提示
      Modal.info({
        title: '导入完成',
        content: (
          <div>
            <p style={{ color: 'green' }}>导入成功: {errors.success} 条.</p>
            <p style={{ color: 'red' }}>导入失败: {errors.error} 条.</p>
            {errors.errorLine && errors.errorLine.length > 1 && (
              <p>第 [{errors.errorLine.join(' , ')}] 行导入失败.</p>
            )}
          </div>
        ),
      });
    };

    if (rABS) {
      reader.readAsBinaryString(f);
    } else {
      reader.readAsArrayBuffer(f);
    }

    return false;
  };

  renderBtn() {
    const { selectedLineRowKeys } = this.props.waybillMgt;
    return (
      <div>
        <Button type="primary" onClick={() => this.handleModalVisible()}>
          新增明细
        </Button>
        <Divider type="vertical" />
        {selectedLineRowKeys.length > 0 && (
          <Popconfirm
            title="确定要删除选中的运单明细吗?"
            placement="top"
            onConfirm={() => this.handleDeleteClick()}
          >
            <Button type="danger">删除</Button>
          </Popconfirm>
        )}
        {selectedLineRowKeys.length > 0 && <Divider type="vertical" />}
        <Upload beforeUpload={this.handleUpload} showUploadList={false}>
          <Button>Excel导入</Button>
        </Upload>
        <Divider type="vertical" />
        <Button href={`${defaultSettings.URL}/template.xlsx`} target="_blank">
          下载Excel导入模板
        </Button>
      </div>
    );
  }

  render() {
    const { selectedLineRowKeys, lineData, modalType } = this.props.waybillMgt;
    const { loading } = this.props;

    const columns = [
      {
        render: (t, r, i) => i + 1,
        width: 30,
        fixed: 'left',
      },
      {
        title: '车牌号',
        align: 'center',
        dataIndex: 'carNum',
        render: text => {
          return (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 90 }}>{text}</div>
          );
        },
        sorter: (a, b) => a.carNum && a.carNum.localeCompare(b.carNum),
      },
      {
        title: '货品名称',
        align: 'left',
        dataIndex: 'goodsName',
        render: text => {
          return (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 150 }}>{text}</div>
          );
        },
      },
      {
        title: '计划量',
        align: 'left',
        dataIndex: 'planAmount',
        render: text => {
          return (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 120 }}>{text}</div>
          );
        },
      },
      {
        title: '单位',
        align: 'center',
        dataIndex: 'unitName',
        render: (text, record) => {
          return (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 60 }}>
              {record.unitName || record.unit}
            </div>
          );
        },
      },
      {
        title: '储罐编号',
        align: 'left',
        dataIndex: 'tankNumber',
        render: text => {
          return (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 120 }}>{text}</div>
          );
        },
      },
      {
        title: '备注',
        align: 'left',
        dataIndex: 'remark',
        render: text => {
          return (
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 120 }}>{text}</div>
          );
        },
      },
      {
        fixed: 'right',
        width: 120,
        render: (text, record, index) => (
          <div style={{ wordWrap: 'break-word', wordBreak: 'break-all', width: 120 }}>
            <a onClick={() => this.handleEditClick(record, index)}>修改</a>
            <Divider type="vertical" />
            <Popconfirm
              title="确定要删除吗？"
              okText="确定"
              cancelText="取消"
              onConfirm={() => this.handleDeleteClick(index)}
            >
              <a>删除</a>
            </Popconfirm>
          </div>
        ),
      },
    ];

    const rowSelectionProps = {
      fixed: true,
      columnWidth: 30,
      selectedLineRowKeys,
      onChange: selectedKeys => {
        this.handleSelectRows(selectedKeys);
      },
    };

    return (
      <Card title="运单明细" extra={this.renderBtn()} bodyStyle={{ padding: 0 }}>
        <Table
          loading={loading}
          bordered
          size="small"
          pagination={false}
          rowKey={record => record.id}
          rowSelection={rowSelectionProps}
          rowClassName={record => (record.locked === '0002' ? 'disabled' : 'enabled')}
          onSelect={this.handleSelectRows}
          onChange={this.handleListChange}
          dataSource={lineData}
          columns={columns}
        />
        {modalType && <LineAOEForm />}
      </Card>
    );
  }
}
