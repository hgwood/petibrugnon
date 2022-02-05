/**
 * @template T
 * @template R
 * @param {AsyncIterable<T>} asyncIterable
 * @param {(t: T) => R | Promise<R>} fn
 * @returns {AsyncIterable<R>}
 */
export default async function* asyncMap(asyncIterable, fn) {
  for await (const element of asyncIterable) {
    yield await fn(element);
  }
}
