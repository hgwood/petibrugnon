import env from "../env.js";
import { authorize } from "../authorization/authorize.js";

export async function login(argv, { logger }) {
  const accessToken = await authorize(
    argv.googleOauthClientId,
    "https://www.googleapis.com/auth/codejam",
    {
      cacheFilePath: env.paths.credentials,
    }
  );
  return accessToken;
}
