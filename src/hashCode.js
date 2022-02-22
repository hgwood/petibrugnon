export function findCurrentChallenge(adventures) {
  return adventures
    .filter(({ competition__str }) => competition__str === "HASH_CODE")
    .flatMap(({ challenges }) => challenges)
    .find(
      ({ start_ms: startMs, end_ms: endMs }) =>
        startMs < Date.now() && Date.now() < endMs
    );
}
