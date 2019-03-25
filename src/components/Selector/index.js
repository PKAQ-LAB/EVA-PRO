import React, { PureComponent } from 'react';
import { Select } from 'antd';
import request from '@/utils/request';
const Option = Select.Option;

/**
 * 远程获取下拉菜单选项
 */
export default class Selector extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      code: '',
      options: [],
    };
  }
  componentDidMount() {
    const code = this.props.code;
    if (code) {
      request(`/dict/query/${code}`).then( response => {
        if(response && response.data){
          const data = Object.keys(response.data);
          const options = data.map(v =>
            <Option key={v} value={v}>
              { response.data[v] }
            </Option>
          );
          this.setState({
            options
          })
        }
      });
    }
  }
  render() {
    const { options } = this.state;
    return (
      <Select { ...this.props }>
        <Option value="">全部</Option>
        {options}
      </Select>
    )
  }
}
