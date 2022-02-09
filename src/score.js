import { fetchScoreboard } from "./codeJamApiClient.js";
import env from "./env.js";
import { login } from "./login.js";

export async function score() {
  const accessToken = await login();
  const scoreboard = await fetchScoreboard(env.meta.challengeId, accessToken);
  const competitor = scoreboard.user_scores.find(
    ({ competitor }) => competitor.id === env.meta.competitorId
  );
  console.log(`[petibrugnon] Team: ${competitor.displayname}`);
  console.log(`[petibrugnon] Total Score: ${competitor.score_1}`);
  console.log(`[petibrugnon] Rank: ${competitor.rank}`);
  competitor.task_info[0].score_by_test.forEach((score, testId) => {
    console.log(
      `[petibrugnon] Score for test '${env.meta.tests[testId].name}': ${score}`
    );
  });
}
