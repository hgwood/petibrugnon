export function findCurrentChallenge(adventures) {
  // const editions = adventures.filter(
  //   (adventure) => adventure.competition__str === "HASH_CODE"
  // );
  // return editions
  //   .flatMap(({ challenges, ...edition }) =>
  //     challenges.map((challenge) => ({ ...challenge, edition }))
  //   )
  //   .find(
  //     ({ start_ms: startMs, end_ms: endMs }) =>
  //       startMs < Date.now() && Date.now() < endMs
  //   );
  return adventures
    .filter(({ competition__str }) => competition__str === "HASH_CODE")
    .flatMap(({ challenges }) => challenges)
    .find(
      ({ start_ms: startMs, end_ms: endMs }) =>
        startMs < Date.now() && Date.now() < endMs
    );
}
