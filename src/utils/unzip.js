import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import * as path from "path";
import { pipeline } from "stream/promises";
import { onEventUntil } from "./onEventUntil.js";
import { zipFileFromBuffer } from "../wrappers/yauzl.js";

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
  for await (const [entry] of onEventUntil(zipFile, "entry", "end")) {
    await pipeline(
      await zipFile.openReadStream(entry),
      createWriteStream(path.join(outputDirectory, entry.fileName))
    );
  }
}
