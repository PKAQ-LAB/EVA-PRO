import * as AntIcons from '@ant-design/icons';
import { Button, Input, Popover, Space } from 'antd';
import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  id?: string;
  disabled?: boolean;
}

/**
 * 图标选择器：从 ./icons 中的白名单解析对应的 antd Outlined 图标。
 */
const IconSelect: React.FC<IconSelectProps> = ({
  value: controlled,
  onChange,
  width,
  id,
  disabled = false,
}) => {
  const anchorRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState<number>();
  const measure = useCallback(() => {
    const nextWidth = anchorRef.current?.getBoundingClientRect().width;
    if (nextWidth && nextWidth > 0) setPanelWidth(nextWidth);
  }, []);
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
  useLayoutEffect(() => {
    measure();
    const observer =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(measure);
    if (anchorRef.current) observer?.observe(anchorRef.current);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure]);
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

  const handleKeyDown: React.KeyboardEventHandler<HTMLElement> = (event) => {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      anchorRef.current
        ?.querySelector<HTMLButtonElement>('button[aria-controls]')
        ?.focus();
    }
  };
  const iconBox = (
    <fieldset
      id={panelId}
      aria-label="图标面板"
      className={styles.iconInner}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.iconList}>
        {iconNames.map((name) => {
          const Icon = resolveIcon(name);
          if (!Icon) return null;
          return (
            <Button
              key={name}
              icon={<Icon />}
              aria-label={name}
              disabled={disabled}
              type={value === name ? 'primary' : 'default'}
              onClick={() => {
                if (!disabled) {
                  handleChange(name);
                  setOpen(false);
                }
              }}
            />
          );
        })}
      </div>
    </fieldset>
  );

  return (
    <div
      ref={anchorRef}
      className={styles.iconSelect}
      style={{ width: width ?? '100%' }}
    >
      <Space.Compact block>
        <Input
          id={id}
          disabled={disabled}
          placeholder="请选择图标"
          value={value}
          readOnly
        />
        <Popover
          content={iconBox}
          trigger="click"
          placement="bottomRight"
          open={open && !disabled}
          onOpenChange={(next) => {
            if (!disabled) {
              measure();
              setOpen(next);
            }
          }}
          styles={{ root: { width: panelWidth, boxSizing: 'border-box' } }}
        >
          <Button
            aria-label="选择图标"
            aria-expanded={open && !disabled}
            aria-controls={panelId}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            icon={
              resolvedActive ? (
                React.createElement(resolvedActive)
              ) : (
                <AntIcons.AppstoreOutlined />
              )
            }
          />
        </Popover>
      </Space.Compact>
    </div>
  );
};

export default IconSelect;
