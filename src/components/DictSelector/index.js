import React, { PureComponent } from 'react';
import { Select } from 'antd';
import request from '@/utils/request';

const { Option } = Select;

/**
 * 远程获取下拉菜单选项
 * 优先使用 data 传递进来得数据
 * 如果data不存在使用code 获取远程数据
 */
export default class DictSelector extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      options: [],
      showall: true,
    };
  }

  componentDidMount() {
    let { data } = this.props;
    const { code, showall } = this.props;

    this.setState({
      showall
    });

    if (data) {
      if(typeof data === 'string'){
        data = JSON.parse(data);
      }
      const k = Object.keys(data);

      const options = k.map(v => <Option key={v}>{data[v]}</Option>);
      this.setState({
        options,
      });
    } else if (code) {
      request(`/api/sys/dict/query/${code}`).then(response => {
        if (response && response.data) {
          const rdata = Object.keys(response.data);
          const options = rdata.map(v => <Option key={v}>{response.data[v]}</Option>);
          this.setState({
            options,
          });
        }
      });
    }
  }

  render() {
    const { options, showall } = this.state;
    return (
      <Select {...this.props}>
        {showall && <Option value="0000">全部</Option>}
        {options}
      </Select>
    );
  }
}
