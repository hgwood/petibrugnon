import { mkdir, readdir } from "fs/promises";
import * as path from "path";
import { inspect } from "util";
import { uploadOutput } from "./codeJamApiClient.js";
import env from "./env.js";
import glob from "./wrappers/glob.js";
import { zip } from "./utils/zip.js";
import { login } from "./login.js";

async function upload() {
  if (!env.token) {
    await login();
  }
  const sourceFiles = await glob("**", {
    ignore: [".petibrugnon/**"].concat(env.paths.ignore),
    cwd: env.paths.project,
    nodir: true,
  });
  console.log(
    `[petibrugnon] Zipping ${sourceFiles.length} source files: ${inspect(
      sourceFiles,
      {
        maxArrayLength: 3,
      }
    )}`
  );
  await zip(env.paths.project, sourceFiles, env.paths.sourcesZip);
  const { challengeId, taskId } = env.meta;
  await mkdir(env.paths.outputs, { recursive: true });
  const outputFileNames = await readdir(env.paths.outputs);
  for (const outputFileName of outputFileNames) {
    await uploadOutput(
      challengeId,
      taskId,
      path.resolve(env.paths.outputs, outputFileName),
      env.paths.sourcesZip,
      env.token
    );
    console.log(
      `[petibrugnon] Uploaded output ${path.join(
        env.paths.relative.outputs,
        outputFileName
      )}`
    );
  }
}

upload().catch(console.error);
