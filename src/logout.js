import { rm } from "fs/promises";
import env from "./env.js";

export async function logout() {
  await rm(env.paths.credentials, { force: true });
  console.log("[petibrugnon] [INFO] Logged out.");
}
