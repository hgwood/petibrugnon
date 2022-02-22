export function findCurrentChallenge(adventures) {
  return adventures
    .filter(({ competition__str }) => competition__str === "HASH_CODE")
    .flatMap(({ challenges }) => challenges)
    .find(
      ({ start_ms: startMs, end_ms: endMs }) =>
        startMs < Date.now() && Date.now() < endMs
    );
}

/**
 *
 * @param {*} scoreboard
 * @param {string} competitorId
 * @param {{ testNames: string[] }} options
 */
export function findScores(scoreboard, competitorId, { testNames }) {
  const competitor = scoreboard.user_scores.find(
    ({ competitor }) => competitor.id === competitorId
  );
  return {
    teamName: competitor.displayname,
    totalScore: competitor.score_1,
    rank: competitor.rank,
    tests: competitor.task_info[0].score_by_test.map((score, testId) => ({
      id: testId,
      name: testNames?.[testId],
      score,
    })),
  };
}
