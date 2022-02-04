import { writeFile } from "fs/promises";
import * as path from "path";
import { fetch } from "undici";
import { fetchAdventures, fetchChallenge } from "./codeJamApiClient.js";
import { findCurrentChallenge } from "./hashCode.js";
import { unzip } from "./utils/unzip.js";

export async function downloadStatementAndInputs(
  outputDirectory,
  {
    statementFilePath = "statement.html",
    inputFilesDirectoryPath = "inputs",
  } = {}
) {
  const { adventures } = await fetchAdventures();
  const challengeId = findCurrentChallenge(adventures)?.id;
  if (!challengeId) {
    throw new Error(`No Hash Code challenge is currently opened.`);
  }
  const { challenge } = await fetchChallenge(challengeId);
  const statementHtml = challenge.tasks[0].statement;
  await writeFile(
    path.resolve(outputDirectory, statementFilePath),
    statementHtml
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
    path.resolve(outputDirectory, inputFilesDirectoryPath)
  );
}
