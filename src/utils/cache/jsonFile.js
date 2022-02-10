import { readFile, writeFile, rm } from "fs/promises";

/**
 * @param {string} filePath
 * @returns {CacheStorage<any>}
 */
export function jsonFile(filePath) {
  return {
    async read() {
      try {
        const content = await readFile(filePath);
        return JSON.parse(content.toString());
      } catch (err) {
        return undefined;
      }
    },
    async write(value) {
      await writeFile(filePath, JSON.stringify(value, null, 2));
    },
    async clear() {
      await rm(filePath, { force: true });
    },
  };
}
