import * as fs from "fs";
import * as gcloud from "./gcloud.js";
import { httpRequest } from "./utils/httpClient.js";
import { parseAsText } from "./utils/streams.js";

async function download() {
  const token = gcloud.fetchToken();
  const round = await fetchRound(token);
  const problemStatement = await fetchDownload(round.problemBlobKey, token);
  problemStatement.pipe(fs.createWriteStream("./problem_statement.pdf"));
  round.dataSets.forEach(async (dataSet) => {
    const response = await fetchDownload(dataSet.inputBlobKey, token);
    response.pipe(fs.createWriteStream(`./${dataSet.name}.txt`));
  });
}

/**
 *
 * @param {string} token
 * @returns {Promise<Round>}
 */
async function fetchRound(token) {
  const response = await httpRequest(
    "https://hashcode-judge.appspot.com/api/judge/v1/rounds",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  /** @type {Rounds} */
  const rounds = JSON.parse(await parseAsText(response));
  return rounds.items[0];
}

/**
 * @param {string} blobKey
 * @param {string} token
 * @returns {Promise<import("stream").Readable>}
 */
async function fetchDownload(blobKey, token) {
  return await httpRequest(
    `https://hashcodejudge.withgoogle.com/download/${blobKey}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

download();
