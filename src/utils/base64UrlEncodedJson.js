/**
 * @param {unknown} value
 * @returns {string}
 */
export function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

/**
 * @param {string} base64UrlStr
 * @returns {any}
 */
export function decode(base64UrlStr) {
  return JSON.parse(Buffer.from(base64UrlStr, "base64url").toString("utf8"));
}
