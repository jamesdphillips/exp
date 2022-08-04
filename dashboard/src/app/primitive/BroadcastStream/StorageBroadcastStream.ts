import { PromisedBroadcastStream } from "./PromisedBroadcastStream";
import { BroadcastStream } from "./BroadcastStream";
import StorageEventListener from "/app/util/StorageEventListener";

export interface StorageBroadcastStreamConfig {
  storage: Storage;
  key: string;
  stream?: BroadcastStream<StorageValue>;
}

type StorageValue = string | null;

export class StorageBroadcastStream {
  readonly config: StorageBroadcastStreamConfig;
  readonly stream: BroadcastStream<StorageValue>;

  constructor(config: StorageBroadcastStreamConfig) {
    this.config = config;
    this.stream = config.stream || new PromisedBroadcastStream();
  }

  next() {
    const { storage, key } = this.config;

    return Promise.any([
      StorageEventListener.listen(storage, key)
        .next()
        .then((value) => ({ value } as IteratorResult<StorageValue>)),
      this.stream.next(),
    ]);
  }

  write(next: StorageValue): Promise<void> {
    if (next !== null) {
      this.config.storage.setItem(this.config.key, next);
    } else {
      this.config.storage.removeItem(this.config.key);
    }
    // notify local users
    this.stream.write(next);
    return Promise.resolve();
  }

  [Symbol.asyncIterator]() {
    return this;
  }
}
