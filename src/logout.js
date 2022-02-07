import { rm } from "fs/promises";
import env from "./env.js";

export async function logout() {
  env.token = null;
  await rm(env.paths.credentials, { force: true });
  console.log("[petibrugnon] [INFO] Logged out.");
}
