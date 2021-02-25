/**
 *
 * @param {string} str
 */
export function composeFsFriendlyName(str) {
  return str.replace(/[^\w]/g, "_");
}
