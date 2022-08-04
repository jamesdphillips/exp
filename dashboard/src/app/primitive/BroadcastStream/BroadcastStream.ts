/**
 * BroadcastStream is walkie-talkie for you and your friends, where anyone one
 * with an instance may listen in and broadcast messages to all consumers.
 */
export interface BroadcastStream<T> {
  write(msg: T): Promise<void>;
  next(): Promise<IteratorResult<T>>;
  [Symbol.asyncIterator](): AsyncIterableIterator<T>;
}
