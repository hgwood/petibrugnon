import * as readline from "readline";
import * as fs from "fs/promises";
import { OAuth2Client } from "google-auth-library";

/**
 * Returns an OAuth 2 client that can be used with Google APIs.
 *
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
 * @typedef {import("google-auth-library").Credentials} Credentials
 *
 * @param {string} clientId
 * @param {string[]} scopes permissions to ask the user for
 * @param {Object} options
 * @param {string} [options.tokenCachePath=token.json] path where the function can cache the token
 * @returns {Promise<OAuth2Client>}
 */
export async function buildOAuth2Client(
  clientId,
  scopes,
  { tokenCachePath = "token.json" } = {}
) {
  const oauth2Client = new OAuth2Client({
    clientId,
    redirectUri: "urn:ietf:wg:oauth:2.0:oob",
  });
  const token = await cacheUsingJsonFile(
    () => acquireTokenUsingCliCode(oauth2Client, scopes),
    tokenCachePath
  );
  oauth2Client.credentials = token;
  return oauth2Client;
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
 * @param {OAuth2Client} oauth2Client
 * @param {string[]} scopes
 * @returns {Promise<Credentials>}
 */
async function acquireTokenUsingCliCode(oauth2Client, scopes) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });
  const code = await askForCodeThroughCli(authUrl);
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
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
