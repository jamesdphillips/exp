import { BroadcastStream, PromisedBroadcastStream } from "../BroadcastStream";

interface Cell<T> {
  get(): Promise<T>;
  set?(_: T): Promise<void>;
}

class MemCell<T> implements Cell<T> {
  #value: T;

  constructor(initial: T) {
    this.#value = initial;
  }

  get() {
    return Promise.resolve(this.#value);
  }

  set(next: T) {
    this.#value = next;
    return Promise.resolve();
  }
}

interface StoredVarConfig<T> {
  stream: BroadcastStream<T>;
  storage: Cell<T>;
}

export class StoredVar<T> {
  readonly config: StoredVarConfig<T>;

  constructor(config: StoredVarConfig<T>) {
    this.config = config;
  }

  get() {
    return this.config.storage.get();
  }

  set(next: T) {
    this.config.storage.set?.(next);
    return this.config.stream.write(next);
  }

  [Symbol.asyncIterator]() {
    return this.config.stream[Symbol.asyncIterator]();
  }
}

/**
 * Produces a new stored variable with given initial state.
 */
export function create<T>(initial: T): StoredVar<T>;
export function create<T>(initial?: T): StoredVar<typeof initial>;
export function create<T>(
  initial: T,
  stream?: BroadcastStream<T>,
): StoredVar<T> {
  return new StoredVar<typeof initial>({
    storage: new MemCell(initial),
    stream: stream ?? new PromisedBroadcastStream(),
  });
}
