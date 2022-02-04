import { downloadStatementAndInputs } from "./hashCodeJudge.js";
import env from "./env.js";

async function download() {
  await downloadStatementAndInputs(env.directories.stash);
}

download().catch(console.error);
