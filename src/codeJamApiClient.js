import * as assert from "assert";
import { Readable } from "stream";
import * as streamConsumers from "stream/consumers";
import { FormData } from "formdata-node";
import { fileFromPath } from "formdata-node/file-from-path";
import { FormDataEncoder } from "form-data-encoder";
import { fetch } from "undici";
import * as base64UrlEncodedJson from "./utils/base64UrlEncodedJson.js";

export function fetchAdventures() {
  return fetchJson(`https://codejam.googleapis.com/poll?${encodeGetQuery({})}`);
}

/**
 *
 * @param {string} id
 * @returns {Promise<any>}
 */
export function fetchChallenge(id, accessToken) {
  assert.ok(id, "id is required");
  return fetchJson(
    `https://codejam.googleapis.com/dashboard/${id}/poll?${encodeGetQuery({})}`,
    {
      headers: {
        authorization: accessToken && `Bearer ${accessToken}`,
      },
    }
  );
}

export function fetchChallengeScores(challengeId, accessToken) {
  const query = encodeGetQuery({ include_non_final_results: true });
  return fetchJson(
    `https://codejam.googleapis.com/attempts/${challengeId}/poll?${query}`,
    {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    }
  );
}

export function fetchScoreboard(challengeId, accessToken) {
  const query = encodeGetQuery({
    min_rank: 1,
    num_consecutive_users: 1,
  });
  return fetchJson(
    `https://codejam.googleapis.com/scoreboard/${challengeId}/poll?${query}`,
    {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    }
  );
}

export async function uploadOutput(
  challengeId,
  taskId,
  testId,
  outputFile,
  codeFile,
  accessToken
) {
  const form = new FormData();
  form.set(
    "p",
    base64UrlEncodedJson.encode({ task_id: taskId, for_test: testId })
  );
  form.set("outputFile", await fileFromPath(outputFile));
  form.set("codeFile", await fileFromPath(codeFile));
  const encoder = new FormDataEncoder(form);
  await fetchJson(
    `https://codejam.googleapis.com/dashboard/${challengeId}/submit`,
    {
      method: "POST",
      headers: {
        ...encoder.headers,
        authorization: `Bearer ${accessToken}`,
      },
      body: Readable.from(encoder.encode()),
      redirect: "manual",
    }
  );
}

function encodeGetQuery(value) {
  return new URLSearchParams({
    p: base64UrlEncodedJson.encode(value),
  });
}

/**
 *
 * @param {import("undici").RequestInfo} input
 * @param {import("undici").RequestInit=} init
 * @returns {Promise<any>}
 */
async function fetchJson(input, init) {
  const response = await fetch(input, init);
  if (response.status !== 200) {
    //@ts-ignore
    const text = response.body && (await streamConsumers.text(response.body));
    const status = `${response.status} ${response.statusText}`;
    throw new Error(`${init.method || "GET"} ${input} => ${status} ${text}`);
  }
  const text = await response.text();
  return base64UrlEncodedJson.decode(text);
}
