import { theme } from 'antd';

/** 新增、编辑表单共用分隔线，仅补齐标题和按钮靠近分隔线一侧的留白。 */
export default function useFormDialogStyles() {
  const { token } = theme.useToken();
  const border = `1px solid ${token.colorBorderSecondary}`;
  return {
    header: { borderBlockEnd: border, paddingBlockEnd: token.padding },
    footer: { borderBlockStart: border, paddingBlockStart: token.padding },
  };
}
