import {
  ArrowRightOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { Helmet, history, SelectLang, useIntl, useModel } from '@umijs/max';
import { App, Button, Form, Input } from 'antd';
import { createStyles } from 'antd-style';
import { MD5 } from 'jscrypto/es6/MD5';
import React, { useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import Cookies from 'universal-cookie';
import { refresh_token, user_key } from '@/constant';
import { type AuthLoginResult, login } from '@/services/auth';
import { fetchDict, fetchMenus } from '@/services/user';
import {
  clearAuthState,
  getErrorMessage,
  isAuthExpiredError,
  redirectToLogin,
  setStoredAccessToken,
} from '@/utils/authState';
import Settings from '../../../../config/defaultSettings';

const loginMenuCacheKey = 'eva_login_menus';
const currentUserCacheKey = 'eva_current_user';

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const useStyles = createStyles(({ token, css }) => ({
  page: css`
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(420px, 1fr);
    min-height: 100vh;
    overflow: hidden;
    background: #050505;
    color: #f8fafc;

    @media (max-width: 960px) {
      grid-template-columns: 1fr;
      overflow: auto;
    }
  `,
  leftPane: css`
    position: relative;
    min-height: 100vh;
    overflow: hidden;
    background:
      radial-gradient(circle at 56% 38%, #dedede 0%, #d4d4d4 18%, transparent 38%),
      #d1d1d1;

    @media (max-width: 960px) {
      min-height: 360px;
    }
  `,
  brand: css`
    position: absolute;
    top: 40px;
    left: 44px;
    z-index: 2;
    display: inline-flex;
    align-items: center;
    gap: 12px;
    color: #111827;
    font-size: 17px;
    font-weight: 700;
  `,
  brandMark: css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 999px;
    background: #050505;
    color: #fff;
    font-size: 14px;
    font-weight: 800;
  `,
  language: css`
    position: absolute;
    top: 32px;
    right: 32px;
    z-index: 3;
    width: 42px;
    height: 42px;
    border-radius: ${token.borderRadius}px;
    color: #d1d5db;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
    }
  `,
  charactersWrap: css`
    position: absolute;
    top: 50%;
    left: 50%;
    width: 550px;
    height: 420px;
    transform: translate(-50%, -36%);

    @media (max-width: 960px) {
      top: 58%;
      transform: translate(-50%, -40%) scale(0.55);
      transform-origin: center;
    }
  `,
  characters: css`
    position: relative;
    width: 550px;
    height: 420px;
  `,
  character: css`
    position: absolute;
    bottom: 0;
    transition:
      transform 0.3s ease,
      height 0.35s ease;
    transform-origin: bottom center;
  `,
  purple: css`
    left: 70px;
    z-index: 1;
    width: 180px;
    height: 400px;
    border-radius: 10px 10px 0 0;
    background: #6d3ff7;
    transform: skewX(-3deg);
  `,
  black: css`
    left: 240px;
    z-index: 2;
    width: 120px;
    height: 310px;
    border-radius: 8px 8px 0 0;
    background: #2d2d2d;
    transform: skewX(2deg);
  `,
  orange: css`
    left: 0;
    z-index: 3;
    width: 240px;
    height: 200px;
    border-radius: 120px 120px 0 0;
    background: #ff9a66;
    transform: skewX(-5deg);
  `,
  yellow: css`
    left: 310px;
    z-index: 4;
    width: 140px;
    height: 230px;
    border-radius: 70px 70px 0 0;
    background: #ead94f;
    transform: skewX(1deg);
  `,
  eyes: css`
    position: absolute;
    display: flex;
    gap: 26px;
    transition:
      left 0.2s ease,
      top 0.2s ease;
  `,
  eyeball: css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    overflow: hidden;
    border-radius: 999px;
    background: #fff;
    transition: height 0.15s ease;
  `,
  pupil: css`
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: #2d2d2d;
    transform: translate(3px, -2px);
    transition: transform 0.1s ease;
  `,
  dotEye: css`
    width: 12px;
    height: 12px;
    border-radius: 999px;
    background: #2d2d2d;
    transition: transform 0.1s ease;
  `,
  mouth: css`
    position: absolute;
    top: 88px;
    left: 40px;
    width: 80px;
    height: 4px;
    border-radius: 999px;
    background: #2d2d2d;
    transition:
      left 0.2s ease,
      top 0.2s ease;
  `,
  leftLinks: css`
    position: absolute;
    bottom: 38px;
    left: 40px;
    display: flex;
    gap: 34px;
    color: #6b7280;
    font-size: 13px;
    font-weight: 600;

    a {
      color: inherit;
    }
  `,
  rightPane: css`
    position: relative;
    display: flex;
    min-height: 100vh;
    align-items: center;
    justify-content: center;
    padding: 56px 32px;
    background: #050505;

    @media (max-width: 960px) {
      min-height: auto;
      padding: 40px 20px 56px;
    }
  `,
  formBox: css`
    width: min(100%, 440px);
  `,
  header: css`
    margin-bottom: 40px;
    text-align: center;

    h1 {
      margin: 0 0 10px;
      color: #fff;
      font-size: 30px;
      font-weight: 800;
      letter-spacing: 0;
      line-height: 1.2;
    }

    p {
      margin: 0;
      color: #8f8f8f;
      font-size: 14px;
    }
  `,
  alert: css`
    margin-bottom: 22px;
    border-color: rgba(255, 77, 79, 0.45);
    background: rgba(255, 77, 79, 0.1);
    color: #fecaca;
  `,
  form: css`
    .ant-form-item {
      margin-bottom: 22px;
    }

    .ant-form-item-label {
      padding-bottom: 8px;
    }

    .ant-form-item-label > label {
      color: #f3f4f6;
      font-size: 13px;
      font-weight: 700;
    }

    .ant-form-item-required::before {
      display: none !important;
    }

    .ant-input,
    .ant-input-affix-wrapper {
      height: 48px;
      border-color: rgba(255, 255, 255, 0.1);
      border-radius: 999px;
      background: #000;
      color: #fff;
      box-shadow: none;
    }

    .ant-input {
      padding-inline: 18px;
    }

    .ant-input-affix-wrapper {
      padding-inline: 18px;
    }

    .ant-input-affix-wrapper > input.ant-input {
      height: auto;
      padding-inline: 0;
      background: #000;
    }

    .ant-input-affix-wrapper .ant-input-suffix {
      margin-inline-start: 8px;
      color: #8a8a8a;
    }

    .ant-input::placeholder,
    .ant-input-password input::placeholder {
      color: #71717a;
    }

    .ant-input:hover,
    .ant-input:focus,
    .ant-input-affix-wrapper:hover,
    .ant-input-affix-wrapper-focused {
      border-color: rgba(255, 255, 255, 0.28);
      background: #000;
    }

    .ant-input-affix-wrapper:hover > input.ant-input,
    .ant-input-affix-wrapper-focused > input.ant-input {
      background: #000;
    }

    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus {
      -webkit-text-fill-color: #fff;
      box-shadow: 0 0 0 1000px #000 inset;
      transition: background-color 9999s ease-out;
    }
  `,
  passwordToggle: css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: 0;
    background: transparent;
    color: #8a8a8a;
    cursor: pointer;

    &:hover {
      color: #f5f5f5;
    }
  `,
  submitButton: css`
    position: relative;
    width: 100%;
    height: 48px;
    overflow: hidden;
    border-color: #4b5ec6;
    border-radius: 999px;
    background: #4b5ec6;
    color: #fff;
    font-weight: 800;
    box-shadow: none;

    &:hover,
    &:focus {
      border-color: #5368dc !important;
      background: #5368dc !important;
      color: #fff !important;
    }

    .default-label {
      display: inline-block;
      transition: transform 0.25s ease, opacity 0.25s ease;
    }

    .hover-label {
      position: absolute;
      inset: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border-radius: 999px;
      background: #5368dc;
      color: #fff;
      opacity: 0;
      transition: opacity 0.25s ease;
    }

    &:hover .default-label {
      transform: translateX(32px);
      opacity: 0;
    }

    &:hover .hover-label {
      opacity: 1;
    }
  `,
  helper: css`
    margin-top: 32px;
    color: #737373;
    font-size: 14px;
    text-align: center;

    span {
      color: #fff;
      font-weight: 700;
    }
  `,
}));

interface LoginFormValues {
  account?: string;
  password?: string;
}

interface LoginMenuItem {
  routeurl?: string;
  routeUrl?: string;
  path?: string;
  children?: LoginMenuItem[];
}

const routeFallbacks = ['/sys/account', '/welcome'];
const registeredRoutes = new Set([
  '/welcome',
  '/admin/sub-page',
  '/list',
  '/sys/account',
  '/sys/organization',
  '/sys/role',
  '/sys/module',
  '/sys/dictionary',
  '/log/online',
  '/log/biz',
  '/log/error',
  '/dev/generator',
  '/dev/workflow',
]);

function getLoginErrorMessage(error: unknown) {
  const payload = error as {
    info?: { message?: string; errorMessage?: string };
    data?: { message?: string; errorMessage?: string };
    response?: { data?: { message?: string; errorMessage?: string } };
    message?: string;
  };
  return (
    payload.info?.message ||
    payload.info?.errorMessage ||
    payload.data?.message ||
    payload.data?.errorMessage ||
    payload.response?.data?.message ||
    payload.response?.data?.errorMessage ||
    payload.message
  );
}

function normalizeRoutePath(path: string) {
  if (!path) return '';
  return path.startsWith('/') ? path : `/${path}`;
}

function isRegisteredRoute(path: string) {
  return registeredRoutes.has(path);
}

function extractLoginMenus(data: unknown): LoginMenuItem[] {
  if (Array.isArray(data)) return data as LoginMenuItem[];
  const payload = (data || {}) as Record<string, unknown>;
  const candidates = [
    payload.menus,
    payload.menu,
    payload.routes,
    payload.modules,
    payload.resources,
  ];
  return (candidates.find(Array.isArray) as LoginMenuItem[]) || [];
}

function findFirstMenuPath(menus: LoginMenuItem[]): string {
  for (const menu of menus) {
    if (menu.children?.length) {
      const childPath = findFirstMenuPath(menu.children);
      if (childPath) return childPath;
    }
    const path = menu.path || menu.routeurl || menu.routeUrl;
    if (path && path !== '/user/login') {
      const normalizedPath = normalizeRoutePath(path);
      if (isRegisteredRoute(normalizedPath)) return normalizedPath;
    }
  }
  return '';
}

function getFirstMenuPath(menus: LoginMenuItem[]): string {
  return (
    findFirstMenuPath(menus) ||
    routeFallbacks.find((path) => isRegisteredRoute(path)) ||
    '/'
  );
}

function getLoginToken(
  msg: AuthLoginResult,
  snakeKey: 'access_token' | 'refresh_token',
  camelKey: 'accessToken' | 'refreshToken',
) {
  const payload = msg as AuthLoginResult & Record<string, unknown>;
  return (
    msg.data?.[snakeKey] ||
    msg.data?.[camelKey] ||
    (payload[snakeKey] as string | undefined) ||
    (payload[camelKey] as string | undefined)
  );
}

function getLoginUserInfo(msg: AuthLoginResult) {
  return msg.data?.user_info || msg.data?.userInfo;
}

function normalizeLoginUser(
  userInfo: Record<string, unknown> | undefined,
  menus: LoginMenuItem[],
) {
  const user = userInfo || {};
  return {
    ...user,
    menus,
    name:
      (user.name as string | undefined) ||
      (user.nickName as string | undefined) ||
      (user.account as string | undefined) ||
      (user.username as string | undefined) ||
      'Admin',
    access: (user.access as string | undefined) || 'admin',
  } as API.CurrentUser & { menus?: LoginMenuItem[] };
}

const Login: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [isTyping, setIsTyping] = useState(false);
  const [lookingAtEachOther, setLookingAtEachOther] = useState(false);
  const [passwordLen, setPasswordLen] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [blink, setBlink] = useState({ purple: false, black: false });
  const { setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();
  const { message } = App.useApp();
  const intl = useIntl();

  useEffect(() => {
    const purpleTimer = window.setInterval(() => {
      setBlink((prev) => ({ ...prev, purple: true }));
      window.setTimeout(
        () => setBlink((prev) => ({ ...prev, purple: false })),
        150,
      );
    }, 3600);
    const blackTimer = window.setInterval(() => {
      setBlink((prev) => ({ ...prev, black: true }));
      window.setTimeout(
        () => setBlink((prev) => ({ ...prev, black: false })),
        150,
      );
    }, 4700);
    return () => {
      window.clearInterval(purpleTimer);
      window.clearInterval(blackTimer);
    };
  }, []);

  const triggerLookAtEachOther = () => {
    setIsTyping(true);
    setLookingAtEachOther(true);
    window.setTimeout(() => setLookingAtEachOther(false), 800);
  };

  const characterMotion = useMemo(() => {
    const centerX =
      typeof window === 'undefined' ? 0 : window.innerWidth * 0.26;
    const centerY =
      typeof window === 'undefined' ? 0 : window.innerHeight * 0.5;
    const faceX = clamp((mouse.x - centerX) / 35, -15, 15);
    const faceY = clamp((mouse.y - centerY) / 45, -10, 10);
    const skew = clamp(-(mouse.x - centerX) / 180, -6, 6);
    const isHidingPassword = passwordLen > 0 && !showPassword;
    const isShowingPassword = passwordLen > 0 && showPassword;

    return {
      faceX,
      faceY,
      isShowingPassword,
      purpleTransform: isShowingPassword
        ? 'skewX(0deg)'
        : isTyping || isHidingPassword
          ? `skewX(${skew - 12}deg) translateX(40px)`
          : `skewX(${skew}deg)`,
      purpleHeight: isTyping || isHidingPassword ? 440 : 400,
      blackTransform: isShowingPassword
        ? 'skewX(0deg)'
        : lookingAtEachOther
          ? `skewX(${skew * 1.5 + 10}deg) translateX(20px)`
          : `skewX(${skew * 1.2}deg)`,
      orangeTransform: isShowingPassword ? 'skewX(0deg)' : `skewX(${skew}deg)`,
      yellowTransform: isShowingPassword
        ? 'skewX(0deg)'
        : `skewX(${skew * 0.8}deg)`,
      purpleEyes: isShowingPassword
        ? { left: 20, top: 35, pupilX: -4, pupilY: -4 }
        : lookingAtEachOther
          ? { left: 55, top: 65, pupilX: 3, pupilY: 4 }
          : { left: 45 + faceX, top: 40 + faceY, pupilX: 3, pupilY: -2 },
      blackEyes: isShowingPassword
        ? { left: 10, top: 28, pupilX: -4, pupilY: -4 }
        : lookingAtEachOther
          ? { left: 32, top: 12, pupilX: 0, pupilY: -4 }
          : { left: 26 + faceX, top: 32 + faceY, pupilX: 2, pupilY: -2 },
      orangeEyes: isShowingPassword
        ? { left: 50, top: 85, pupilX: -5, pupilY: -4 }
        : { left: 82 + faceX, top: 90 + faceY, pupilX: 0, pupilY: 0 },
      yellowEyes: isShowingPassword
        ? { left: 20, top: 35, pupilX: -5, pupilY: -4 }
        : { left: 52 + faceX, top: 40 + faceY, pupilX: 0, pupilY: 0 },
      yellowMouth: isShowingPassword
        ? { left: 10, top: 88 }
        : { left: 40 + faceX, top: 88 + faceY },
    };
  }, [isTyping, lookingAtEachOther, mouse, passwordLen, showPassword]);

  const handleSubmit = async (values: LoginFormValues) => {
    setSubmitting(true);
    try {
      const payload = { ...values };
      if (payload.password) {
        payload.password = MD5.hash(payload.password).toString();
      }
      const msg = await login(payload, { skipErrorHandler: true });
      if (msg.success !== false && (msg.success || msg.status === 'ok')) {
        const cookies = new Cookies();
        const tokenValue = getLoginToken(msg, 'access_token', 'accessToken');
        if (!tokenValue) {
          message.error('登录响应缺少访问令牌，请联系管理员');
          return;
        }
        setStoredAccessToken(tokenValue);
        const refreshTokenValue = getLoginToken(
          msg,
          'refresh_token',
          'refreshToken',
        );
        if (refreshTokenValue) {
          cookies.set(refresh_token, refreshTokenValue, {
            path: '/',
            sameSite: 'lax',
          });
        }
        const userInfo = getLoginUserInfo(msg);
        if (userInfo) {
          cookies.set(user_key, JSON.stringify(userInfo), {
            path: '/',
            sameSite: 'lax',
          });
          window.sessionStorage.setItem(
            currentUserCacheKey,
            JSON.stringify(userInfo),
          );
        }

        let menus: LoginMenuItem[] = [];
        let dict: Record<string, unknown> | undefined;
        try {
          const authHeaders = { Authorization: `Bearer${tokenValue}` };
          const [menuResponse, dictResponse] = await Promise.all([
            fetchMenus({ headers: authHeaders, skipErrorHandler: true }),
            fetchDict({ headers: authHeaders, skipErrorHandler: true }),
          ]);
          menus = extractLoginMenus(menuResponse?.data);
          dict = dictResponse?.data;
          window.sessionStorage.setItem(
            loginMenuCacheKey,
            JSON.stringify(menuResponse?.data ?? []),
          );
        } catch (error) {
          if (isAuthExpiredError(error)) {
            clearAuthState();
            message.error(getErrorMessage(error) || '登录已失效，请重新登录');
            redirectToLogin();
            return;
          }
          message.error(getErrorMessage(error) || '初始化菜单或字典失败');
          return;
        }

        const currentUser = normalizeLoginUser(userInfo, menus);
        flushSync(() => {
          setInitialState((state) => ({
            ...state,
            currentUser,
            dict,
          }));
        });
        message.success(
          intl.formatMessage({
            id: 'pages.login.success',
            defaultMessage: '登录成功！',
          }),
        );
        history.replace(getFirstMenuPath(menus));
        return;
      }
      message.error(msg.message || '登录失败');
    } catch (error) {
      message.error(getLoginErrorMessage(error) || '登录失败');
    } finally {
      setSubmitting(false);
    }
  };

  const title = Settings.title || 'Eva Admin Pro';

  return (
    <main
      className={styles.page}
      onMouseMove={(event) => setMouse({ x: event.clientX, y: event.clientY })}
    >
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.login',
            defaultMessage: '登录页',
          })}
          {title && ` - ${title}`}
        </title>
      </Helmet>

      <section className={styles.leftPane} aria-hidden="true">
        <div className={styles.brand}>
          <span className={styles.brandMark}>E</span>
          <span>{title}</span>
        </div>
        <div className={styles.charactersWrap}>
          <div className={styles.characters}>
            <div
              className={`${styles.character} ${styles.purple}`}
              style={{
                height: characterMotion.purpleHeight,
                transform: characterMotion.purpleTransform,
              }}
            >
              <div
                className={styles.eyes}
                style={{
                  left: characterMotion.purpleEyes.left,
                  top: characterMotion.purpleEyes.top,
                }}
              >
                <span
                  className={styles.eyeball}
                  style={{ height: blink.purple ? 2 : 18 }}
                >
                  <span
                    className={styles.pupil}
                    style={{
                      transform: `translate(${characterMotion.purpleEyes.pupilX}px, ${characterMotion.purpleEyes.pupilY}px)`,
                    }}
                  />
                </span>
                <span
                  className={styles.eyeball}
                  style={{ height: blink.purple ? 2 : 18 }}
                >
                  <span
                    className={styles.pupil}
                    style={{
                      transform: `translate(${characterMotion.purpleEyes.pupilX}px, ${characterMotion.purpleEyes.pupilY}px)`,
                    }}
                  />
                </span>
              </div>
            </div>
            <div
              className={`${styles.character} ${styles.black}`}
              style={{ transform: characterMotion.blackTransform }}
            >
              <div
                className={styles.eyes}
                style={{
                  left: characterMotion.blackEyes.left,
                  top: characterMotion.blackEyes.top,
                }}
              >
                <span
                  className={styles.eyeball}
                  style={{ width: 16, height: blink.black ? 2 : 16 }}
                >
                  <span
                    className={styles.pupil}
                    style={{
                      width: 6,
                      height: 6,
                      transform: `translate(${characterMotion.blackEyes.pupilX}px, ${characterMotion.blackEyes.pupilY}px)`,
                    }}
                  />
                </span>
                <span
                  className={styles.eyeball}
                  style={{ width: 16, height: blink.black ? 2 : 16 }}
                >
                  <span
                    className={styles.pupil}
                    style={{
                      width: 6,
                      height: 6,
                      transform: `translate(${characterMotion.blackEyes.pupilX}px, ${characterMotion.blackEyes.pupilY}px)`,
                    }}
                  />
                </span>
              </div>
            </div>
            <div
              className={`${styles.character} ${styles.orange}`}
              style={{ transform: characterMotion.orangeTransform }}
            >
              <div
                className={styles.eyes}
                style={{
                  left: characterMotion.orangeEyes.left,
                  top: characterMotion.orangeEyes.top,
                }}
              >
                <span
                  className={styles.dotEye}
                  style={{
                    transform: `translate(${characterMotion.orangeEyes.pupilX}px, ${characterMotion.orangeEyes.pupilY}px)`,
                  }}
                />
                <span
                  className={styles.dotEye}
                  style={{
                    transform: `translate(${characterMotion.orangeEyes.pupilX}px, ${characterMotion.orangeEyes.pupilY}px)`,
                  }}
                />
              </div>
            </div>
            <div
              className={`${styles.character} ${styles.yellow}`}
              style={{ transform: characterMotion.yellowTransform }}
            >
              <div
                className={styles.eyes}
                style={{
                  left: characterMotion.yellowEyes.left,
                  top: characterMotion.yellowEyes.top,
                }}
              >
                <span
                  className={styles.dotEye}
                  style={{
                    transform: `translate(${characterMotion.yellowEyes.pupilX}px, ${characterMotion.yellowEyes.pupilY}px)`,
                  }}
                />
                <span
                  className={styles.dotEye}
                  style={{
                    transform: `translate(${characterMotion.yellowEyes.pupilX}px, ${characterMotion.yellowEyes.pupilY}px)`,
                  }}
                />
              </div>
              <span
                className={styles.mouth}
                style={{
                  left: characterMotion.yellowMouth.left,
                  top: characterMotion.yellowMouth.top,
                }}
              />
            </div>
          </div>
        </div>
        <div className={styles.leftLinks}>
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
        </div>
      </section>

      <section className={styles.rightPane}>
        <div className={styles.language} data-lang>
          {SelectLang && <SelectLang />}
        </div>
        <div className={styles.formBox}>
          <header className={styles.header}>
            <h1>欢迎回来！</h1>
            <p>请输入你的登录信息</p>
          </header>

          <Form<LoginFormValues>
            className={styles.form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              label="账号"
              name="account"
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({
                    id: 'pages.login.account.required',
                    defaultMessage: '请输入账号!',
                  }),
                },
              ]}
            >
              <Input
                autoComplete="off"
                onBlur={() => setIsTyping(false)}
                onFocus={triggerLookAtEachOther}
                placeholder="请输入账号"
              />
            </Form.Item>

            <Form.Item
              label="密码"
              name="password"
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({
                    id: 'pages.login.password.required',
                    defaultMessage: '请输入密码！',
                  }),
                },
              ]}
            >
              <Input
                autoComplete="new-password"
                type={showPassword ? 'text' : 'password'}
                onBlur={() => setIsTyping(false)}
                onChange={(event) => setPasswordLen(event.target.value.length)}
                onFocus={triggerLookAtEachOther}
                placeholder="请输入密码"
                suffix={
                  <button
                    aria-label={showPassword ? '隐藏密码' : '显示密码'}
                    className={styles.passwordToggle}
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  </button>
                }
              />
            </Form.Item>

            <Button
              className={styles.submitButton}
              htmlType="submit"
              loading={submitting}
            >
              <span className="default-label">登 录</span>
              <span className="hover-label">
                登 录 <ArrowRightOutlined />
              </span>
            </Button>
          </Form>

          <div className={styles.helper}>
            没有账号？<span>请联系管理员</span>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Login;
