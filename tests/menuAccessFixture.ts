/** 与权限无关的界面用例只声明其实际页面动作，不模拟管理员特权。 */
export const menuAccessFixture = (
  grants: Record<string, readonly string[]>,
) => {
  const checks = Object.fromEntries(
    Object.entries(grants).map(([menu, keys]) => [
      menu,
      (key: string) => keys.includes(key),
    ]),
  );
  const denied = () => false;
  return (menu: string) => checks[menu] ?? denied;
};
