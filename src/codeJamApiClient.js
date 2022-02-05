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
export function fetchChallenge(id) {
  assert.ok(id, "id is required");
  return fetchJson(
    `https://codejam.googleapis.com/dashboard/${id}/poll?${encodeGetQuery({})}`
  );
}

export function fetchChallengeScores(challengeId) {
  const query = encodeGetQuery({ include_non_final_results: true });
  return fetchJson(
    `https://codejam.googleapis.com/attempts/${challengeId}/poll?${query}`
  );
}

export async function uploadOutput(
  challengeId,
  taskId,
  outputFile,
  codeFile,
  accessToken
) {
  const form = new FormData();
  form.set("p", base64UrlEncodedJson.encode({ task_id: taskId, for_test: 0 }));
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
