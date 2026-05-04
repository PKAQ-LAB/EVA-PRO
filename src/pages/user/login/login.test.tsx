// @ts-ignore
import { startMock } from '@@/requestRecordMock';
import { TestBrowser } from '@@/testBrowser';
import { fireEvent, render } from '@testing-library/react';
import React, { act } from 'react';

let server: {
  close: () => void;
};

describe('Login Page', () => {
  beforeAll(async () => {
    server = await startMock({
      port: 8000,
      scene: 'login',
    });
  });

  afterAll(() => {
    server?.close();
  });

  it('should show login form', async () => {
    const historyRef = React.createRef<any>();
    const rootContainer = render(
      <TestBrowser
        historyRef={historyRef}
        location={{
          pathname: '/user/login',
        }}
      />,
    );

    await rootContainer.findByPlaceholderText('Account: admin');

    act(() => {
      historyRef.current?.push('/user/login');
    });

    expect(
      rootContainer.baseElement?.querySelector('.ant-pro-form-login-desc')
        ?.textContent,
    ).toBe('This is subTitle');

    expect(rootContainer.asFragment()).toMatchSnapshot();

    rootContainer.unmount();
  });

  it('should login success', async () => {
    const historyRef = React.createRef<any>();
    const rootContainer = render(
      <TestBrowser
        historyRef={historyRef}
        location={{
          pathname: '/user/login',
        }}
      />,
    );

    await rootContainer.findByPlaceholderText('Account: admin');

    const accountInput =
      await rootContainer.findByPlaceholderText('Account: admin');

    act(() => {
      fireEvent.change(accountInput, { target: { value: 'admin' } });
    });

    const passwordInput =
      await rootContainer.findByPlaceholderText('Password: admin123');

    act(() => {
      fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    });

    await (await rootContainer.findByText('Login')).click();

    // Wait for login to succeed and navigate to home page
    await rootContainer.findAllByText('Eva Admin Pro', undefined, {
      timeout: 10000,
    });

    expect(rootContainer.asFragment()).toMatchSnapshot();

    rootContainer.unmount();
  });
});
