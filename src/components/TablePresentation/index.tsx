import { Tooltip } from 'antd';
import type { CSSProperties, ReactNode } from 'react';

export function TextCell({
  text,
  children,
  maxWidth = '100%',
}: {
  text: unknown;
  children?: ReactNode;
  maxWidth?: CSSProperties['maxWidth'];
}) {
  const value =
    typeof text === 'string' || typeof text === 'number' ? String(text) : '';
  if (!value) return <span>—</span>;
  return (
    <Tooltip
      title={value}
      classNames={{ root: 'eva-table-text-tooltip' }}
      styles={{
        root: { maxWidth: 'min(640px, calc(100vw - 32px))' },
        container: { whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' },
      }}
    >
      <span
        style={{
          display: 'inline-block',
          verticalAlign: 'middle',
          maxWidth,
          minWidth: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {children ?? value}
      </span>
    </Tooltip>
  );
}

export function textColumn<T>(
  title: ReactNode,
  key: Extract<keyof T, string>,
  width: number,
) {
  return {
    title,
    dataIndex: key,
    width,
    align: 'left' as const,
    ellipsis: { showTitle: false },
    render: (_: unknown, record: T) => <TextCell text={record[key]} />,
  };
}

const actionStyle: CSSProperties = {
  textAlign: 'center',
  whiteSpace: 'nowrap',
  overflow: 'visible',
  textOverflow: 'clip',
};
export function actionColumn(width: number) {
  return {
    align: 'center' as const,
    width,
    minWidth: width,
    ellipsis: false,
    onCell: () => ({ style: actionStyle }),
    onHeaderCell: () => ({ style: actionStyle }),
  };
}

export function ActionGroup({ children }: { children: ReactNode }) {
  return (
    <span
      data-no-row-view
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'nowrap',
        whiteSpace: 'nowrap',
        overflow: 'visible',
        gap: 4,
      }}
    >
      {children}
    </span>
  );
}
