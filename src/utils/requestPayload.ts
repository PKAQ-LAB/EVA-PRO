const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Object.prototype.toString.call(value) === '[object Object]';

const shouldKeepAsIs = (value: unknown) =>
  value instanceof Date ||
  (typeof FormData !== 'undefined' && value instanceof FormData) ||
  (typeof Blob !== 'undefined' && value instanceof Blob) ||
  (typeof File !== 'undefined' && value instanceof File);

export function trimRequestPayload<T>(payload: T): T {
  if (typeof payload === 'string') return payload.trim() as T;
  if (payload == null || shouldKeepAsIs(payload)) return payload;
  if (Array.isArray(payload)) {
    return payload.map((item) => trimRequestPayload(item)) as T;
  }
  if (!isPlainObject(payload)) return payload;

  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [
      key,
      trimRequestPayload(value),
    ]),
  ) as T;
}
