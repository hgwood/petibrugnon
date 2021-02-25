/**
 *
 * @param {AsyncIterable<Buffer>} readable
 */
export async function parseAsText(readable) {
  let content = "";
  for await (const chunk of readable) {
    content += chunk.toString();
  }
  return content;
}
