#!/usr/bin/env node

import fs from "fs";
import path from "path";
import * as gcloud from "./gcloud.js";
import { composeFsFriendlyName } from "./utils/fs.js";
import { httpRequest } from "./utils/httpClient.js";
import { parseAsText, pipeline } from "./utils/streams.js";

const ROUND_FILE = path.resolve(
  process.env.PETIBRUGNON_ROUND_FILE || "./.petibrugnon/round.json"
);

const PROBEM_STATEMENT_FILE = path.resolve(
  process.env.PETIBRUGNON_PROBEM_STATEMENT_FILE ||
    "./.petibrugnon/problem_statement.pdf"
);

const DATA_SETS_DIR = path.resolve(
  process.env.PETIBRUGNON_DATA_SETS_DIR || "./.petibrugnon/data_sets"
);

async function download() {
  const token = gcloud.fetchToken();
  const round = await fetchRound(token);
  fs.mkdirSync(path.dirname(ROUND_FILE), { recursive: true });
  fs.writeFileSync(ROUND_FILE, JSON.stringify(round, null, 2));
  const problemStatement = await fetchDownload(round.problemBlobKey, token);
  fs.mkdirSync(path.dirname(PROBEM_STATEMENT_FILE), { recursive: true });
  await pipeline(problemStatement, fs.createWriteStream(PROBEM_STATEMENT_FILE));
  fs.mkdirSync(DATA_SETS_DIR, { recursive: true });
  for (const dataSet of round.dataSets) {
    const response = await fetchDownload(dataSet.inputBlobKey, token);
    const fileName = composeFsFriendlyName(dataSet.name).toLowerCase();
    const filePath = path.join(DATA_SETS_DIR, `./${fileName}.txt`);
    await pipeline(response, fs.createWriteStream(filePath));
  }
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

download().catch(console.error);
