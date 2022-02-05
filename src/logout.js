import { rm } from "fs/promises";
import env from "./env.js";
import isMain from "./utils/isMain.js";

async function logout() {
  env.token = null;
  await rm(env.paths.credentials, { force: true });
  console.log("[petibrugnon] [INFO] Logged out.");
}

if (isMain(import.meta)) {
  logout().catch(console.error);
}
