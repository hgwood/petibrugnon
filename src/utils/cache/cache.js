/**
 * @template T
 * @param {CacheStorage<T>} storage
 * @param {CachePolicy<T>} policy
 * @returns {Promise<T>}
 */
export async function cached({ read, write }, { refresh, isStale }) {
  const value = await read();
  if (value === undefined || isStale(value)) {
    const fresh = await refresh(value);
    await write(fresh);
    return fresh;
  } else {
    return value;
  }
}

export * from "./jsonFile.js";
export * from "./perpetual.js";
