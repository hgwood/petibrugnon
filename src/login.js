import env from "./env.js";
import { authenticate } from "./googleOAuth.js";

export async function login() {
  const accessToken = await authenticate(
    "226377176553-eaf2qgjej4h7brmra79i2pvf5iir1r2s.apps.googleusercontent.com",
    {
      tokenCachePath: env.paths.credentials,
    }
  );
  env.token = accessToken;
}
