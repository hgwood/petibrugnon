import { writeFile } from "fs/promises";
import { fetch } from "undici";
import { fetchAdventures, fetchChallenge } from "./codeJamApiClient.js";
import env from "./env.js";
import { findCurrentChallenge } from "./hashCode.js";
import { unzip } from "./utils/unzip.js";

export async function download() {
  const { adventures } = await fetchAdventures();
  const challengeId = findCurrentChallenge(adventures)?.id;
  if (!challengeId) {
    throw new Error(`No Hash Code challenge is currently opened.`);
  }
  const { challenge } = await fetchChallenge(challengeId);
  await writeFile(env.paths.meta, JSON.stringify(challenge, null, 2));
  console.log(
    `[petibrugnon] Downloaded challenge metadata to ${env.paths.relative.meta}`
  );
  const statementHtml = challenge.tasks[0].statement;
  await writeFile(env.paths.statement, statementHtml);
  console.log(
    `[petibrugnon] Downloaded statement to ${env.paths.relative.statement}`
  );
  const [inputDataSetZipUri] =
    statementHtml.match(
      /https:\/\/codejam\.googleapis\.com\/dashboard\/get_file\/.*?input_data\.zip\?dl=1/
    ) || [];
  if (!inputDataSetZipUri) {
    throw new Error(
      "Cannot download input data sets: input data set zip file URI not found in statement"
    );
  }
  const inputDataSetZipResponse = await fetch(inputDataSetZipUri);
  await unzip(
    Buffer.from(await inputDataSetZipResponse.arrayBuffer()),
    env.paths.inputs
  );
  console.log(
    `[petibrugnon] Downloaded inputs to ${env.paths.relative.inputs}`
  );
}

download().catch(console.error);
