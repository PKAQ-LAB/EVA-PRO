export type SysFrozen = 0 | 1 | 9999;
export type SysIntl = {
  formatMessage: (
    descriptor: { id: string; defaultMessage?: string },
    values?: Record<string, string | number>,
  ) => string;
};

export const normalizeFrozen = (value: unknown): SysFrozen => {
  if (value === 9999 || value === '9999') return 9999;
  if (value === 1 || value === '1') return 1;
  return 0;
};

export const sysText = (intl: SysIntl, id: string, defaultMessage: string) =>
  intl.formatMessage({ id, defaultMessage });

export const frozenText = (intl: SysIntl, value: unknown) => {
  const frozen = normalizeFrozen(value);
  if (frozen === 9999) {
    return sysText(intl, 'pages.sys.status.readonly', '只读');
  }
  if (frozen === 1) {
    return sysText(intl, 'pages.sys.status.locked', '已锁定');
  }
  return sysText(intl, 'pages.sys.status.unlocked', '未锁定');
};
