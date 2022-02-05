/**
 * @template T
 * @param {AsyncIterable<T>} asyncIterable
 * @returns {Promise<T[]>}
 */
export default async function asyncToArray(asyncIterable) {
  const array = [];
  for await (const element of asyncIterable) {
    array.push(element);
  }
  return array;
}
