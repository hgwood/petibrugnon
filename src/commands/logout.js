import { revokeAuthorization } from "../authorization/authorize.js";
import env from "../env.js";

export async function logout(argv, { logger }) {
  await revokeAuthorization({ cacheFilePath: env.paths.credentials });
  logger.info("Logged out");
}
