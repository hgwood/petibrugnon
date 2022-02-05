import { writeFile, mkdir } from "fs/promises";
import * as path from "path";
import { fetch } from "undici";
import { fetchAdventures, fetchChallenge } from "./codeJamApiClient.js";
import env from "./env.js";
import { findCurrentChallenge } from "./hashCode.js";
import asyncToArray from "./utils/asyncToArray.js";
import { unzip } from "./utils/unzip.js";

export async function download() {
  const { adventures } = await fetchAdventures();
  const challengeId = findCurrentChallenge(adventures)?.id;
  if (!challengeId) {
    throw new Error(`No Hash Code challenge is currently opened.`);
  }
  const { challenge } = await fetchChallenge(challengeId, env.token);
  await writeFile(env.paths.meta, JSON.stringify(challenge, null, 2));
  const task = challenge.tasks[0];
  await writeFile(env.paths.statement, task.statement);
  console.log(
    `[petibrugnon] Downloaded statement to '${env.paths.relative.statement}'`
  );
  const [inputZipUri] =
    task.statement.match(
      /https:\/\/codejam\.googleapis\.com\/dashboard\/get_file\/.*?input_data\.zip\?dl=1/
    ) || [];
  if (!inputZipUri) {
    throw new Error(
      "Cannot download input data sets: input data set zip file URI not found in statement"
    );
  }
  const inputZipResponse = await fetch(inputZipUri);
  await mkdir(env.paths.inputs, { recursive: true });
  const inputZipBuffer = Buffer.from(await inputZipResponse.arrayBuffer());
  console.log(`[petibrugnon] Downloaded input data sets`);
  const inputs = await asyncToArray(unzip(inputZipBuffer));
  const inputToTestMapping = Object.fromEntries(
    inputs.map(({ fileName }) => [fileName, findTest(fileName, task.tests)])
  );
  await writeFile(
    env.paths.inputToTestMapping,
    JSON.stringify(inputToTestMapping, null, 2)
  );
  for (const { fileName, buffer } of inputs) {
    const inputPath = path.resolve(env.paths.inputs, fileName);
    await writeFile(inputPath, buffer);
    const relativeInputPath = path.join(env.paths.relative.inputs, fileName);
    console.log(
      `[petibrugnon] Unzipped input of test '${inputToTestMapping[fileName]}' to '${relativeInputPath}'`
    );
  }
}

/**
 * Finds the test corresponding to the given file name. This relies on tests and
 * files being designated by letters, which has always been the case in the past.
 *
 * @param {string} fileName
 * @param {{ name: string }[]} tests
 */
function findTest(fileName, tests) {
  return tests.findIndex(
    ({ name }) => name[0].toLowerCase() === fileName[0].toLowerCase()
  );
}

download().catch(console.error);
