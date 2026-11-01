import { useModel } from '@umijs/max';
import { Alert, Button } from 'antd';
import { useLayoutEffect, useRef } from 'react';
import { fetchDict } from '@/services/user';
import {
  getStoredAccessToken,
  isAuthExpiredError,
  redirectToLogin,
} from '@/utils/authState';
import {
  beginDictionarySession,
  createDictionarySync,
  dictionaryGeneration,
  dictionaryOwner,
  onDictionaryInvalidated,
  ownedDictionary,
} from '@/utils/dictionaryState';

export default function DictionarySync() {
  const { initialState, setInitialState } = useModel('@@initialState');
  const latest = useRef(initialState);
  latest.current = initialState;
  const refresh = useRef<() => Promise<unknown>>(() => Promise.resolve());
  const owner = dictionaryOwner(initialState?.currentUser);
  useLayoutEffect(() => {
    if (!owner || !latest.current?.currentUser || !getStoredAccessToken())
      return;
    let epoch = dictionaryGeneration();
    const hasBootstrap =
      latest.current.dictOwner === owner &&
      latest.current.dictGeneration === epoch;
    if (!hasBootstrap) {
      epoch = beginDictionarySession();
      setInitialState((state) =>
        state
          ? {
              ...state,
              dict: undefined,
              dictEtag: undefined,
              dictOwner: owner,
              dictGeneration: epoch,
              dictStatus: 'loading',
            }
          : state,
      );
      return;
    }
    const current = () =>
      dictionaryGeneration() === epoch &&
      dictionaryOwner(latest.current?.currentUser) === owner &&
      !!getStoredAccessToken();
    const sync = createDictionarySync({
      current,
      read: () => ({
        ...latest.current,
        dict: ownedDictionary(latest.current),
      }),
      update: (change) => {
        if (!current()) return;
        setInitialState((state) => {
          if (
            !state ||
            dictionaryGeneration() !== epoch ||
            dictionaryOwner(state.currentUser) !== owner
          )
            return state;
          const next = { ...state, ...change };
          latest.current = next;
          return next;
        });
      },
      load: async (etag, signal) => {
        try {
          return await fetchDict({ signal }, etag);
        } catch (error) {
          if (current() && isAuthExpiredError(error)) redirectToLogin();
          throw error;
        }
      },
    });
    refresh.current = () => sync.synchronize();
    setInitialState((state) => {
      if (!state || !current()) return state;
      const next = {
        ...state,
        ...(!hasBootstrap
          ? {
              dict: undefined,
              dictEtag: undefined,
              dictStatus: 'error' as const,
            }
          : {}),
        dictOwner: owner,
        dictGeneration: epoch,
        fetchDict: () => sync.synchronize(true),
      };
      latest.current = next;
      return next;
    });
    const unsubscribe = onDictionaryInvalidated(() => {
      sync.dispose();
      setInitialState((state) =>
        state
          ? {
              ...state,
              dict: undefined,
              dictEtag: undefined,
              dictOwner: undefined,
              dictGeneration: dictionaryGeneration(),
              dictStatus: 'error',
            }
          : state,
      );
    });
    if (!hasBootstrap || !ownedDictionary(latest.current))
      void sync.synchronize();
    const available = () =>
      document.visibilityState === 'visible' && navigator.onLine !== false;
    let lastEvent = -Infinity;
    const wake = () => {
      if (available() && Date.now() - lastEvent >= 10000) {
        lastEvent = Date.now();
        void sync.synchronize();
      }
    };
    const timer = window.setInterval(() => {
      if (available()) void sync.synchronize();
    }, 60000);
    window.addEventListener('focus', wake);
    window.addEventListener('online', wake);
    document.addEventListener('visibilitychange', wake);
    return () => {
      sync.dispose();
      unsubscribe();
      window.clearInterval(timer);
      window.removeEventListener('focus', wake);
      window.removeEventListener('online', wake);
      document.removeEventListener('visibilitychange', wake);
    };
  }, [owner, initialState?.dictGeneration, setInitialState]);
  if (
    initialState?.dictStatus !== 'stale' &&
    initialState?.dictStatus !== 'error'
  )
    return null;
  return (
    <Alert
      type="warning"
      title={
        ownedDictionary(initialState)
          ? '字典同步暂不可用，正在使用最近有效数据'
          : '字典暂不可用，请重试'
      }
      action={<Button onClick={() => void refresh.current()}>重试字典</Button>}
    />
  );
}
