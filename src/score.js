import { fetchScoreboard } from "./codeJamApiClient.js";
import env from "./env.js";
import { login } from "./login.js";

async function score() {
  if (!env.token) {
    await login();
  }
  const scoreboard = await fetchScoreboard(env.meta.challengeId, env.token);
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

score().catch(console.error);
