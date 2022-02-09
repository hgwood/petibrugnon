import * as assert from "assert";
import * as readline from "readline";
import { fetch } from "undici";
import { cached, jsonFile } from "./utils/cache/cache.js";

/**
 * Authenticates to Google APIs using the specified OAuth 2.0 client ID.
 *
 * This function is interactive and is meant to be used on a CLI. It
 * authenticate the client by generating an URL and displaying it to the user,
 * expecting them visit the URL to login into a Google account and authorize the
 * program to access their data. Once the user is logged in, their are given a
 * code to copy back into the CLI.
 *
 * This function caches the resulting credentials (access token and refresh
 * token) in a file to reuse them for future API calls. If the access token
 * expires, the refresh token is used to get a new access token.
 *
 * @param {string} clientId
 * @param {{ cacheFilePath: string }} options
 * @returns {Promise<string>} the access token
 */
export async function authorize(clientId, { cacheFilePath }) {
  const { accessToken } = await cached(jsonFile(cacheFilePath), {
    refresh(credentials) {
      return credentials?.refreshToken
        ? exchangeRefreshTokenForAccessToken(clientId, credentials.refreshToken)
        : acquireCredentialsUsingCli(clientId);
    },
    isStale({ accessToken, expiresAt }) {
      return !accessToken || new Date(expiresAt) <= new Date();
    },
  });
  assert.ok(accessToken, "no access token after authentication");
  return accessToken;
}

/**
 *
 * @param {string} clientId
 * @returns {Promise<any>}
 */
async function acquireCredentialsUsingCli(clientId) {
  const authUrl = composeAuthUrl(clientId);
  const code = await askForCodeThroughCli(authUrl);
  const credentials = await exchangeCodeForAccessToken(clientId, code);
  return credentials;
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

/**
 *
 * @param {string} clientId
 * @param {string} code
 * @returns {Promise<any>}
 */
async function exchangeCodeForAccessToken(clientId, code) {
  return fetchAccessToken({
    client_id: clientId,
    code,
    grant_type: "authorization_code",
    redirect_uri: "urn:ietf:wg:oauth:2.0:oob",
  });
}

/**
 *
 * @param {string} clientId
 * @param {string} refreshToken
 * @returns {Promise<any>}
 */
async function exchangeRefreshTokenForAccessToken(clientId, refreshToken) {
  const refreshedCredentials = await fetchAccessToken({
    client_id: clientId,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });
  return {
    ...refreshedCredentials,
    refreshToken,
  };
}

/**
 *
 * @param {{ [key: string]: string }} params
 * @returns {Promise<any>}
 */
async function fetchAccessToken(params) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params),
  });
  /** @type {any} */
  const responseJson = await response.json();
  if (responseJson.error) {
    throw new Error(
      `Cannot fetch token from Google OAuth2 services: ${responseJson.error_description} (${responseJson.error})`
    );
  }
  return {
    accessToken: responseJson.access_token,
    refreshToken: responseJson.refresh_token,
    expiresAt: responseJson.expires_in * 1000 + Date.now(),
  };
}
