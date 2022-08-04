/**
 * A Var is a BroadcastStream where the last message to the address is stored
 * and made available on demand. There is no requirement that the data is
 * kept in memory, and the Var may defer to another getter.
 */
export interface Var<T> {
  get(): Promise<T>;
  set(nextValue: T): Promise<void>;
  [Symbol.asyncIterator](): AsyncIterableIterator<T>;
}
