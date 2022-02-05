import { createWriteStream } from "fs";
import * as path from "path";
import { ZipFile } from "yazl";
import { pipeline } from "stream/promises";

/**
 *
 * @param {string} rootDirectory
 * @param {string[]} files path of files to be zipped relative to rootDirectory
 * @param {string} outputFile
 */
export async function zip(rootDirectory, files, outputFile) {
  const zipFile = new ZipFile();
  for (const file of files) {
    zipFile.addFile(path.resolve(rootDirectory, file), file);
  }
  zipFile.end();
  await pipeline(zipFile.outputStream, createWriteStream(outputFile));
}
