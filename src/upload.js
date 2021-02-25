import fs from "fs";
import path from "path";
import requestPromise from "request-promise";
import debug from "debug";
import { fetchToken } from "./gcloud.js";
import { composeFsFriendlyName } from "./utils/fs.js";
import { httpRequest } from "./utils/httpClient.js";
import { parseAsText } from "./utils/streams.js";

const ROUND_FILE = path.resolve(
  process.env.PETIBRUGNON_ROUND_FILE || "./.petibrugnon/round.json"
);

const SUBMISSIONS_DIR = path.resolve(
  process.env.PETIBRUGNON_SUBMISSIONS_DIR || "./.petibrugnon/submissions"
);

const SOLUTIONS_DIR = path.resolve(
  process.env.PETIBRUGNON_SOLUTIONS_DIR || "./.petibrugnon/solutions"
);

const log = debug("upload");

/**
 *
 * @param {string} token
 */
async function uploadAllFiles(token) {
  /** @type {Round} */
  const round = JSON.parse(fs.readFileSync(ROUND_FILE).toString());
  const sources = fetchLatestSourcePackage();
  const sourcesBlobKey = await uploadFile(sources, token);
  for (const dataSet of round.dataSets) {
    const solutionFile = path.join(
      SOLUTIONS_DIR,
      composeFsFriendlyName(dataSet.name).toLowerCase() + ".out.txt"
    );
    const blobKey = await uploadFile(solutionFile, token);
    const submitResponse = await requestPromise({
      method: "POST",
      uri: "https://hashcode-judge.appspot.com/api/judge/v1/submissions",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      qs: { dataSet: dataSet.id, submissionBlobKey: blobKey, sourcesBlobKey },
      json: true,
    });
  }
}

/**
 *
 * @param {string} filepath
 * @param {string} token
 */
async function uploadFile(filepath, token) {
  const createUrlResponse = await httpRequest(
    "https://hashcode-judge.appspot.com/api/judge/v1/upload/createUrl",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const { value: uploadUrl } = JSON.parse(await parseAsText(createUrlResponse));
  const formData = { file: fs.createReadStream(filepath) };
  const uploadResponse = await requestPromise({
    method: "POST",
    uri: uploadUrl,
    formData,
    json: true,
  });
  const blobKey = uploadResponse.file[0];
  return blobKey;
}

function fetchLatestSourcePackage() {
  const packages = fs.readdirSync(SUBMISSIONS_DIR).sort();
  const latest = packages[packages.length - 1];
  return path.join(SUBMISSIONS_DIR, latest);
}

export async function upload() {
  const token = fetchToken();
  await uploadAllFiles(token);
}
