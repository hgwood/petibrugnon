import * as assert from "assert";
import * as readline from "readline";
import { bold } from "colorette";
import { cached, jsonFile } from "../utils/cache/cache.js";
import {
  composeAuthUrl,
  fetchCredentialsUsingCode,
  fetchCredentialsUsingRefreshToken,
} from "./googleOAuth2.js";

/**
 * Authorizes the given Google OAuth 2.0 client to interact with the Code Jam
 * API.
 *
 * This function is interactive and is meant to be used on a CLI. It authorizes
 * the client by generating an URL and displaying it to the user, expecting them
 * visit the URL to login into a Google account and authorize the program to
 * access their data. The user is then given a code to copy back into the CLI.
 *
 * This function caches the resulting credentials (access token and refresh
 * token) in a file to reuse them for future API calls. If the access token
 * expires, the refresh token is used to get a new access token.
 *
 * @param {string} clientId
 * @param {string} scope
 * @param {{ cacheFilePath: string }} options
 * @returns {Promise<string>} the access token
 */
export async function authorize(clientId, scope, { cacheFilePath }) {
  const { accessToken } = await cached(jsonFile(cacheFilePath), {
    refresh(credentials) {
      return credentials?.refreshToken
        ? fetchCredentialsUsingRefreshToken(clientId, credentials.refreshToken)
        : fetchCredentialsUsingCli(clientId, scope);
    },
    isStale({ accessToken, expiresAt }) {
      return !accessToken || new Date(expiresAt) <= new Date();
    },
  });
  assert.ok(accessToken, "no access token after authorization");
  return accessToken;
}

/**
 * @param {{ cacheFilePath: string }} options
 */
export async function revokeAuthorization({ cacheFilePath }) {
  await jsonFile(cacheFilePath).clear();
}

/**
 *
 * @param {string} clientId
 * @param {string} scope
 * @returns {Promise<Credentials>}
 */
async function fetchCredentialsUsingCli(clientId, scope) {
  const authUrl = composeAuthUrl(clientId, scope);
  const code = await askForCodeThroughCli(authUrl);
  const credentials = await fetchCredentialsUsingCode(clientId, code);
  return credentials;
}

/**
 *
 * @param {string} authUrl
 * @returns {Promise<string>}
 */
async function askForCodeThroughCli(authUrl) {
  console.log(
    "Authorize this program to access your Hash Code profile by visiting this url:\n",
    bold(authUrl)
  );
  const code = await askQuestionThroughCli(
    "Enter the code from that page here: "
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
