import tap from "/app/util/tap";

/**
 * PromisedBroadcastStream is the simplest implementation of a broadcast stream
 * a promise is shared between consumer and fulfilled when someone writes.
 */
export class PromisedBroadcastStream<T> {
  #next: ReturnablePromise<T>;

  constructor() {
    this.#next = createReturnablePromise();
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
    this.#next = createReturnablePromise();
  }
}

interface ReturnablePromise<T> extends Promise<T> {
  resolve(value: T): void;
  reject(reason?: any): void;
}

const voidfn = () => {};

function createReturnablePromise<T>(): ReturnablePromise<T> {
  let resolve: (_: T) => void = voidfn;
  let reject: (_: any) => void = voidfn;
  const promise = new Promise<T>((one, two) => {
    resolve = one;
    reject = two;
  });
  const proxy = new Proxy(promise, {
    get(target, p) {
      switch (p) {
        case "resolve":
          return resolve;
        case "reject":
          return reject;
      }
      return target[p];
    },
  });
  return proxy as ReturnablePromise<T>;
}
