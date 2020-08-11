import React, { PureComponent } from 'react';
import { Select } from 'antd';
import { request } from 'umi';

const { Option } = Select;

/**
 * 远程获取下拉菜单选项
 * 优先使用 data 传递进来得数据
 * 如果data不存在使用url获取远程数据
 */
export default class Selector extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      options: [],
      showall: true,
    };
  }

  componentDidMount() {
    let { data } = this.props;
    const { showall, url, k, v } = this.props;

    this.setState({
      showall
    });

    if (data) {
      if(typeof data === 'string'){
        data = JSON.parse(data);
      }
      const options = data.map(it => <Option key={it[k]}>{it[v]}</Option>);

      this.setState({
        options,
      });
    } else if (url) {
      request(`${url}`).then(response => {
        if (response && response.data) {
          const rdata = response.data;

          const options = rdata.map(it => <Option key={it[k]}>{it[v]}</Option>);
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
