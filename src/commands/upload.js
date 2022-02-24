import { bold, green, red, magenta } from "colorette";
import { mkdir, readdir } from "fs/promises";
import path from "path";
import { setTimeout } from "timers/promises";
import { inspect } from "util";
import {
  fetchAttempts,
  fetchScoreboard,
  uploadOutput,
} from "../codeJamApiClient.js";
import env from "../env.js";
import glob from "../wrappers/glob.js";
import { zip } from "../utils/zip.js";
import { login } from "./login.js";
import { findScores } from "../hashCode.js";

const scoreDiffFormatter = new Intl.NumberFormat(undefined, {
  signDisplay: "always",
});

export async function upload(argv, { logger }) {
  const accessToken = await login(argv, { logger });
  const scoreboardBefore = await fetchScoreboard(
    env.meta.challengeId,
    accessToken
  );
  const scoresBefore = findScores(scoreboardBefore, env.meta.competitorId, {
    testNames: env.meta.tests.map(({ name }) => name),
  });
  const sourceFiles = await glob("**", {
    ignore: [".petibrugnon/**", ".petibrugnonrc.json"].concat(env.paths.ignore),
    cwd: env.paths.project,
    nodir: true,
  });
  logger.info(
    `Zipping ${sourceFiles.length} source files: ${inspect(sourceFiles, {
      maxArrayLength: 3,
      breakLength: Infinity,
    })}`
  );
  await zip(env.paths.project, sourceFiles, env.paths.sourcesZip);
  const { challengeId, taskId } = env.meta;
  await mkdir(env.paths.outputs, { recursive: true });
  const outputFileNames = await readdir(env.paths.outputs);
  const attemptIds = [];
  for (const outputFileName of outputFileNames) {
    const testId = env.inputToTestMapping[outputFileName];
    if (testId === undefined) {
      logger.warn(
        `Cannot find a test matching the output file '${outputFileName}'. This file will not be uploaded.`
      );
      continue;
    }
    await uploadOutput(
      challengeId,
      taskId,
      testId,
      path.resolve(env.paths.outputs, outputFileName),
      env.paths.sourcesZip,
      accessToken
    );
    const logPath = path.join(env.paths.relative.outputs, outputFileName);
    logger.info(
      `Uploaded output '${logPath}' for test '${env.meta.tests[testId].name}'`
    );
    const attemptId = await findAttemptId(
      challengeId,
      taskId,
      testId,
      accessToken
    );
    if (attemptId) {
      attemptIds[testId] = attemptId;
    } else {
      logger.warn(
        `Cannot find the judgement for test '${env.meta.tests[testId].name}'`
      );
    }
  }
  logger.info(`Awaiting judgement`);
  const judgements = await Promise.all(
    attemptIds.map(
      (attemptId) =>
        attemptId && fetchJudgement(challengeId, attemptId, accessToken)
    )
  );
  const scoreboardAfter = await fetchScoreboard(
    env.meta.challengeId,
    accessToken
  );
  const scoresAfter = findScores(scoreboardAfter, env.meta.competitorId, {
    testNames: env.meta.tests.map(({ name }) => name),
  });
  const scoresDiff = {
    totalScore: scoresAfter.totalScore - scoresBefore.totalScore,
    rank: scoresAfter.rank - scoresBefore.rank,
    tests: scoresAfter.tests.map((test, i) => ({
      name: test.name,
      score: test.score - (scoresBefore.tests[i]?.score ?? 0),
    })),
  };
  const totalScoreDiff = scoreDiffFormatter.format(scoresDiff.totalScore);
  const totalScoreColor = diffColor(scoresDiff.totalScore);
  logger.info(
    `Total score: ${bold(magenta(scoresAfter.totalScore))} (${totalScoreColor(
      totalScoreDiff
    )})`
  );
  const rankDiff = scoreDiffFormatter.format(scoresDiff.rank);
  const rankColor = diffColor(scoresDiff.rank);
  logger.info(
    `Rank: ${bold(magenta(scoresAfter.rank))} (${rankColor(rankDiff)})`
  );
  judgements.forEach((judgement, testId) => {
    if (!judgement) {
      logger.error(
        `Cannot find judgement for test '${env.meta.tests[testId].name}'.`
      );
    } else if (judgement.results[0].verdict__str === "CORRECT") {
      const scoreDiff = scoreDiffFormatter.format(
        scoresDiff.tests[testId].score
      );
      const color = diffColor(scoreDiff);
      logger.info(
        `Output for test '${
          env.meta.tests[testId].name
        }' is CORRECT. Score: ${bold(
          magenta(judgement?.results[0].score)
        )} (${color(scoreDiff)}).`
      );
    } else if (judgement.results[0].verdict__str === "WRONG_ANSWER") {
      logger.warn(
        `Output for test '${env.meta.tests[testId].name}' is INCORRECT. Message: '${judgement?.results[0].judge_output}'.`
      );
    } else {
      logger.warn(
        `Unknown judgement value for test '${env.meta.tests[testId].name}': '${judgement?.results[0].verdict__str}'.`
      );
    }
  });
}

/**
 *
 * @param {string} challengeId
 * @param {string} taskId
 * @param {number} testId
 * @param {string} accessToken
 * @returns {Promise<string>}
 */
async function findAttemptId(challengeId, taskId, testId, accessToken) {
  let i = 0;
  let attemptId = null;
  while (!attemptId && i <= 5) {
    const attempts = await fetchAttempts(challengeId, accessToken);
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
    await setTimeout(500);
  }
  return attemptId;
}

/**
 * @param {string} challengeId
 * @param {string} attemptId
 * @param {string} accessToken
 * @returns {Promise<any>}
 */
async function fetchJudgement(challengeId, attemptId, accessToken) {
  let i = 0;
  let judgement = null;
  while (!judgement && i <= 15) {
    const attempts = await fetchAttempts(challengeId, accessToken);
    const attempt = attempts.find(
      ({ id, judgement }) =>
        id === attemptId && judgement?.results[0].status__str === "FINAL"
    );
    judgement = attempt?.judgement;
    i += 1;
    await setTimeout(2000);
  }
  return judgement;
}

function diffColor(scoreDiff) {
  if (scoreDiff > 0) {
    return green;
  } else if (scoreDiff < 0) {
    return red;
  } else {
    return (str) => str;
  }
}
