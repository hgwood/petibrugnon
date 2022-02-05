import events from "events";

/**
 * Same as events.on, but stops waiting for new events after the endEvent has
 * been emitted.
 *
 * @param {events.EventEmitter} emitter
 * @param {string} eventName
 * @param {string} endEventName
 */
export async function* onEventUntil(emitter, eventName, endEventName) {
  const abort = new AbortController();
  const iterator = events.on(emitter, eventName, { signal: abort.signal });
  emitter.once(endEventName, () => {
    abort.abort();
  });
  try {
    for await (const event of iterator) {
      yield event;
    }
  } catch (err) {
    if (!(err instanceof Error) || err.name !== "AbortError") {
      throw err;
    }
  }
}
