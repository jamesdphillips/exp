/**
 * BroadcastStream is walkie-talkie for you and your friends, anyone one
 * with an instance may broadcast messages to all listeners.
 */
export interface BroadcastStream<T> {
  write(msg: T): Promise<void>;
  next(): Promise<IteratorResult<T>>;
  [Symbol.asyncIterator](): AsyncIterableIterator<T>;
}
