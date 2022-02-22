import { bold, blue } from "colorette";
import { fetchScoreboard } from "../codeJamApiClient.js";
import env from "../env.js";
import { findScores } from "../hashCode.js";
import { login } from "./login.js";

export async function score() {
  const accessToken = await login();
  const scoreboard = await fetchScoreboard(env.meta.challengeId, accessToken);
  const { teamName, totalScore, rank, tests } = findScores(
    scoreboard,
    env.meta.competitorId,
    { testNames: env.meta.tests.map(({ name }) => name) }
  );
  console.log(`Team: ${bold(blue(teamName))}`);
  console.log(`Total Score: ${bold(blue(totalScore))}`);
  console.log(`Rank: ${bold(blue(rank))}`);
  tests.forEach(({ name, score }) => {
    console.log(`Score for test '${name}': ${bold(blue(score))}`);
  });
}
