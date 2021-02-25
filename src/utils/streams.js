import * as util from "util";
import * as stream from "stream";

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

export const pipeline = util.promisify(stream.pipeline);
