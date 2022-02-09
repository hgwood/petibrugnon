import env from "./env.js";
import { buildOAuth2Client } from "./googleOAuth.js";

export async function login() {
  const client = await buildOAuth2Client(
    "226377176553-eaf2qgjej4h7brmra79i2pvf5iir1r2s.apps.googleusercontent.com",
    {
      tokenCachePath: env.paths.credentials,
    }
  );
  env.token = client.credentials.access_token;
}
