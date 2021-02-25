import * as http from "http";
import * as https from "https";
import { parseAsText } from "./streams.js";
import { debuglog } from "util";

const log = debuglog("HTTP_CLIENT");

/**
 *
 * @param {string} url
 * @param {http.RequestOptions} options
 * @param {string=} body
 * @returns {Promise<http.IncomingMessage>}
 */
export function httpRequest(url, options, body) {
  const effectiveOptions = body
    ? {
        ...options,
        headers: {
          ...options.headers,
          "Content-Length": Buffer.byteLength(body),
        },
      }
    : options;
  return new Promise((resolve, reject) => {
    const httpModule = url.toString().startsWith("https") ? https : http;
    const req = httpModule.request(url, effectiveOptions, async (res) => {
      const statusCode = res.statusCode ?? 0;
      log(`${req.method} ${url} => ${statusCode}`);
      if (statusCode >= 200 && statusCode < 400) {
        resolve(res);
      } else {
        reject(await httpError(res, url, options));
      }
    });
    req.on("error", reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

/**
 *
 * @param {http.IncomingMessage} res
 * @param {URL | string} url
 * @param {http.RequestOptions} requestOptions
 * @returns {Promise<Error>}
 */
async function httpError(res, url, requestOptions) {
  const body = await parseAsText(res);
  return Object.assign(
    new Error(`Errors in HTTP response from ${url.toString()}`),
    {
      url: url.toString(),
      method: requestOptions.method || "GET",
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      body,
    }
  );
}
