import { fetch } from "undici";

/**
 * @module googleOAuth2
 *
 * Implements the Google OAuth 2.0 protocol for native apps.
 *
 * @see https://developers.google.com/identity/protocols/oauth2/native-app
 */

/**
 * @const {string} special redirect URI value for native apps
 * @see https://developers.google.com/identity/protocols/oauth2/native-app#step-2:-send-a-request-to-googles-oauth-2.0-server
 */
const REDIRECT_URI = "urn:ietf:wg:oauth:2.0:oob";

/**
 * @see https://developers.google.com/identity/protocols/oauth2/native-app#step-2:-send-a-request-to-googles-oauth-2.0-server
 * @param {string} clientId
 * @param {string} scope
 * @returns {string}
 */
export function composeAuthUrl(clientId, scope) {
  const query = new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope
  }).toString();
  return `https://accounts.google.com/o/oauth2/v2/auth?${query}`;
}

/**
 * @see https://developers.google.com/identity/protocols/oauth2/native-app#exchange-authorization-code
 * @param {string} clientId
 * @param {string} code
 * @returns {Promise<Credentials>}
 */
export async function fetchCredentialsUsingCode(clientId, code) {
  return fetchCredentials({
    client_id: clientId,
    code,
    grant_type: "authorization_code",
    redirect_uri: REDIRECT_URI,
  });
}

/**
 * @see https://developers.google.com/identity/protocols/oauth2/native-app#offline
 * @param {string} clientId
 * @param {string} refreshToken
 * @returns {Promise<Credentials>}
 */
export async function fetchCredentialsUsingRefreshToken(
  clientId,
  refreshToken
) {
  const refreshedCredentials = await fetchCredentials({
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
 * @returns {Promise<Credentials>}
 */
async function fetchCredentials(params) {
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
      `Cannot fetch credentials from Google OAuth2 services: ${responseJson.error_description} (${responseJson.error})`
    );
  }
  return {
    accessToken: responseJson.access_token,
    refreshToken: responseJson.refresh_token,
    expiresAt: responseJson.expires_in * 1000 + Date.now(),
  };
}
