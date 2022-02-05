// copied from https://github.com/tschaub/es-main/blob/202eac238e310fd797a1aa9939910be253da7f44/main.js
// see MIT license https://opensource.org/licenses/MIT

import { fileURLToPath } from "url";
import process from "process";
import path from "path";

/**
 *
 * @param {string} name
 * @returns {string}
 */
export function stripExt(name) {
  const extension = path.extname(name);
  if (!extension) {
    return name;
  }

  return name.slice(0, -extension.length);
}

/**
 *
 * @param {*} meta
 * @returns {boolean}
 */
export default function (meta) {
  const modulePath = fileURLToPath(meta.url);

  const scriptPath = process.argv[1];
  const extension = path.extname(scriptPath);
  if (extension) {
    return modulePath === scriptPath;
  }

  return stripExt(modulePath) === scriptPath;
}
