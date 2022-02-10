import { revokeAuthorization } from "./authorization/authorize.js";
import env from "./env.js";

export async function logout() {
  await revokeAuthorization({ cacheFilePath: env.paths.credentials });
  console.log("[petibrugnon] [INFO] Logged out.");
}
