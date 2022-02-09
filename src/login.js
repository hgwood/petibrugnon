import env from "./env.js";
import { authorize } from "./googleOAuth2.js";

export async function login() {
  const accessToken = await authorize(
    "226377176553-eaf2qgjej4h7brmra79i2pvf5iir1r2s.apps.googleusercontent.com",
    {
      cacheFilePath: env.paths.credentials,
    }
  );
  return accessToken;
}
