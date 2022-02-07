import * as streamConsumers from "stream/consumers";
import { onEventUntil } from "./onEventUntil.js";
import { zipFileFromBuffer } from "../wrappers/yauzl.js";
import asyncMap from "./asyncMap.js";

/**
 * Unzips all files of a zip file into individual buffers.
 *
 * @param {Buffer} inputBuffer
 * @returns {AsyncIterable<{ fileName: string, buffer: Buffer }>}
 */
export async function* unzip(inputBuffer) {
  const zipFile = await zipFileFromBuffer(inputBuffer);
  const entries = onEventUntil(zipFile, "entry", "end");
  yield* asyncMap(entries, async ([entry]) => {
    const stream = await zipFile.openReadStream(entry);
    const buffer = await streamConsumers.buffer(stream);
    return {
      fileName: entry.fileName,
      buffer,
    };
  });
}
