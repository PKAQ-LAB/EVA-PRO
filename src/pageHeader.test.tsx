import { PageContainer, RouteContext } from '@ant-design/pro-components';
import { render, screen } from '@testing-library/react';
import { ConfigProvider, theme } from 'antd';
import { expect, it, vi } from 'vitest';

it.each(['light', 'realDark'] as const)(
  '%s真实页头只保留面包屑与导航，不删除正文和浏览器标题',
  (navTheme) => {
    const previousTitle = document.title;
    document.title = '角色管理 - Eva Admin Pro';
    const navigate = vi.fn();
    const view = render(
      <ConfigProvider
        theme={{
          algorithm:
            navTheme === 'realDark'
              ? theme.darkAlgorithm
              : theme.defaultAlgorithm,
        }}
      >
        <RouteContext.Provider
          value={{
            title: '上下文默认标题',
            breadcrumb: {
              items: [
                {
                  title: (
                    <a href="#/sys" onClick={navigate}>
                      系统管理
                    </a>
                  ),
                },
                { title: '角色管理' },
              ],
            },
          }}
        >
          <PageContainer
            title="角色管理"
            subTitle="角色权限维护"
            header={{ title: false, subTitle: false }}
          >
            <h2>正文业务标题</h2>
          </PageContainer>
        </RouteContext.Provider>
      </ConfigProvider>,
    );
    expect(view.container.querySelector('.ant-page-header')).not.toBeNull();
    expect(
      view.container.querySelector('[class*="page-header-heading"]'),
    ).toBeNull();
    expect(view.container.querySelector('.ant-breadcrumb')).not.toBeNull();
    expect(
      screen.getByRole('heading', { name: '正文业务标题' }),
    ).toBeInTheDocument();
    const link = screen.getByRole('link', { name: '系统管理' });
    expect(link).toHaveAttribute('href', '#/sys');
    link.click();
    expect(navigate).toHaveBeenCalledOnce();
    expect(document.title).toBe('角色管理 - Eva Admin Pro');
    view.unmount();
    document.title = previousTitle;
  },
);
