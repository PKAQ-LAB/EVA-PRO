import React, { Component } from 'react';
import { Input, Popover, Button, Icon } from 'antd';
import iconsData from './icons';
import styles from './index.less';

export default class IconSelect extends Component {
  static getDerivedStateFromProps(nextProps) {
    // Should be a controlled component.
    if ('value' in nextProps) {
      return {
        ...(nextProps.value || {}),
      };
    }
    return null;
  }

  constructor(props) {
    super(props);

    const value = props.value || '';
    this.state = {
      value,
    };
  }

  handleChangeAction = value => {
    if ('value' in this.props) {
      this.setState({ value });
    }
    this.triggerChange(value);
  };

  triggerChange = value => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(value);
    }
  };

  render() {
    const { value } = this.state;
    const { width } = this.props;

    const iconBox = (
      <div className={styles.icon_inner} style={{ width }}>
        <div className={styles.icon_list}>
          {iconsData.map(icon => (
            <Button
              key={icon}
              icon={icon}
              type={value === icon ? 'primary' : 'default'}
              onClick={() => this.handleChangeAction(icon)}
            />
          ))}
        </div>
      </div>
    );

    return (
      <div>
        <Popover content={iconBox} trigger="click">
          <Input
            type="primary"
            placeholder="请选择图标"
            addonBefore={value && <Icon type={value} style={{ color: '#40a9ff', border: '0' }} />}
            onChange={this.handleChangeAction}
            readOnly
            value={value}
          />
        </Popover>
      </div>
    );
  }
}
