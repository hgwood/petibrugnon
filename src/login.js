import env from "./env.js";
import { authorize } from "./authorization/authorize.js";

export async function login() {
  const accessToken = await authorize(
    "226377176553-eaf2qgjej4h7brmra79i2pvf5iir1r2s.apps.googleusercontent.com",
    "https://www.googleapis.com/auth/codejam",
    {
      cacheFilePath: env.paths.credentials,
    }
  );
  return accessToken;
}
