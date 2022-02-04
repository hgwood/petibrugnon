import * as events from "events";
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import * as path from "path";
import { pipeline } from "stream/promises";
import { promisify } from "util";
import * as yauzl from "yauzl";

const zipFileFromBuffer = promisify(yauzl.fromBuffer);

/**
 * Unzips all files of a zip file into a directory. The output directory is
 * created if it does not exist. This function does not support zip files
 * containing directories.
 *
 * @param {Buffer} inputBuffer
 * @param {string} outputDirectory path to the output directory
 * @returns {Promise<void>}
 */
export async function unzip(inputBuffer, outputDirectory) {
  await mkdir(outputDirectory, { recursive: true });
  const zipFile = await zipFileFromBuffer(inputBuffer);
  const openReadStream = promisify(zipFile.openReadStream.bind(zipFile));
  for await (const [entry] of events.on(zipFile, "entry")) {
    await pipeline(
      await openReadStream(entry),
      createWriteStream(path.join(outputDirectory, entry.fileName))
    );
  }
  await events.once(zipFile, "end");
}
