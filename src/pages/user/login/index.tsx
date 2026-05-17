import { LockOutlined, UserOutlined } from '@ant-design/icons';
import {
  LoginForm,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import {
  FormattedMessage,
  Helmet,
  SelectLang,
  useIntl,
  useModel,
} from '@umijs/max';
import { Alert, App } from 'antd';
import { createStyles } from 'antd-style';
import { MD5 } from 'jscrypto/es6/MD5';
import React, { startTransition, useState } from 'react';
import Cookies from 'universal-cookie';
import { Footer } from '@/components';
import { access_token, refresh_token } from '@/constant';
import { type AuthLoginResult, login } from '@/services/auth';
import Settings from '../../../../config/defaultSettings';

const cookies = new Cookies();

const useStyles = createStyles(({ token }) => {
  return {
    lang: {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      top: 16,
      zIndex: 1,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
    container: {
      display: 'flex',
      height: '100vh',
      minHeight: 600,
      overflow: 'hidden',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      '@media (max-width: 900px)': {
        overflow: 'auto',
      },
    },
    brandPanel: {
      flex: 1,
      minWidth: 0,
      '@media (max-width: 900px)': {
        display: 'none',
      },
    },
    loginPanel: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '30%',
      minWidth: 420,
      padding: '64px 48px',
      borderLeft: `1px solid ${token.colorBorderSecondary}`,
      backgroundColor: token.colorBgContainer,
      boxShadow: token.boxShadowSecondary,
      '@media (max-width: 900px)': {
        width: '100%',
        minWidth: 0,
        minHeight: '100vh',
        borderLeft: 0,
      },
    },
    formWrap: {
      width: '100%',
    },
    footer: {
      position: 'absolute',
      right: 0,
      bottom: 24,
      left: 0,
      padding: '0 24px',
    },
  };
});

const Lang = () => {
  const { styles } = useStyles();

  return (
    <div className={styles.lang} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      title={content}
      type="error"
      showIcon
    />
  );
};

interface LoginFormValues {
  account?: string;
  password?: string;
  autoLogin?: boolean;
}

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<AuthLoginResult>({});
  const { initialState, setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();
  const { message } = App.useApp();
  const intl = useIntl();

  /**
   * Validate redirect URL to prevent open redirect attacks
   * Only allow same-origin relative paths starting with '/'
   */
  const getSafeRedirectUrl = (redirect: string | null): string => {
    if (!redirect?.startsWith('/')) return '/';
    if (redirect.startsWith('//')) return '/';
    try {
      const parsed = new URL(redirect, window.location.origin);
      if (parsed.origin !== window.location.origin) return '/';
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      return '/';
    }
  };

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      startTransition(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
    }
  };

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      const payload = { ...values };
      if (payload.password) {
        payload.password = MD5.hash(payload.password).toString();
      }
      const msg = await login(payload);
      if (msg.status === 'ok') {
        // 1) 写入 cookie（TASK-15）
        const tokenValue = msg.data?.access_token ?? access_token;
        cookies.set(access_token, tokenValue, { path: '/' });
        if (msg.data?.refresh_token) {
          cookies.set(refresh_token, msg.data.refresh_token, { path: '/' });
        }
        // 2) 提示 + 刷新当前用户（fetchUserInfo 内部用 flushSync 同步刷新 state）
        const defaultLoginSuccessMessage = intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: '登录成功！',
        });
        message.success(defaultLoginSuccessMessage);
        await fetchUserInfo();
        // 3) 延迟一拍再跳转，让 React 完成 state flush 并避免在 unmount 中
        // 触发更新的告警（V5 EVA 的优化点）
        const urlParams = new URL(window.location.href).searchParams;
        const redirectUrl = getSafeRedirectUrl(urlParams.get('redirect'));
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 50);
        return;
      }
      setUserLoginState(msg);
    } catch (error) {
      const defaultLoginFailureMessage = intl.formatMessage({
        id: 'pages.login.failure',
        defaultMessage: '登录失败，请重试！',
      });
      console.log(error);
      message.error(defaultLoginFailureMessage);
    }
  };
  const { status } = userLoginState;

  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.login',
            defaultMessage: '登录页',
          })}
          {Settings.title && ` - ${Settings.title}`}
        </title>
      </Helmet>
      <Lang />
      <div className={styles.brandPanel} />
      <div className={styles.loginPanel}>
        <div className={styles.formWrap}>
          <LoginForm
            contentStyle={{
              minWidth: 280,
              maxWidth: '100%',
            }}
            logo={<img alt="logo" src="/logo.svg" />}
            title={Settings.title || 'Ant Design'}
            subTitle={
              Settings.subTitle ||
              intl.formatMessage({
                id: 'pages.layouts.userLayout.title',
              })
            }
            initialValues={{
              autoLogin: true,
            }}
            onFinish={async (values) => {
              await handleSubmit(values as LoginFormValues);
            }}
          >
            {status === 'error' && (
              <LoginMessage
                content={intl.formatMessage({
                  id: 'pages.login.accountLogin.errorMessage',
                  defaultMessage: '账户或密码错误(admin/ant.design)',
                })}
              />
            )}
            <ProFormText
              name="account"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined />,
              }}
              placeholder={intl.formatMessage({
                id: 'pages.login.account.placeholder',
                defaultMessage: '账号: admin or user',
              })}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="pages.login.account.required"
                      defaultMessage="请输入账号!"
                    />
                  ),
                },
              ]}
            />
            <ProFormText.Password
              name="password"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined />,
              }}
              placeholder={intl.formatMessage({
                id: 'pages.login.password.placeholder',
                defaultMessage: '密码: ant.design',
              })}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="pages.login.password.required"
                      defaultMessage="请输入密码！"
                    />
                  ),
                },
              ]}
            />
            <div
              style={{
                marginBottom: 24,
              }}
            >
              <ProFormCheckbox noStyle name="autoLogin">
                <FormattedMessage
                  id="pages.login.rememberMe"
                  defaultMessage="自动登录"
                />
              </ProFormCheckbox>
              <a
                href="#"
                style={{
                  float: 'right',
                }}
              >
                <FormattedMessage
                  id="pages.login.forgotPassword"
                  defaultMessage="忘记密码"
                />
              </a>
            </div>
          </LoginForm>
        </div>
        <div className={styles.footer}>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Login;
