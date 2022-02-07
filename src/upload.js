import { mkdir, readdir } from "fs/promises";
import * as path from "path";
import { inspect } from "util";
import { fetchAttempts, uploadOutput } from "./codeJamApiClient.js";
import env from "./env.js";
import glob from "./wrappers/glob.js";
import { zip } from "./utils/zip.js";
import { login } from "./login.js";
import { sleep } from "./utils/sleep.js";

export async function upload() {
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
  const attemptIds = [];
  for (const outputFileName of outputFileNames) {
    const testId = env.inputToTestMapping[outputFileName];
    if (testId === undefined) {
      console.warn(
        `[petibrugnon] [WARN] Cannot find a test matching the output file '${outputFileName}'. This file will not be uploaded.`
      );
      continue;
    }
    await uploadOutput(
      challengeId,
      taskId,
      testId,
      path.resolve(env.paths.outputs, outputFileName),
      env.paths.sourcesZip,
      env.token
    );
    const logPath = path.join(env.paths.relative.outputs, outputFileName);
    console.log(
      `[petibrugnon] Uploaded output '${logPath}' for test '${env.meta.tests[testId].name}'`
    );
    const attemptId = await findAttemptId(challengeId, taskId, testId);
    if (attemptId) {
      attemptIds[testId] = attemptId;
    } else {
      console.warn(
        `[petibrugnon] [WARN] Cannot find the judgement for test '${env.meta.tests[testId].name}'.`
      );
    }
  }
  console.log(`[petibrugnon] Awaiting judgement.`);
  const judgements = await Promise.all(
    attemptIds.map(
      (attemptId) => attemptId && fetchJudgement(challengeId, attemptId)
    )
  );
  judgements.forEach((judgement, testId) => {
    if (!judgement) {
      console.error(
        `[petibrugnon] [WARN] Cannot find judgement for test '${env.meta.tests[testId].name}'.`
      );
    } else if (judgement.results[0].verdict__str === "CORRECT") {
      console.log(
        `[petibrugnon] Output for test '${env.meta.tests[testId].name}' is CORRECT. Score: ${judgement?.results[0].score}.`
      );
    } else if (judgement.results[0].verdict__str === "WRONG_ANSWER") {
      console.log(
        `[petibrugnon] Output for test '${env.meta.tests[testId].name}' is INCORRECT. Message: '${judgement?.results[0].judge_output}'.`
      );
    } else {
      console.error(
        `[petibrugnon] [WARN] Judgement for test '${env.meta.tests[testId].name}' is: '${judgement?.results[0].verdict__str}'.`
      );
    }
  });
}

async function findAttemptId(challengeId, taskId, testId) {
  let i = 0;
  let attemptId = null;
  while (!attemptId && i <= 5) {
    const attempts = await fetchAttempts(challengeId, env.token);
    // NOTE: The most recent attempt that matches the test and the task, and
    // that hasn't been judged yet, is selected. This makes assumptions:
    //
    // - The most recent attempt is the one this program just submitted. This
    //   could be false in case of concurrent submissions.
    // - The attempt hasn't been judged yet. This could be false if judgement is
    //   very fast or this program is very slow.
    //
    // I don't like those assumptions, but I can't find any better way to do it.
    const attempt = attempts.find(
      ({ for_test, task_id, judgement }) =>
        for_test === testId &&
        task_id === taskId &&
        judgement?.results[0].status__str !== "FINAL"
    );
    attemptId = attempt?.id;
    i += 1;
    await sleep(500);
  }
  return attemptId;
}

async function fetchJudgement(challengeId, attemptId) {
  let i = 0;
  let judgement = null;
  while (!judgement && i <= 15) {
    const attempts = await fetchAttempts(challengeId, env.token);
    const attempt = attempts.find(
      ({ id, judgement }) =>
        id === attemptId && judgement?.results[0].status__str === "FINAL"
    );
    judgement = attempt?.judgement;
    i += 1;
    await sleep(2000);
  }
  return judgement;
}
