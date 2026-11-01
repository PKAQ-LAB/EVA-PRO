export type DictionaryMap = Record<string, Record<string, string>>;
export interface DictionaryState {
  currentUser?: object;
  dict?: Record<string, unknown>;
  dictEtag?: string;
  dictOwner?: string;
  dictGeneration?: number;
  dictStatus?: 'loading' | 'ready' | 'stale' | 'error';
}
export type DictionaryResult =
  | { kind: 'updated'; data: DictionaryMap; etag: string }
  | { kind: 'unchanged'; etag: string };
export class DictionaryIntegrityError extends Error {}

let generation = 0;
const invalidators = new Set<() => void>();
const identities = new WeakMap<object, number>();
let identitySequence = 0;
export const dictionaryGeneration = () => generation;
export function beginDictionarySession() {
  generation += 1;
  for (const clear of invalidators) clear();
  return generation;
}
export function onDictionaryInvalidated(clear: () => void) {
  invalidators.add(clear);
  return () => {
    invalidators.delete(clear);
  };
}
export function dictionaryOwner(user?: object) {
  if (!user) return undefined;
  const fields = user as Record<string, unknown>;
  const id = fields.id ?? fields.userid ?? fields.userId;
  if (id != null)
    return JSON.stringify([String(id), String(fields.tenantId ?? '')]);
  // 未携身份字段的响应只绑定当前对象，绝不猜用户名或 JWT 声明。
  if (!identities.has(user)) identities.set(user, ++identitySequence);
  return `object:${identities.get(user)}`;
}
export function ownedDictionary(state?: DictionaryState) {
  return state?.dictOwner === dictionaryOwner(state?.currentUser) &&
    state?.dictOwner !== undefined &&
    state.dictGeneration === generation
    ? state.dict
    : undefined;
}
export function validDictionary(value: unknown): value is DictionaryMap {
  return (
    !!value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.values(value).every(
      (map) =>
        !!map &&
        typeof map === 'object' &&
        !Array.isArray(map) &&
        Object.values(map).every((label) => typeof label === 'string'),
    )
  );
}
export function dictionaryFields(
  user: object,
  epoch: number,
  result?: DictionaryResult,
): Omit<DictionaryState, 'currentUser'> {
  return {
    dict: result?.kind === 'updated' ? result.data : undefined,
    dictEtag: result?.kind === 'updated' ? result.etag : undefined,
    dictOwner: dictionaryOwner(user),
    dictGeneration: epoch,
    dictStatus: result?.kind === 'updated' ? 'ready' : 'error',
  };
}

interface SyncOptions {
  current: () => boolean;
  read: () => DictionaryState;
  update: (change: Partial<DictionaryState>) => void;
  load: (etag?: string, signal?: AbortSignal) => Promise<DictionaryResult>;
}
export function createDictionarySync(options: SyncOptions) {
  let active = true;
  let inflight: Promise<Record<string, unknown> | undefined> | undefined;
  let followup = false;
  const abort = new AbortController();
  const current = () => active && options.current();
  const synchronize = (
    afterWrite = false,
  ): Promise<Record<string, unknown> | undefined> => {
    if (!current()) return Promise.resolve(undefined);
    if (inflight) {
      if (afterWrite) followup = true;
      return inflight;
    }
    inflight = (async () => {
      do {
        followup = false;
        const before = options.read();
        const etag = before.dict ? before.dictEtag : undefined;
        try {
          const result = await options.load(etag, abort.signal);
          if (!current()) return undefined;
          if (result.kind === 'unchanged') {
            if (!before.dict || !etag || result.etag !== etag)
              throw new DictionaryIntegrityError('无可复用字典快照');
            options.update({ dictStatus: 'ready' });
          } else {
            if (!validDictionary(result.data))
              throw new DictionaryIntegrityError('字典结构无效');
            options.update({
              dict: result.data,
              dictEtag: result.etag,
              dictStatus: 'ready',
            });
          }
        } catch (error) {
          if (!current()) return undefined;
          if (error instanceof DictionaryIntegrityError)
            options.update({
              dict: undefined,
              dictEtag: undefined,
              dictStatus: 'error',
            });
          else
            options.update({
              dictStatus: options.read().dict ? 'stale' : 'error',
            });
        }
      } while (followup && current());
      return current() ? options.read().dict : undefined;
    })().finally(() => {
      inflight = undefined;
    });
    return inflight;
  };
  return {
    synchronize,
    dispose: () => {
      active = false;
      followup = false;
      abort.abort();
    },
  };
}
