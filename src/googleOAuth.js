import * as readline from "readline";
import * as fs from "fs/promises";
import { fetch } from "undici";

/**
 * This function is interactive and is meant to be used on a CLI.
 * It authenticate the client by generating an URL and displaying
 * it to the user, expecting them visit the URL to login into
 * a Google account and authorize the program to access their data.
 * Once the user is logged in, their are given a token to put
 * back into the CLI.
 *
 * This function caches the token in a file to avoid having to ask the user
 * for it on every call.
 *
 * @see the code was adapted from {@link https://developers.google.com/admin-sdk/directory/v1/quickstart/nodejs|the Node.js Quickstart for the Directory API}
 *
 * @param {string} clientId
 * @param {Object} options
 * @param {string} [options.tokenCachePath=token.json] path where the function can cache the token
 * @returns {Promise<string>} the access token
 */
export async function authenticate(
  clientId,
  { tokenCachePath = "token.json" } = {}
) {
  const token = await cacheUsingJsonFile(
    () => acquireTokenUsingCliCode(clientId),
    tokenCachePath
  );
  return token.access_token;
}

/**
 *
 * @template T
 * @param {function(): T} fn
 * @param {string} path
 * @returns {Promise<T>}
 */
async function cacheUsingJsonFile(fn, path) {
  try {
    const content = await fs.readFile(path);
    const token = JSON.parse(content.toString());
    return token;
  } catch (err) {
    const result = await fn();
    try {
      await fs.writeFile(path, JSON.stringify(result));
    } catch (err) {
      console.warn(
        `[petibrugnon] [WARN] Unable to write cache file at '${path}'`,
        err
      );
    }
    return result;
  }
}

/**
 *
 * @param {string} clientId
 * @returns {Promise<any>}
 */
async function acquireTokenUsingCliCode(clientId) {
  const authUrl = composeAuthUrl(clientId);
  const code = await askForCodeThroughCli(authUrl);
  const tokens = await fetchToken(clientId, code);
  return tokens;
}

/**
 * See https://developers.google.com/identity/protocols/oauth2/native-app#step-2:-send-a-request-to-googles-oauth-2.0-server
 * @param {string} clientId
 * @returns {string}
 */
function composeAuthUrl(clientId) {
  const query = new URLSearchParams({
    client_id: clientId,
    redirect_uri: "urn:ietf:wg:oauth:2.0:oob",
    response_type: "code",
    scope: "https://www.googleapis.com/auth/codejam",
  }).toString();
  return `https://accounts.google.com/o/oauth2/v2/auth?${query}`;
}

/**
 *
 * @param {string} clientId
 * @param {string} code
 * @returns {Promise<any>}
 */
async function fetchToken(clientId, code) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      code,
      grant_type: "authorization_code",
      redirect_uri: "urn:ietf:wg:oauth:2.0:oob",
    }),
  });
  /** @type {any} */
  const json = await response.json();
  if (json.error) {
    throw new Error(
      `Cannot fetch token from Google OAuth2 services: ${json.error_description} (${json.error})`
    );
  }
  json.expiry_date = new Date(json.expires_in * 1000 + Date.now());
  return json;
}

/**
 *
 * @param {string} authUrl
 * @returns {Promise<string>}
 */
async function askForCodeThroughCli(authUrl) {
  console.log(
    "[petibrugnon] Authorize this program to access your Hash Code profile by visiting this url:\n",
    authUrl
  );
  const code = await askQuestionThroughCli(
    "[petibrugnon] Enter the code from that page here: "
  );
  return code;
}

/**
 *
 * @param {string} question
 * @returns {Promise<string>}
 */
async function askQuestionThroughCli(question) {
  return new Promise((resolve) => {
    const cli = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    cli.question(question, (response) => {
      cli.close();
      resolve(response);
    });
  });
}
