/** 数据权限能力只接受成功认证响应的外层布尔值。 */
export function dataPermissionFromResponse(response: {
  success?: boolean;
  status?: string;
  dataPermissionEnabled?: unknown;
}): boolean | undefined {
  return response.success !== false &&
    (response.success === true || response.status === 'ok') &&
    typeof response.dataPermissionEnabled === 'boolean'
    ? response.dataPermissionEnabled
    : undefined;
}
