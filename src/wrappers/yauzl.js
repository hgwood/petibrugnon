import yauzl from "yauzl";
import { promisify } from "util";

const yauzlFromBuffer = promisify(yauzl.fromBuffer);

/**
 *
 * @param {Buffer} inputBuffer
 * @returns {Promise<yauzl.ZipFile & { openReadStream: (arg0: yauzl.Entry) => Promise<yauzl.ReadStream> }>}
 */
export async function zipFileFromBuffer(inputBuffer) {
  const zipFile = await yauzlFromBuffer(inputBuffer);
  return Object.create(zipFile, {
    openReadStream: {
      value: promisify(zipFile.openReadStream.bind(zipFile)),
    },
  });
}
