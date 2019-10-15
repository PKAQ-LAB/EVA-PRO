import React, { PureComponent } from 'react';
import { Select } from 'antd';
import request from '@/utils/request';

const { Option } = Select;

/**
 * 远程获取下拉菜单选项
 */
export default class Selector extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      options: [],
    };
  }

  componentDidMount() {
    const { code } = this.props;
    if (code) {
      request(`/api/dict/query/${code}`).then(response => {
        if (response && response.data) {
          const data = Object.keys(response.data);
          const options = data.map(v => <Option key={v}>{response.data[v]}</Option>);
          this.setState({
            options,
          });
        }
      });
    }
  }

  render() {
    const { options } = this.state;
    return <Select {...this.props}>{options}</Select>;
  }
}
