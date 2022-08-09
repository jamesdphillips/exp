import tap from "/app/util/tap";
import { returnable, ReturnablePromise } from "../Promise";

/**
 * PromisedBroadcastStream is the simplest implementation of a broadcast stream
 * a promise is shared between consumer and fulfilled when someone writes.
 */
export class PromisedBroadcastStream<T> {
  #next: ReturnablePromise<T>;

  constructor() {
    this.#next = returnable();
  }

  next() {
    // NOTE: maybe we can switch the implementation on our first read?
    return this.#next.then((value) => ({ value }));
  }

  write(next: T): Promise<void> {
    return tap((resolver) => {
      resolver.resolve(next);
      this.#reset();
    })(this.#next);
  }

  [Symbol.asyncIterator]() {
    return this;
  }

  #reset() {
    this.#next = returnable();
  }
}
