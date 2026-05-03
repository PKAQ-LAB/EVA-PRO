import * as AntIcons from '@ant-design/icons';
import { Button, Input, Popover } from 'antd';
import React, { useCallback, useMemo, useState } from 'react';
import iconNames from './icons';
import styles from './index.module.css';

const toComponentName = (name: string) =>
  `${name
    .split('-')
    .map((s) => (s.length ? s[0].toUpperCase() + s.slice(1) : s))
    .join('')}Outlined`;

const resolveIcon = (
  name: string,
): React.ComponentType<Record<string, unknown>> | null => {
  const componentName = toComponentName(name);
  const lib = AntIcons as unknown as Record<
    string,
    React.ComponentType<Record<string, unknown>>
  >;
  return lib[componentName] ?? null;
};

export interface IconSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  width?: number | string;
}

/**
 * 图标选择器：从 ./icons 中的白名单解析对应的 antd Outlined 图标。
 */
const IconSelect: React.FC<IconSelectProps> = ({
  value: controlled,
  onChange,
  width,
}) => {
  const [innerValue, setInnerValue] = useState<string>(controlled ?? '');
  const value = controlled ?? innerValue;

  const handleChange = useCallback(
    (next: string) => {
      if (controlled === undefined) setInnerValue(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );

  const resolvedActive = useMemo(
    () => (value ? resolveIcon(value) : null),
    [value],
  );

  const iconBox = (
    <div className={styles.iconInner} style={width ? { width } : undefined}>
      <div className={styles.iconList}>
        {iconNames.map((name) => {
          const Icon = resolveIcon(name);
          if (!Icon) return null;
          return (
            <Button
              key={name}
              icon={<Icon />}
              type={value === name ? 'primary' : 'default'}
              onClick={() => handleChange(name)}
            />
          );
        })}
      </div>
    </div>
  );

  return (
    <div className={styles.iconSelect}>
      <Popover content={iconBox} trigger="click">
        <Input
          placeholder="请选择图标"
          addonBefore={
            resolvedActive ? (
              <span style={{ color: '#40a9ff' }}>
                {React.createElement(resolvedActive)}
              </span>
            ) : undefined
          }
          value={value}
          readOnly
        />
      </Popover>
    </div>
  );
};

export default IconSelect;
